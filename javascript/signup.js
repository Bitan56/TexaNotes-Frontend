const signupForm = document.getElementById('signup-form');
const submitBtn = document.querySelector('.btn-submit');

// Modal Elements
const successModal = document.getElementById('success-modal');
const btnModalContinue = document.getElementById('btn-modal-continue');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Signing up...';
    submitBtn.disabled = true;

    const name = document.querySelector('#name');
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
        
        const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(inputData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            
            // Set session
            localStorage.setItem('userName', userName.value);
            
            // Reset form
            signupForm.reset();
            
            // Show the celebration modal!
            successModal.style.display = 'flex';
            
            // When they click "Awesome!", redirect them to the dashboard/home
            btnModalContinue.onclick = () => {
                window.location.href = '../index.html'; 
            };
            
        } else {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData && errorData.message ? errorData.message : 'Sign up failed. Please try again.';
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        alert('A network error occurred.');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});