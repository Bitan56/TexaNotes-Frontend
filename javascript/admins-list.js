document.addEventListener('DOMContentLoaded', async () => {
    const statusMessage = document.getElementById('status-message');
    const adminGrid = document.getElementById('admin-grid');

    try {
        // Fetch all users from the backend
        const response = await fetch(`${BACKEND_URL}/api/users/getusers`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch users from server.');
        }

        const result = await response.json();
        
        // Adjust based on your API response structure (whether it's wrapped in a 'data' property)
        const allUsers = result.data ? result.data : result;

        // Filter the users to strictly those who have isAdmin set to true
        const admins = allUsers.filter(user => user.isAdmin === true);

        // Hide the loading message
        statusMessage.classList.add('hidden');
        
        // Show the grid container
        adminGrid.classList.remove('hidden');

        // Check if there are no admins
        if (admins.length === 0) {
            adminGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #6b7280;">No administrators found in the system.</p>';
            return;
        }

        // Generate and append cards for each admin
        admins.forEach(admin => {
            // Get the first letter of their name or username for the avatar placeholder
            const displayName = admin.name || 'Unknown Name';
            const displayUsername = admin.userName || admin.username || 'unknown';
            const initial = displayName.charAt(0).toUpperCase();

            // Create card element
            const card = document.createElement('div');
            card.className = 'admin-card';
            
            // Inject HTML inside the card
            card.innerHTML = `
                <div class="admin-avatar">${initial}</div>
                <div class="admin-info">
                    <h3>${displayName}</h3>
                    <p>@${displayUsername}</p>
                </div>
            `;

            // Add the card to the grid container
            adminGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching admin data:', error);
        
        // Display error state to the user
        statusMessage.textContent = 'Error connecting to the server. Please ensure the backend is running on localhost:8000.';
        statusMessage.classList.add('error-text');
    }
});