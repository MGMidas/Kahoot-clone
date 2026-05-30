const socket = io();

const btn = document.getElementById('btn-valider').addEventListener('click', () => {
    const pin = document.getElementById('input-pin').value
    const pseudo = document.getElementById('input-pseudo').value
    
    socket.emit('player_join_game', { pin, pseudo })
})

socket.on('join_success', (data) => {
    alert('Bienvenue ' + data.pseudo + ' !');
    window.location.href = '/player.html';
})

socket.on('join_error', (message) => {
    alert(message);
})