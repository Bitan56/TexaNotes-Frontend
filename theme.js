// theme.js - Prevents the white flash when dark mode is enabled
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}
applySavedTheme();