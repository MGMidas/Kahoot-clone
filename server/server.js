const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const authMiddleware = require('./middleware/authMiddleware');

const fs = require('fs');
const quizFile = path.join(__dirname, 'data/quizzes.json');

// Route pour enregistrer un quiz
app.post('/api/quizzes', authMiddleware, async (req, res) => {
    try {
        const newQuiz = req.body;
        let quizzes = [];
        
        if (fs.existsSync(quizFile)) {
            const data = await fs.promises.readFile(quizFile, 'utf8');
            quizzes = JSON.parse(data);
        }

        newQuiz.id = Date.now().toString(); // ID unique simple
        newQuiz.userId = req.user.id; // Associer le quiz à l'utilisateur connecté
        quizzes.push(newQuiz);
        
        await fs.promises.writeFile(quizFile, JSON.stringify(quizzes, null, 2));
        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la sauvegarde du quiz." });
    }
});

// Route pour récupérer les quiz de l'utilisateur connecté
app.get('/api/quizzes', authMiddleware, async (req, res) => {
    try {
        if (!fs.existsSync(quizFile)) return res.json([]);
        const data = await fs.promises.readFile(quizFile, 'utf8');
        const allQuizzes = JSON.parse(data);
        
        // Filtrer les quiz pour ne renvoyer que ceux de l'utilisateur
        const userQuizzes = allQuizzes.filter(q => q.userId === req.user.id);
        res.json(userQuizzes);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des quiz." });
    }
});

// Définition du port (par défaut 3000 si le fichier .env n'est pas lu)
const PORT = process.env.PORT || 3000;

// 1. SERVIR LES FICHIERS DU DOSSIER CLIENT (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../client')));

// 2. STOCKAGE DES PARTIES EN COURS (Supporte plusieurs parties simultanées)
const games = {}; 

