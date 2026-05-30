document.getElementById('btn-submit').addEventListener('click', async () => {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify({ email: email, password: password })
    });

    const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/host.html';
        } else {
            alert(data.message)
        }
});
