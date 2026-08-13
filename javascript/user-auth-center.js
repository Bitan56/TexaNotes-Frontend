let allUsersData = []; // Store fetched data globally
let selectedUserIdForCredit = null; // Store ID for modal

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

// --- SEARCH & SORT LOGIC ---
let sortByAdmin = false;
let sortByBlocked = false;

function toggleSortAdmin() {
    sortByAdmin = !sortByAdmin;
    sortByBlocked = false; 
    updateButtonStates();
    applyFilters();
}

function toggleSortBlocked() {
    sortByBlocked = !sortByBlocked;
    sortByAdmin = false; 
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
    
    let filteredUsers = allUsersData.filter(user => {
        const name = (user.name || '').toLowerCase();
        const username = (user.userName || user.username || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(query) || username.includes(query) || email.includes(query);
    });

    filteredUsers.sort((a, b) => {
        if (sortByAdmin) {
            return (b.isAdmin === true) - (a.isAdmin === true);
        } else if (sortByBlocked) {
            return (b.isBlocked === true) - (a.isBlocked === true);
        }
        return 0; 
    });

    renderUsers(filteredUsers);
}

// Render the filtered/sorted users to the table
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
                </div>
                <div class="status-badge badge-credits">
                    🪙 ${user.credits !== undefined ? user.credits : 0} Credits
                </div><br>
                
                <button class="btn-toggle ${user.isBlocked ? 'btn-unblock' : 'btn-block'}" 
                        onclick="toggleStatus('${user._id}', 'isBlocked', ${!user.isBlocked})">
                    ${user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button class="btn-toggle btn-credit" 
                        onclick="openCreditModal('${user._id}', '${user.name}', ${user.credits || 0})">
                    Add Credits
                </button>
                <br>
                <button class="btn-toggle btn-delete" 
                        onclick="deleteUser('${user._id}', '${user.userName || user.name}')">
                    Delete User
                </button>
            </td>
        </tr>
    `).join('');
}

// Global function to handle toggling statuses
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

// --- DELETE USER LOGIC ---
window.deleteUser = async (userId, userName) => {
    // Extra strong confirmation for destructive actions
    if (!confirm(`CRITICAL WARNING: Are you absolutely sure you want to PERMANENTLY delete "@${userName}"? This action cannot be undone and will erase their account.`)) {
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/users/delete-user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert(`User @${userName} has been successfully deleted.`);
            fetchUsers(); // Refresh the table
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to delete user.");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("A network error occurred while trying to delete the user.");
    }
};

// --- MODAL & CREDIT LOGIC ---
window.openCreditModal = (userId, userName, currentCredit) => {
    selectedUserIdForCredit = userId;
    document.getElementById('modal-title').innerText = `Add Credits to ${userName}`;
    document.getElementById('current-credit-display').innerText = currentCredit;
    document.getElementById('credit-amount-input').value = '';
    document.getElementById('credit-modal').style.display = 'flex';
};

window.closeCreditModal = () => {
    document.getElementById('credit-modal').style.display = 'none';
    selectedUserIdForCredit = null;
};

window.submitCredits = async () => {
    const amountInput = document.getElementById('credit-amount-input').value;
    const amount = parseInt(amountInput, 10);

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/credits/add-credits/${selectedUserIdForCredit}`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        if (response.ok) {
            closeCreditModal();
            fetchUsers(); // Refresh table to show new credit amount
        } else {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorData = await response.json();
                alert(errorData.message || "Failed to add credits.");
            } else {
                alert(`Error ${response.status}: The backend route was not found.`);
            }
        }
    } catch (error) {
        console.error("Credit update error:", error);
        alert("A network error occurred while adding credits.");
    }
};