// Fonction pour générer un code PIN unique à 6 chiffres
function generatePIN() {
    let pin;
    do {
        pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (games[pin]); // S'assure que le PIN n'est pas déjà utilisé
    return pin;
}

// 3. GESTION DES CONNEXIONS WEBSOCKETS (TEMPS RÉEL)
io.on('connection', (socket) => {
    console.log(`🔌 Nouvelle connexion établie : ${socket.id}`);

    // --- ÉVÉNEMENT 1 : L'animateur crée la partie (depuis host.html) ---
    socket.on('host_create_game', (quizData) => {
        const pin = generatePIN();
        
        games[pin] = {
            pin: pin,
            hostSocketId: socket.id,
            players: [], // Liste des objets { id, pseudo, score }
            currentQuiz: quizData,
            status: 'waiting' // lobby
        };

        socket.join(pin); // L'animateur rejoint la room de sa partie

        console.log(`🎮 Partie créée par le Host. PIN : ${pin}`);
        
        // On renvoie le code PIN généré à l'animateur
        socket.emit('game_created', { pin: pin });
    });

    // --- ÉVÉNEMENT 2 : Un joueur tente de rejoindre (depuis index.html) ---
    socket.on('player_join_game', ({ pin, pseudo }) => {
        const game = games[pin];

        // Validation du PIN et du pseudo
        if (!game) {
            return socket.emit('join_error', 'Code PIN invalide !');
        }

        if (game.players.find(p => p.pseudo === pseudo)) {
            return socket.emit('join_error', 'Ce pseudo est déjà pris dans cette partie.');
        }
        
        // Création du joueur et ajout à la liste
        const newPlayer = {
            id: socket.id,
            pseudo: pseudo,
            score: 0,
            pin: pin // On garde le PIN pour savoir quelle partie quitter à la déconnexion
        };
        game.players.push(newPlayer);

        // Le joueur rejoint la "room" liée au PIN
        socket.join(pin);

        console.log(`🙋‍♂️ Joueur "${pseudo}" a rejoint le salon ${pin}`);

        // On confirme au joueur que c'est bon
        socket.emit('join_success', { pseudo: pseudo, pin: pin });

        // On prévient l'animateur qu'un nouveau joueur est là
        io.to(game.hostSocketId).emit('player_list_update', game.players);
    });

    // --- ÉVÉNEMENT 3 : L'animateur lance la partie ---
    socket.on('host_start_game', ({ pin }) => {
        console.log(`📩 Reçu host_start_game pour le PIN : ${pin}`);
        const game = games[pin];
        
        if (!game) {
            console.log(`❌ Erreur : La partie ${pin} n'existe pas.`);
            return;
        }

        if (socket.id !== game.hostSocketId) {
            console.log(`❌ Erreur : Socket ID mismatch. Attendu : ${game.hostSocketId}, Reçu : ${socket.id}`);
            return;
        }

        game.status = 'playing';
        game.currentQuestionIndex = 0;
        
        const question = game.currentQuiz.questions[0];
        console.log(`🚀 La partie ${pin} commence avec la question : ${question.texte}`);
        
        io.to(pin).emit('game_started', { 
            question: question.texte,
            answers: question.reponses,
            timer: question.timer,
            totalPlayers: game.players.length
        });
    });

    // --- ÉVÉNEMENT 4 : Passer à la question suivante ---
    socket.on('host_next_question', ({ pin }) => {
        const game = games[pin];
        if (!game || socket.id !== game.hostSocketId) return;

        game.currentQuestionIndex++;
        
        if (game.currentQuestionIndex < game.currentQuiz.questions.length) {
            // Reset des flags de réponse pour la nouvelle question
            game.players.forEach(p => p.hasAnswered = false);
            
            const question = game.currentQuiz.questions[game.currentQuestionIndex];
            
            io.to(pin).emit('next_question', {
                question: question.texte,
                answers: question.reponses,
                timer: question.timer,
                totalPlayers: game.players.length
            });
        } else {
            // Fin du quiz
            game.status = 'finished';
            const leaderboard = game.players.map(p => ({ pseudo: p.pseudo, score: p.score }));
            io.to(pin).emit('quiz_ended', { leaderboard });
        }
    });

    // --- ÉVÉNEMENT 5 : Un joueur soumet une réponse ---
    socket.on('player_submit_answer', ({ pin, answerIndex }) => {
        const game = games[pin];
        if (!game || game.status !== 'playing') return;

        const player = game.players.find(p => p.id === socket.id);
        if (!player || player.hasAnswered) return; // Un seul essai par question

        const question = game.currentQuiz.questions[game.currentQuestionIndex];
        const isCorrect = answerIndex.toString() === question.bonneReponse.toString();

        player.hasAnswered = true;
        if (isCorrect) {
            player.score += 100; // Système de points simple pour l'instant
        }

        // On envoie le résultat immédiatement au joueur
        socket.emit('answer_result', { 
            isCorrect: isCorrect, 
            correctAnswerIndex: question.bonneReponse 
        });

        // On prévient le host qu'une réponse de plus est arrivée
        const totalAnswered = game.players.filter(p => p.hasAnswered).length;
        io.to(game.hostSocketId).emit('update_response_count', {
            answered: totalAnswered,
            total: game.players.length
        });
    });

    // --- ÉVÉNEMENT 5 : Fin du temps (par le host) ---
    socket.on('host_time_up', ({ pin }) => {
        const game = games[pin];
        if (game) {
            // Reset des flags pour la prochaine question
            game.players.forEach(p => p.hasAnswered = false);
            console.log(`⏰ Temps écoulé pour la partie ${pin}`);
        }
    });

    // --- ÉVÉNEMENT 6 : Déconnexion ---
    socket.on('disconnect', () => {
        console.log(`❌ Déconnexion : ${socket.id}`);
        
        // Chercher si c'est un host ou un joueur d'une des parties
        for (const pin in games) {
            const game = games[pin];

            if (socket.id === game.hostSocketId) {
                console.log(`⚠️ Le Host de la partie ${pin} s'est déconnecté.`);
                io.to(pin).emit('game_terminated', 'L\'animateur a quitté la partie.');
                delete games[pin]; // On supprime la partie
                break;
            } else {
                const playerIndex = game.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    const player = game.players[playerIndex];
                    game.players.splice(playerIndex, 1);
                    console.log(`🏃 Joueur "${player.pseudo}" a quitté la partie ${pin}`);
                    
                    // On met à jour l'écran du host
                    io.to(game.hostSocketId).emit('player_list_update', game.players);
                    break;
                }
            }
        }
    });
});

// 4. LANCEMENT DU SERVEUR
server.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur : http://localhost:${PORT}`);
});