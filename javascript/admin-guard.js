// Immediately Invoked Function to run as soon as the script loads
(async function verifyAdminAccess() {
    // 1. Get the current logged-in username
    const storedUserName = localStorage.getItem('userName');

    // If no one is logged in, boot them out immediately
    if (!storedUserName) {
        window.location.replace('notes.html');
        return;
    }

    try {
        // 2. Fetch all users from the backend
        const response = await fetch('https://texanotes-backend.vercel.app/api/users/getusers');
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const result = await response.json();
        const usersList = result.data ? result.data : result; // Handle nested arrays

        // 3. Find the current user in the array
        const currentUser = usersList.find(user => 
            user.userName === storedUserName || user.username === storedUserName
        );

        // 4. Verify admin status
        if (!currentUser || currentUser.isAdmin !== true) {
            // User exists but is not an admin, OR user wasn't found at all
            alert('This service is only for admins.')
            window.location.replace('notes.html');
        } 
        // If isAdmin is true, the script simply finishes and the page loads normally.

    } catch (error) {
        console.error('Error verifying admin credentials:', error);
        // Fail securely: if the server is down or errors out, deny access.
        window.location.replace('notes.html');
    }
})();