document.addEventListener('DOMContentLoaded', async () => {
    const editForm = document.getElementById('edit-form');
    const submitBtn = document.querySelector('.btn-submit');
    
    // Form Inputs
    const nameInput = document.getElementById('name');
    const userNameInput = document.getElementById('userName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Get the current logged-in username
    const currentUserName = localStorage.getItem('userName') || localStorage.getItem('username');

    if (!currentUserName) {
        alert("You must be logged in to edit your profile.");
        window.location.href = 'login.html';
        return;
    }

    // 1. PRE-FILL THE FORM
    try {
        const response = await fetch('https://texanotes-backend.vercel.app/api/users/getusers');
        const result = await response.json();
        const usersList = result.data ? result.data : result;

        const currentUser = usersList.find(user => 
            user.userName === currentUserName || user.username === currentUserName
        );

        if (currentUser) {
            nameInput.value = currentUser.name || '';
            userNameInput.value = currentUser.userName || currentUser.username || '';
            emailInput.value = currentUser.email || '';
        } else {
            alert("Could not load your user data.");
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    // 2. HANDLE FORM SUBMISSION
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        // Build data payload
        const updatedData = {
            name: nameInput.value,
            userName: userNameInput.value,
            email: emailInput.value
        };

        // Only include password if the user actually typed a new one
        if (passwordInput.value.trim() !== '') {
            updatedData.password = passwordInput.value;
        }

        try {
            const response = await fetch(`https://texanotes-backend.vercel.app/api/users/update/${currentUserName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Profile updated successfully!');
                
                // If the user changed their username, update localStorage so they stay logged in
                if (updatedData.userName !== currentUserName) {
                    localStorage.setItem('userName', updatedData.userName);
                }

                // Redirect back to profile view
                window.location.href = './profile.html';
            } else {
                const errorData = await response.json().catch(() => null);
                alert(errorData?.message || 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('A network error occurred. Please make sure your server is running.');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});