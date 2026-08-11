const DEVELOPER_EMAIL = "bitanchakraborty90@gmail.com"; // Your email required for backend verification

document.addEventListener('DOMContentLoaded', () => {
    fetchPendingRequests();
});

async function fetchPendingRequests() {
    const tbody = document.getElementById('payments-tbody');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/credits/pending-requests`);
        const result = await response.json();

        if (response.ok) {
            renderRequests(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="loading-state" style="color:red;">Error fetching requests.</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        tbody.innerHTML = `<tr><td colspan="4" class="loading-state" style="color:red;">Network Error.</td></tr>`;
    }
}

function renderRequests(requests) {
    const tbody = document.getElementById('payments-tbody');

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-state">No pending payment requests right now.</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map(req => {
        const date = new Date(req.requestDate).toLocaleString();
        return `
        <tr>
            <td class="user-info">
                <strong>@${req.userName}</strong>
            </td>
            <td>
                <span style="color:#10b981; font-weight:bold;">Paid: ₹${req.amountPaid}</span><br>
                <span style="color:#f59e0b; font-weight:bold;">Credits: +${req.creditsRequested}</span>
            </td>
            <td>${date}</td>
            <td>
                <button class="btn-toggle btn-unblock" onclick="processRequest('${req._id}', 'approve')">Approve</button>
                <button class="btn-toggle btn-block" style="margin-top: 5px;" onclick="processRequest('${req._id}', 'reject')">Reject</button>
            </td>
        </tr>
    `}).join('');
}

window.processRequest = async (requestId, action) => {
    const isApproving = action === 'approve';
    const confirmMsg = isApproving ? 
        "Are you sure you want to APPROVE this payment and add credits to the user?" : 
        "Are you sure you want to REJECT this payment?";

    if (!confirm(confirmMsg)) return;

    try {
        const endpoint = isApproving ? 'approve-payment' : 'reject-payment';
        
        const response = await fetch(`${BACKEND_URL}/api/credits/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                requestId: requestId,
                developerEmail: DEVELOPER_EMAIL 
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(data.message);
            fetchPendingRequests(); // Refresh the list
        } else {
            alert(data.message || "Action failed.");
        }
    } catch (error) {
        console.error("Action error:", error);
        alert("A network error occurred.");
    }
};