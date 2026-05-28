const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Définition du port (par défaut 3000 si le fichier .env n'est pas lu)
const PORT = process.env.PORT || 3000;

// 1. SERVIR LES FICHIERS DU DOSSIER CLIENT (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../client')));

// 2. STOCKAGE TEMPORAIRE DE LA PARTIE (En mémoire vive)
let gameState = {
    pin: null,
    hostSocketId: null,
    players: [], // Liste des objets { id, pseudo, score }
    currentQuiz: null
};

// Fonction pour générer un code PIN aléatoire à 6 chiffres
function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 3. GESTION DES CONNEXIONS WEBSOCKETS (TEMPS RÉEL)
io.on('connection', (socket) => {
    console.log(`🔌 Nouvelle connexion établie : ${socket.id}`);

    // --- ÉVÉNEMENT 1 : L'animateur crée la partie (depuis host.html) ---
    socket.on('host_create_game', (quizData) => {
        gameState.pin = generatePIN();
        gameState.hostSocketId = socket.id;
        gameState.currentQuiz = quizData;
        gameState.players = []; // On vide les joueurs si ancienne partie

        console.log(`🎮 Partie créée par le Host. PIN : ${gameState.pin}`);
        
        // On renvoie le code PIN généré à l'animateur
        socket.emit('game_created', { pin: gameState.pin });
    });

    // --- ÉVÉNEMENT 2 : Un joueur tente de rejoindre (depuis index.html) ---
    socket.on('player_join_game', ({ pin, pseudo }) => {
        // Validation basique du PIN
        if (pin !== gameState.pin) {
            return socket.emit('join_error', 'Code PIN invalide !');
        }
        
        // Création du joueur et ajout à la liste
        const newPlayer = {
            id: socket.id,
            pseudo: pseudo,
            score: 0
        };
        gameState.players.push(newPlayer);

        // Le joueur rejoint une "room" Git spécifique liée au PIN de la partie
        socket.join(gameState.pin);

        console.log(`🙋‍♂️ Joueur "${pseudo}" a rejoint le salon ${gameState.pin}`);

        // On confirme au joueur que c'est bon
        socket.emit('join_success', { pseudo: pseudo });

        // On prévient l'animateur qu'un nouveau joueur est là pour l'afficher à l'écran
        if (gameState.hostSocketId) {
            io.to(gameState.hostSocketId).emit('player_list_update', gameState.players);
        }
    });

    // --- ÉVÉNEMENT 3 : Déconnexion ---
    socket.on('disconnect', () => {
        console.log(`❌ Déconnexion : ${socket.id}`);
        
        // Si c'est le host qui part, on peut reset la partie
        if (socket.id === gameState.hostSocketId) {
            console.log('⚠️ Le Host s\'est déconnecté. Fermeture de la partie.');
            io.to(gameState.pin).emit('game_terminated', 'L\'animateur a quitté la partie.');
            gameState = { pin: null, hostSocketId: null, players: [], currentQuiz: null };
        } else {
            // Si c'est un joueur, on le retire du tableau
            gameState.players = gameState.players.filter(p => p.id !== socket.id);
            // On met à jour l'écran du host
            if (gameState.hostSocketId) {
                io.to(gameState.hostSocketId).emit('player_list_update', gameState.players);
            }
        }
    });
});

// 4. LANCEMENT DU SERVEUR
server.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur : http://localhost:${PORT}`);
});