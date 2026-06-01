const socket = io();

// --- GLOBALS ---
let currentPin = null;
let allQuizzes = [];

// Éléments du DOM
const selectionSection = document.getElementById('selection-section');
const creationSection = document.getElementById('creation-section');
const lobbySection = document.getElementById('lobby-section');
const gameSection = document.getElementById('game-section');

// Capture les erreurs JS pour debug
window.onerror = function(msg, url, lineNo, columnNo, error) {
    alert("ERREUR JS : " + msg + "\nLigne : " + lineNo);
    return false;
};

// --- 1. CHARGEMENT DES QUIZ ---
async function loadQuizzes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/quizzes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        allQuizzes = await response.json();
        document.getElementById('quiz-count').textContent = allQuizzes.length;
        renderQuizList();
    } catch (error) {
        console.error("Erreur chargement quiz:", error);
    }
}

function renderQuizList() {
    const container = document.getElementById('quiz-list');
    container.innerHTML = '';
    allQuizzes.forEach(quiz => {
        const div = document.createElement('div');
        div.className = 'quiz-item';
        div.style.padding = "15px";
        div.style.margin = "10px 0";
        div.style.background = "rgba(255,255,255,0.05)";
        div.style.borderRadius = "10px";
        div.innerHTML = `
            <h3>${quiz.titre}</h3>
            <p>${quiz.questions.length} question(s)</p>
            <button class="btn-action btn-small" onclick="selectQuiz('${quiz.id}')">Lancer ce Quiz</button>
        `;
        container.appendChild(div);
    });
}

window.selectQuiz = function(quizId) {
    const quiz = allQuizzes.find(q => q.id === quizId);
    if (quiz) {
        console.log("Lancement du quiz :", quiz.titre);
        socket.emit('host_create_game', quiz);
    }
};

// --- 2. CRÉATION D'UN QUIZ ---
let tempQuestions = [];

document.getElementById('btn-show-create').onclick = () => {
    selectionSection.classList.add('hidden');
    creationSection.classList.remove('hidden');
    tempQuestions = [];
    document.getElementById('question-counter').textContent = "0";
};

document.getElementById('btn-add-question').onclick = () => {
    const questionData = {
        texte: document.getElementById('question').value,
        timer: parseInt(document.getElementById('timer').value) || 20,
        reponses: [
            document.getElementById('reponse-a').value,
            document.getElementById('reponse-b').value,
            document.getElementById('reponse-c').value,
            document.getElementById('reponse-d').value
        ],
        bonneReponse: document.getElementById('bonne-reponse').value
    };

    if (!questionData.texte || questionData.reponses.some(r => !r)) {
        alert("Veuillez remplir la question et toutes les réponses !");
        return;
    }

    tempQuestions.push(questionData);
    document.getElementById('question-counter').textContent = tempQuestions.length;

    // Reset les champs pour la question suivante
    document.getElementById('question').value = '';
    document.getElementById('reponse-a').value = '';
    document.getElementById('reponse-b').value = '';
    document.getElementById('reponse-c').value = '';
    document.getElementById('reponse-d').value = '';
    
    alert("Question ajoutée !");
};

document.getElementById('btn-cancel-create').onclick = () => {
    creationSection.classList.add('hidden');
    selectionSection.classList.remove('hidden');
};

document.getElementById('btn-save-quiz').onclick = async () => {
    try {
        const titre = document.getElementById('titre-quiz').value;
        
        if (!titre) {
            alert("Veuillez donner un titre à votre quiz !");
            return;
        }

        if (tempQuestions.length === 0) {
            alert("Veuillez ajouter au moins une question en cliquant sur 'Ajouter cette question' avant d'enregistrer !");
            return;
        }

        const quizData = {
            titre: titre,
            questions: tempQuestions
        };

        console.log("Tentative d'enregistrement du quiz :", quizData);

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Session expirée. Veuillez vous reconnecter.");
            window.location.href = '/login.html';
            return;
        }

        const res = await fetch('/api/quizzes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quizData)
        });

        if (res.ok) {
            alert("Quiz enregistré avec succès !");
            await loadQuizzes();
            creationSection.classList.add('hidden');
            selectionSection.classList.remove('hidden');
        } else {
            const errData = await res.json();
            alert("Erreur lors de l'enregistrement : " + (errData.message || res.statusText));
        }
    } catch (error) {
        console.error("Erreur critique enregistrement:", error);
        alert("Erreur de connexion au serveur.");
    }
};

