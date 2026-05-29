document.getElementById('btn-submit').addEventListener('click', async () => {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    });
});