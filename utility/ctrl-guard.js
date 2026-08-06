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