// --- 3. GESTION DU SALON (LOBBY) ---
socket.on('game_created', (data) => {
    currentPin = data.pin;
    document.getElementById('display-pin').textContent = currentPin;
    selectionSection.classList.add('hidden');
    lobbySection.classList.remove('hidden');
    console.log("Salon ouvert. PIN :", currentPin);
});

socket.on('player_list_update', (players) => {
    const list = document.getElementById('player-list');
    document.getElementById('player-count').textContent = players.length;
    list.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.pseudo;
        list.appendChild(li);
    });
});

// --- 4. LE BOUTON CRITIQUE : COMMENCER LA PARTIE ---
window.demarrerLaPartie = function() {
    console.log("Appel de demarrerLaPartie(). PIN :", currentPin);
    if (!currentPin) {
        alert("Erreur fatale : Aucun code PIN n'est défini !");
        return;
    }
    socket.emit('host_start_game', { pin: currentPin });
};

// Bouton pour passer à la question suivante
window.prochaineQuestion = function() {
    socket.emit('host_next_question', { pin: currentPin });
};

// --- 5. DÉROULEMENT DU JEU ---
let timerInterval;

socket.on('game_started', (data) => {
    showQuestion(data);
});

socket.on('next_question', (data) => {
    showQuestion(data);
});

function showQuestion(data) {
    console.log("Nouvelle question reçue :", data.question);
    lobbySection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    document.getElementById('display-question').textContent = data.question;
    document.getElementById('responses-count').textContent = `Réponses : 0 / ${data.totalPlayers || 0}`;
    
    // Affichage des textes des réponses
    if (data.answers) {
        document.getElementById('answer-0-text').textContent = data.answers[0] || '';
        document.getElementById('answer-1-text').textContent = data.answers[1] || '';
        document.getElementById('answer-2-text').textContent = data.answers[2] || '';
        document.getElementById('answer-3-text').textContent = data.answers[3] || '';
    }

    // Gestion du timer
    clearInterval(timerInterval);
    let timeLeft = data.timer;
    const timerEl = document.getElementById('game-timer');
    timerEl.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // On affiche le bouton "Suivant" quand le temps est fini
            showNextButton();
        }
    }, 1000);

    // Cacher le bouton suivant au début d'une question
    const nextBtn = document.getElementById('btn-next-question');
    if (nextBtn) nextBtn.classList.add('hidden');
}

function showNextButton() {
    let nextBtn = document.getElementById('btn-next-question');
    if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.id = 'btn-next-question';
        nextBtn.className = 'btn-action';
        nextBtn.style.marginTop = '20px';
        nextBtn.textContent = "Question Suivante";
        nextBtn.onclick = prochaineQuestion;
        gameSection.appendChild(nextBtn);
    }
    nextBtn.classList.remove('hidden');
}

socket.on('update_response_count', (data) => {
    document.getElementById('responses-count').textContent = `Réponses : ${data.answered} / ${data.total}`;
    
    // Si tout le monde a répondu, on peut arrêter le chrono (optionnel)
    if (data.answered >= data.total && data.total > 0) {
        clearInterval(timerInterval);
        document.getElementById('game-timer').textContent = "Terminé !";
        showNextButton();
    }
});

socket.on('quiz_ended', (data) => {
    clearInterval(timerInterval);
    gameSection.innerHTML = `
        <header><h1 class="titre">Fin du Quiz !</h1></header>
        <div class="form-container">
            <h2>Classement Final</h2>
            <ul id="final-ranking"></ul>
            <button class="btn-action" onclick="window.location.reload()">Retour à l'accueil</button>
        </div>
    `;
    const list = document.getElementById('final-ranking');
    data.leaderboard.sort((a, b) => b.score - a.score).forEach((p, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${p.pseudo} - ${p.score} pts`;
        list.appendChild(li);
    });
});

// Lancement initial
loadQuizzes();