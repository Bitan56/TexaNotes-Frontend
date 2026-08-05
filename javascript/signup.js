const signupForm = document.getElementById('signup-form');
const submitBtn = document.querySelector('.btn-submit');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Signing up...';
    submitBtn.disabled = true;

    const name = document.querySelector('#name');
    // Ensure this matches your HTML id exactly. (Changed to #username to match previous HTML)
    const userName = document.querySelector('#userName'); 
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    
    try {
        const inputData = {
            name: name.value,
            userName: userName.value,
            email: email.value,
            password: password.value
        };
        
        const response = await fetch('https://texanotes-backend.vercel.app/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Tell the backend to expect JSON!
            },
            body: JSON.stringify(inputData)
        });

        if (response.ok) {
            alert('Sign up successful!');
            const data = await response.json();
            console.log(data);
            localStorage.setItem('userName',userName.value)
            location.reload()
            signupForm.reset();
            // window.location.href = 'login.html'; 
        } else {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData && errorData.message ? errorData.message : 'Sign up failed. Please try again.';
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        alert('A network error occurred. Please make sure your server is running on localhost:8000.');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});