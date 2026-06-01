const socket = io();

// Éléments du DOM (peuvent être null selon la page)
const btnValider = document.getElementById('btn-valider');
const inputPin = document.getElementById('input-pin');
const inputPseudo = document.getElementById('input-pseudo');

// Si on est sur la page de connexion (index.html)
if (btnValider) {
    btnValider.addEventListener('click', () => {
        const pin = inputPin.value;
        const pseudo = inputPseudo.value;
        
        if (!pin || !pseudo) return alert("Remplis tous les champs !");
        
        socket.emit('player_join_game', { pin, pseudo });
    });
}

// Gestion du succès de connexion
socket.on('join_success', (data) => {
    // Sauvegarde en session pour survivre au changement de page
    sessionStorage.setItem('kahoot_pin', data.pin);
    sessionStorage.setItem('kahoot_pseudo', data.pseudo);
    
    // Si on n'est pas déjà sur player.html, on redirige
    if (window.location.pathname !== '/player.html') {
        window.location.href = '/player.html';
    } else {
        // Si on est déjà sur player.html (après un refresh), on met à jour l'UI
        document.getElementById('player-name').textContent = data.pseudo;
    }
});

// Reconnexion automatique si refresh sur player.html
if (window.location.pathname === '/player.html') {
    const savedPin = sessionStorage.getItem('kahoot_pin');
    const savedPseudo = sessionStorage.getItem('kahoot_pseudo');
    
    if (savedPin && savedPseudo) {
        socket.emit('player_join_game', { pin: savedPin, pseudo: savedPseudo });
    } else {
        // Pas d'infos ? Retour à l'accueil
        window.location.href = '/';
    }
}

socket.on('join_error', (message) => {
    alert(message);
    if (window.location.pathname === '/player.html') {
        window.location.href = '/';
    }
});

socket.on('game_started', (data) => {
    showQuestion(data);
});

socket.on('next_question', (data) => {
    showQuestion(data);
});

function showQuestion(data) {
    console.log("Nouvelle question !");
    
    // On cache l'écran d'attente ou de feedback et on montre le jeu
    document.getElementById('screen-waiting').classList.add('hidden');
    document.getElementById('screen-feedback').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');

    // On affiche la question
    const questionText = document.getElementById('player-question-text');
    if (questionText) {
        questionText.textContent = data.question;
    }

    // On affiche les textes des réponses sur les boutons
    if (data.answers) {
        data.answers.forEach((text, index) => {
            const btnText = document.getElementById(`player-answer-${index}`);
            if (btnText) {
                btnText.textContent = text;
            }
        });
    }
}

socket.on('quiz_ended', () => {
    document.getElementById('screen-game').classList.add('hidden');
    document.getElementById('screen-feedback').classList.add('hidden');
    document.getElementById('screen-waiting').classList.remove('hidden');
    document.querySelector('#screen-waiting h2').textContent = "Quiz Terminé !";
    document.querySelector('#screen-waiting p').textContent = "Regarde l'écran pour ton score final.";
});

// --- GESTION DU CLIC SUR UNE RÉPONSE ---
document.querySelectorAll('.pad-btn').forEach(button => {
    button.addEventListener('click', () => {
        const pin = sessionStorage.getItem('kahoot_pin');
        const answerIndex = button.getAttribute('data-answer');
        
        // On envoie la réponse au serveur
        socket.emit('player_submit_answer', { pin, answerIndex });
        
        // On cache les boutons pour éviter le double-clic
        document.getElementById('screen-game').classList.add('hidden');
        document.getElementById('screen-waiting').classList.remove('hidden');
        document.querySelector('#screen-waiting h2').textContent = "Réponse envoyée !";
        document.querySelector('#screen-waiting p').textContent = "Attends la fin du chrono...";
    });
});

// --- RÉCEPTION DU RÉSULTAT ---
socket.on('answer_result', (data) => {
    document.getElementById('screen-waiting').classList.add('hidden');
    document.getElementById('screen-feedback').classList.remove('hidden');
    
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackStreak = document.getElementById('feedback-streak');
    
    if (data.isCorrect) {
        feedbackTitle.textContent = "CORRECT !";
        feedbackTitle.className = "text-success";
        feedbackStreak.textContent = "🔥 Bien joué !";
    } else {
        feedbackTitle.textContent = "DOMMAGE...";
        feedbackTitle.className = "text-danger";
        feedbackStreak.textContent = "La réponse était la n°" + (parseInt(data.correctAnswerIndex) + 1);
    }
});