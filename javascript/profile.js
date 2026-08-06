document.addEventListener('DOMContentLoaded', async () => {
    const statusMessage = document.getElementById('status-message');
    const profileContent = document.getElementById('profile-content');
    
    // Attempt to get the username from local storage (handling both exact case and common typo)
    const storedUserName = localStorage.getItem('userName') || localStorage.getItem('username');

    if (!storedUserName) {
        statusMessage.innerHTML = 'No user logged in. Please <a href="../pages/logIn.html">log in</a> first.';
        return;
    }

    try {
        // Fetch all users
        const response = await fetch('https://texanotes-backend.vercel.app/api/users/getusers');
        
        if (!response.ok) {
            throw new Error('Failed to fetch users from server.');
        }

        const result = await response.json();
        
        // Handle depending on how your backend nests the data array
        const usersList = result.data ? result.data : result;

        // Find the specific user matching the username in local storage
        const currentUser = usersList.find(user => 
            user.userName === storedUserName || user.username === storedUserName
        );

        if (currentUser) {
            // Hide loading message, show profile
            statusMessage.classList.add('hidden');
            profileContent.classList.remove('hidden');

            // Set Avatar Initial
            const initial = (currentUser.name || currentUser.userName || 'U').charAt(0).toUpperCase();
            document.getElementById('avatar-placeholder').textContent = initial;

            // Set Basic Text Info
            document.getElementById('display-name').textContent = currentUser.name || 'N/A';
            document.getElementById('display-username').textContent = `@${currentUser.userName || currentUser.username}`;
            document.getElementById('display-email').textContent = currentUser.email || 'N/A';

            // Format and Set Dates
            const createdDate = new Date(currentUser.createdAt).toLocaleDateString();
            const updatedDate = new Date(currentUser.updatedAt).toLocaleDateString();
            document.getElementById('display-created').textContent = createdDate;
            document.getElementById('display-updated').textContent = updatedDate;

            // Admin & Developer Status Logic
            const adminStatusDiv = document.getElementById('admin-status');
            
            // ---> MODIFIED LOGIC HERE <---
            if (currentUser.email === 'bitanchakraborty90@gmail.com') {
                adminStatusDiv.textContent = "You are a developer";
                // You can add this class to your CSS to give it a special color!
                adminStatusDiv.className = "status-badge badge-developer"; 
            } else if (currentUser.isAdmin) {
                adminStatusDiv.textContent = "You are an admin";
                adminStatusDiv.className = "status-badge badge-admin";
            } else {
                adminStatusDiv.textContent = "You are not an admin";
                adminStatusDiv.className = "status-badge badge-not-admin";
            }

            // Blocked Status Logic
            const blockedStatusDiv = document.getElementById('blocked-status');
            if (currentUser.isBlocked) {
                blockedStatusDiv.textContent = "You are blocked";
                blockedStatusDiv.className = "status-badge badge-blocked";
            } else {
                blockedStatusDiv.textContent = "You are not blocked";
                blockedStatusDiv.className = "status-badge badge-not-blocked";
            }

        } else {
            statusMessage.innerHTML = `Could not find profile details for user: <strong>${storedUserName}</strong>`;
        }

    } catch (error) {
        console.error('Profile fetch error:', error);
        statusMessage.textContent = 'Error connecting to the server.';
    }

    // --- Action Button Logic ---
    const btnEdit = document.getElementById('btn-edit');
    const btnLogout = document.getElementById('btn-logout');

    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            // Redirect to an edit page (you will need to create edit-profile.html)
            window.location.href = 'edit-profile.html';
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Ask for confirmation
            const confirmLogout = confirm("Are you sure you want to log out?");
            
            if (confirmLogout) {
                // Clear the stored username and any tokens
                localStorage.localStorage.removeItem('userName')
                
                // Redirect back to login page
                window.location.href = '../pages/logIn.html';
            }
        });
    }
});