async function checkDeveloperAccess() {
    try {
        // 1. Get the username from localStorage
        const localUserName = localStorage.getItem('userName');

        // If no user is logged in, redirect immediately
        if (!localUserName) {
            alert("You are not logged in.");
            window.location.href = "../index.html";
            return;
        }

        // 2. Fetch all users from your backend
        const response = await fetch('https://texanotes-backend.vercel.app/api/users/getusers');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Assuming your backend returns { success: true, data: [...] } based on your previous code
        const users = responseData.data;

        // 3. Find the specific user in the fetched array
        // (Checking both userName and username just in case of casing differences)
        const currentUser = users.find(
            (user) => user.userName === localUserName || user.username === localUserName
        );

        // 4. Verify the email
        if (currentUser && currentUser.email === 'bitanchakraborty90@gmail.com') {
            // Success! The user is the developer.
            console.log("Developer access granted. Welcome!");
            // They can stay on the page, so we don't do anything else here.
        } else {
            // Failed check: Not the developer (or user not found in DB)
            alert("You are not the developer.");
            window.location.href = "../index.html";
        }

    } catch (error) {
        console.error("Error verifying developer access:", error);
        // Fallback: If the server fails or network drops, kick them out for safety
        alert("Verification failed. Redirecting for safety.");
        window.location.href = "../index.html";
    }
}

// Run the check immediately when the file loads
checkDeveloperAccess();