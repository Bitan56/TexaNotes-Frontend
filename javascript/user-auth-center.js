let allUsersData = []; // Store fetched data globally

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    // Event listeners for new controls
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('btn-sort-admin').addEventListener('click', toggleSortAdmin);
    document.getElementById('btn-sort-blocked').addEventListener('click', toggleSortBlocked);
});

// Fetch all users from API
async function fetchUsers() {
    const tbody = document.getElementById('users-tbody');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/getusers`);
        if (!response.ok) throw new Error("Failed to fetch users");

        const result = await response.json();
        allUsersData = result.data ? result.data : result;

        applyFilters(); // Render them to the screen

    } catch (error) {
        console.error('Error fetching users:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="loading-state" style="color:red;">Error connecting to the server.</td></tr>';
    }
}

// --- NEW SEARCH & SORT LOGIC ---
let sortByAdmin = false;
let sortByBlocked = false;

function toggleSortAdmin() {
    sortByAdmin = !sortByAdmin;
    sortByBlocked = false; // Turn off the other sort
    updateButtonStates();
    applyFilters();
}

function toggleSortBlocked() {
    sortByBlocked = !sortByBlocked;
    sortByAdmin = false; // Turn off the other sort
    updateButtonStates();
    applyFilters();
}

function updateButtonStates() {
    document.getElementById('btn-sort-admin').classList.toggle('active', sortByAdmin);
    document.getElementById('btn-sort-blocked').classList.toggle('active', sortByBlocked);
    
    document.getElementById('btn-sort-admin').innerText = sortByAdmin ? "Sort: Non-Admins First" : "Sort: Admins First";
    document.getElementById('btn-sort-blocked').innerText = sortByBlocked ? "Sort: Unblocked First" : "Sort: Blocked First";
}

function applyFilters() {
    const query = document.getElementById('search-input').value.toLowerCase();
    
    // 1. Filter by search query
    let filteredUsers = allUsersData.filter(user => {
        const name = (user.name || '').toLowerCase();
        const username = (user.userName || user.username || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(query) || username.includes(query) || email.includes(query);
    });

    // 2. Sort the filtered array
    filteredUsers.sort((a, b) => {
        if (sortByAdmin) {
            // Sort by Admin status (Boolean comparison: true vs false)
            return (b.isAdmin === true) - (a.isAdmin === true);
        } else if (sortByBlocked) {
            // Sort by Blocked status
            return (b.isBlocked === true) - (a.isBlocked === true);
        }
        return 0; // Default sort order
    });

    renderUsers(filteredUsers);
}

// Render the filtered/sorted users to the table (Your exact original HTML template)
function renderUsers(users) {
    const tbody = document.getElementById('users-tbody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading-state">No users found matching your criteria.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td class="user-info">
                <strong>${user.name || 'N/A'}</strong>
                <span>@${user.userName || user.username}</span><br>
                <span>${user.email || 'No email provided'}</span>
            </td>
            
            <td>
                <div class="status-badge ${user.isAdmin ? 'badge-admin' : 'badge-user'}">
                    ${user.isAdmin ? 'Admin' : 'Regular User'}
                </div><br>
                <button class="btn-toggle ${user.isAdmin ? 'btn-revoke-admin' : 'btn-make-admin'}" 
                        onclick="toggleStatus('${user._id}', 'isAdmin', ${!user.isAdmin})">
                    ${user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
            </td>
            
            <td>
                <div class="status-badge ${user.isBlocked ? 'badge-blocked' : 'badge-active'}">
                    ${user.isBlocked ? 'Blocked' : 'Active'}
                </div><br>
                <button class="btn-toggle ${user.isBlocked ? 'btn-unblock' : 'btn-block'}" 
                        onclick="toggleStatus('${user._id}', 'isBlocked', ${!user.isBlocked})">
                    ${user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Global function to handle toggling statuses (Your exact original function)
window.toggleStatus = async (userId, field, newValue) => {
    if (field === 'isBlocked' && newValue === true) {
        if (!confirm("Are you sure you want to block this user?")) return;
    }

    try {
        const payload = {};
        payload[field] = newValue; 

        const response = await fetch(`${BACKEND_URL}/api/users/update-status/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Re-fetch the user list to update the UI and keep local state perfectly synced
            fetchUsers();
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to update user status.");
        }
    } catch (error) {
        console.error("Update error:", error);
        alert("A network error occurred while updating the status.");
    }
};