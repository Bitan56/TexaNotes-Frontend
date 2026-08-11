function applySecurityMeasures() {
    // 1. Disable Right-Click (Context Menu)
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Stops the menu from appearing
        alert('Right click is disabled.')
    });

    // 2. Disable the Ctrl Key and Ctrl Shortcuts
    document.addEventListener('keydown', (event) => {
        // If the Ctrl key is pressed down along with any other key
        if (event.ctrlKey) {
            event.preventDefault(); // Stops Ctrl+C, Ctrl+S, Ctrl+P, etc.
            alert('Ctrl key is disabled.')
        }
        
        // Block the Mac Command key (metaKey) just in case
        if (event.metaKey) {
            event.preventDefault(); 
            alert('Meta key is disabled.')
        }

        // Specifically target the F12 key (Developer Tools)
        if (event.key === "F12") {
            event.preventDefault();
            alert('F12 key is disabled.')
        }
    });

    // Optional: Prevent text selection highlighting
    document.addEventListener('selectstart', (event) => {
        event.preventDefault();
    });
}
// Run the function when the page loads
applySecurityMeasures();


function initClickRipple() {
    // 1. Inject the necessary CSS into the document head
    const style = document.createElement('style');
    style.innerHTML = `
        /* The click ripple animation */
        .cursor-ripple {
            position: fixed;
            border-radius: 50%;
            background: transparent;
            border: 2px solid rgba(79, 70, 229, 0.8); /* Indigo border */
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.5); /* Indigo glow */
            pointer-events: none; /* Allows clicking THROUGH the ripple */
            transform: translate(-50%, -50%);
            z-index: 9998;
            animation: ripple-anim 0.5s ease-out forwards;
        }

        @keyframes ripple-anim {
            0% {
                width: 0px;
                height: 0px;
                opacity: 1;
            }
            100% {
                width: 60px;
                height: 60px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Helper function to create and remove the click ripple
    const createRipple = (x, y) => {
        const ripple = document.createElement('div');
        ripple.classList.add('cursor-ripple');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);

        // Remove the element after the 0.5s animation finishes to prevent lag
        setTimeout(() => {
            ripple.remove();
        }, 500); 
    };

    // 3. Click events (Desktop)
    document.addEventListener('mousedown', (e) => {
        createRipple(e.clientX, e.clientY);
    });

    // 4. Tap events (Mobile)
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            createRipple(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
}

// Initialize the effect when the page loads
window.addEventListener('load', initClickRipple);

// theme.js - Include this in the <head> of ALL your HTML files
function applySavedTheme() {
    // Fetch the theme from local storage (default to 'light' if not found)
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the theme to the HTML tag as a data attribute
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Run immediately to prevent white flash
applySavedTheme();

