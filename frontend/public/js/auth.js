document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const API_URL = "https://bigbank-backend.redwave-8bcf09a2.eastus.azurecontainerapps.io";
    try {
        const response = await fetch(`${API_URL}/api/user/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Store the token in localStorage
            localStorage.setItem('token', data.token);
            
            // ✅ Redirect to dashboard.html
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Check console for details.');
    }
});