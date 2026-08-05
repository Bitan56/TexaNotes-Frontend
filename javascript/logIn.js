document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.querySelector('.btn-submit');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent standard page reload on submit

        // Show loading state on button
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const usernameInput = document.querySelector('#username');
        const passwordInput = document.querySelector('#password');

        try {
            // Prepare data object
            const inputData = {
                userName: usernameInput.value,
                password: passwordInput.value
            };

            // Make POST request with JSON payload
            const response = await fetch('https://texanotes-backend.vercel.app/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Crucial for backend express.json() parser
                },
                body: JSON.stringify(inputData)
            });

            if (response.ok) {
                alert('Login successful!');
                const data = await response.json();
                console.log('Login Response:', data);
                localStorage.setItem('userName',data.userName)
                window.location.href = '../index.html'

                // Clear form
                loginForm.reset();

                // Typically you would store the token and redirect here
                // localStorage.setItem('token', data.token);
                // window.location.href = 'dashboard.html'; 
            } else {
                // Parse custom error from API if available
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData && errorData.message ? errorData.message : 'Invalid username or password. Please try again.';
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('A network error occurred. Please make sure your server is running on localhost:8000.');
        } finally {
            // Restore button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});