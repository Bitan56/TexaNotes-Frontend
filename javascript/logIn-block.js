// Immediately Invoked Function to run as soon as the script loads
(function requireLogin() {
    // 1. Check for the username in local storage
    const storedUserName = localStorage.getItem('userName');

    // 2. If it does not exist, redirect to the index/login page
    if (storedUserName) {
        window.location.replace('../index.html');
    }
    // If it does exist, the script does nothing and allows the page to load normally.
})();