document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch on page load
    fetchUsers();
});

// Expose toggle function to the global window object so inline HTML onclick handlers can access it
window.toggleBlockStatus = async (userName, currentStatus) => {
    // If currently blocked, we want to unblock (false). If active, we want to block (true).
    const newStatus = !currentStatus;
    
    // Confirmation prompt to prevent accidental clicks
    const actionText = newStatus ? "BLOCK" : "UNBLOCK";
    if (!confirm(`Are you sure you want to ${actionText} the user @${userName}?`)) {
        return; 
    }

    try {
        // Send the updated status to the new dedicated block route
        const response = await fetch(`https://texanotes-backend.vercel.app/api/users/block/${userName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isBlocked: newStatus })
        });

        if (response.ok) {
            // Re-fetch the table data to show the updated status dynamically
            fetchUsers();
        } else {
            const errorData = await response.json().catch(() => null);
            alert(errorData?.message || `Failed to update block status for @${userName}`);
        }
    } catch (error) {
        console.error("Error toggling block status:", error);
        alert("A network error occurred while trying to update the user.");
    }
};

async function fetchUsers() {
    const tbody = document.getElementById('users-table-body');
    
    try {
        const response = await fetch('https://texanotes-backend.vercel.app/api/users/getusers');
        
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const result = await response.json();
        const users = result.data ? result.data : result;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center loading-text">No users found in the system.</td></tr>';
            return;
        }

        // Generate table rows dynamically
        tbody.innerHTML = users.map(user => {
            const username = user.userName || user.username;
            const isBlocked = user.isBlocked === true;
            
            // Determine styling and text based on current status
            const badgeClass = isBlocked ? 'badge-blocked' : 'badge-active';
            const badgeText = isBlocked ? 'Blocked' : 'Active';
            
            const btnClass = isBlocked ? 'btn-unblock' : 'btn-block';
            const btnText = isBlocked ? 'Unblock' : 'Block User';

            return `
                <tr>
                    <td><strong>${user.name || 'N/A'}</strong></td>
                    <td>@${username}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>
                        <span class="badge ${badgeClass}">${badgeText}</span>
                    </td>
                    <td>
                        <button class="btn-toggle ${btnClass}" onclick="toggleBlockStatus('${username}', ${isBlocked})">
                            ${btnText}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching users:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:red; padding: 2rem;">Error connecting to the server. Is localhost:8000 running?</td></tr>';
    }
}