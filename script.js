// Select DOM elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li a'); 
const loginBtn = document.querySelector('.btn-login');

// Credit Elements
const creditContainer = document.getElementById('credit-container');
const creditAmount = document.getElementById('credit-amount');
const creditBadgeBtn = document.getElementById('credit-badge-btn');
const creditDropdown = document.getElementById('credit-dropdown');
const dropdownUsername = document.getElementById('dropdown-username');
const dropdownCredits = document.getElementById('dropdown-credits');

// Safely get the Backend URL (Checks if essentials.js already defined it)
const API_URL = window.BACKEND_URL || 'https://texanotes-backend.vercel.app'; 

const isAuth = async () => {
    const localName = localStorage.getItem('userName');

    // Only run this if the user is logged in AND the login button exists on the page
    if (localName && loginBtn) {
        loginBtn.innerText = 'Profile';
        loginBtn.href = './pages/profile.html';

        // --- Fetch and display credits ---
        if (creditContainer && creditAmount) {
            // Un-hide the credit section while it loads
            creditContainer.style.display = 'block';

            try {
                const response = await fetch(`${API_URL}/api/users/getusers`);
                if (!response.ok) throw new Error("Failed to fetch");

                const result = await response.json();
                const users = result.data ? result.data : result; 

                // Find the user (checking userName, username, and name just to be safe)
                const currentUser = users.find(user => 
                    user.userName === localName || 
                    user.username === localName || 
                    user.name === localName
                );

                if (currentUser) {
                    // Check for both 'credit' and 'credits' depending on your database schema
                    const userCredits = currentUser.credit !== undefined ? currentUser.credit : 
                                       (currentUser.credits !== undefined ? currentUser.credits : 0);
                    
                    // Update Badge
                    creditAmount.innerText = userCredits;
                    
                    // Update Dropdown Data safely
                    if (dropdownUsername) dropdownUsername.innerText = currentUser.userName || localName;
                    if (dropdownCredits) dropdownCredits.innerText = userCredits;
                } else {
                    creditAmount.innerText = '0';
                    if (dropdownUsername) dropdownUsername.innerText = localName;
                    if (dropdownCredits) dropdownCredits.innerText = '0';
                }

            } catch (error) {
                console.error("Error fetching credits:", error);
                creditAmount.innerText = '---'; 
                if (dropdownCredits) dropdownCredits.innerText = '---';
            }
        }
    }
}

// Run auth check on load
isAuth();

// --- Credit Box Dropdown Logic ---
// Wrapped in an 'if' block to prevent errors if the elements aren't on the page
if (creditBadgeBtn && creditDropdown && creditContainer) {
    // Toggle dropdown when clicking the badge
    creditBadgeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents click from bubbling up
        creditDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking anywhere else on the page
    document.addEventListener('click', (e) => {
        if (creditDropdown.classList.contains('show') && !creditContainer.contains(e.target)) {
            creditDropdown.classList.remove('show');
        }
    });
}

// --- Mobile Navigation Logic ---
// Wrapped in an 'if' block to prevent "null" errors
if (hamburger && navLinks) {
    // Toggle menu when hamburger is clicked
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });

    // Close the menu automatically when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            }
        });
    });
}