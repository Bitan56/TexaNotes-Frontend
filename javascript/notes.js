// Select DOM elements for the mobile navbar menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');
const logOut = document.querySelector('.btn-logout')

logOut.addEventListener('click',()=>{
    localStorage.removeItem('userName')
    window.location.href = '../index.html'
})

// Toggle menu when hamburger is clicked
hamburger.addEventListener('click', () => {
    // Slide the menu in/out
    navLinks.classList.toggle('nav-active');

    // Animate the hamburger into an 'X'
    hamburger.classList.toggle('toggle');
});

// Close the menu automatically when a link is clicked
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        hamburger.classList.remove('toggle');
    });
});