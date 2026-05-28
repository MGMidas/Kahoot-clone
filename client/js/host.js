const socket = io();

document.getElementById('titre-quiz')
document.getElementById('btn-lancer').addEventListener('click', () => {
    const titre = document.getElementById('titre-quiz').value
    const question = document.getElementById('question').value
    const reponseA = document.getElementById('reponse-a').value
    const reponseB = document.getElementById('reponse-b').value
    const reponseC = document.getElementById('reponse-c').value
    const reponseD = document.getElementById('reponse-d').value
    const select = document.getElementById('bonne-reponse').value


    const quizData = {
        titre: titre,
        question: question,
        reponses: [reponseA, reponseB, reponseC, reponseD],
        bonneReponse: select
    };

    socket.emit('host_create_game', quizData);
});

socket.on('game_created', (data) => {
    console.log('Partie créer ! PIN : ', data.pin);
    alert('Partie créer ! Code PIN : ' + data.pin);
});