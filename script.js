// Select DOM elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');
const loginBtn = document.querySelector('.btn-login')

const isAuth = () => {
    const localName = localStorage.getItem('userName'); // No await needed
    
    // Only run this if the user is logged in AND the button exists on the page
    if (localName && loginBtn) {
        loginBtn.innerText = 'Profile';
        
        // Instead of an event listener, just change the href property directly
        // This is much safer if .btn-login is an <a> tag
        loginBtn.href = './pages/profile.html'; 
    }
}
isAuth();

// Toggle menu when hamburger is clicked
hamburger.addEventListener('click', () => {
    // Toggles the 'nav-active' class on the ul to slide it in/out
    navLinks.classList.toggle('nav-active');
    
    // Toggles the 'toggle' class on hamburger to animate it into an 'X'
    hamburger.classList.toggle('toggle');
});

// Close the menu automatically when a link is clicked
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        hamburger.classList.remove('toggle');
    });
});