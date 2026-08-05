document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Sidebar Logic ---
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinksContainer.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });

    // --- DOM Elements ---
    const notesGrid = document.getElementById('notes-grid');
    const categoryTitle = document.getElementById('category-title');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    
    // Nav Links
    const navAll = document.getElementById('nav-all');
    const navTheory = document.getElementById('nav-theory');
    const navPractical = document.getElementById('nav-practical');
    const allNavItems = [navAll, navTheory, navPractical];

    // State Variables
    let allNotes = []; 
    let currentCategory = 'all'; // Can be 'all', 'theory', or 'practical'

    // --- Fetch Notes ---
    async function fetchNotes() {
        try {
            const response = await fetch('https://texanotes-backend.vercel.app/api/notes/getnotes');
            if (!response.ok) throw new Error('Failed to fetch notes');
            
            const result = await response.json();
            allNotes = result.data ? result.data : result;
            
            updateView();
        } catch (error) {
            console.error('Error:', error);
            notesGrid.innerHTML = `<div class="error-state">Failed to load notes. Ensure your server is running.</div>`;
        }
    }

    // --- Core Engine: Filter, Search, and Sort ---
    function updateView() {
        let processedNotes = [...allNotes];

        // 1. Apply Category Filter
        if (currentCategory === 'theory') {
            processedNotes = processedNotes.filter(note => note.paper && note.paper.toLowerCase() === 'theory');
        } else if (currentCategory === 'practical') {
            processedNotes = processedNotes.filter(note => note.paper && note.paper.toLowerCase() === 'practical');
        }

        // 2. Apply Search Filter
        const query = searchInput.value.toLowerCase();
        if (query) {
            processedNotes = processedNotes.filter(note => {
                return (note.name && note.name.toLowerCase().includes(query)) ||
                       (note.teacher && note.teacher.toLowerCase().includes(query)) ||
                       (note.paperCode && note.paperCode.toLowerCase().includes(query));
            });
        }

        // 3. Apply Sorting
        const sortValue = sortSelect.value;
        processedNotes.sort((a, b) => {
            switch(sortValue) {
                case 'date-desc':
                    return new Date(b.uploadedOn) - new Date(a.uploadedOn);
                case 'date-asc':
                    return new Date(a.uploadedOn) - new Date(b.uploadedOn);
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'subject-asc':
                    return (a.paperCode || '').localeCompare(b.paperCode || '');
                case 'teacher-asc':
                    return (a.teacher || '').localeCompare(b.teacher || '');
                default:
                    return 0;
            }
        });

        // 4. Render to DOM
        displayNotes(processedNotes);
    }

    // --- Display Logic ---
    function displayNotes(notesToDisplay) {
        notesGrid.innerHTML = ''; 

        if (notesToDisplay.length === 0) {
            notesGrid.innerHTML = `<div class="empty-state">No notes found matching your criteria.</div>`;
            return;
        }

        notesToDisplay.forEach(note => {
            const dateStr = note.uploadedOn ? new Date(note.uploadedOn).toLocaleDateString() : 'N/A';
            const card = document.createElement('div');
            card.className = 'note-card';
            
            // Includes the secure Cloudinary URL logic
            let safeUrl = note.noteUrl || '#';
            if (safeUrl !== '#' && !safeUrl.endsWith('.pdf') && safeUrl.includes('/image/upload/')) {
                safeUrl = `${safeUrl}.pdf`;
            }

            card.innerHTML = `
                <span class="note-badge">${note.paper || 'General'}</span>
                <h3>${note.name || 'Untitled Note'}</h3>
                <div class="note-details">
                    <p><strong>Subject Code:</strong> ${note.paperCode || 'N/A'}</p>
                    <p><strong>Teacher:</strong> ${note.teacher || 'N/A'}</p>
                    <p><strong>Date:</strong> ${dateStr}</p>
                </div>
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-download">View / Download</a>
            `;
            notesGrid.appendChild(card);
        });
    }

    // --- Event Listeners ---

    // Category Navigation
    function handleCategoryClick(navElement, category, title) {
        allNavItems.forEach(item => item.classList.remove('active'));
        navElement.classList.add('active');
        categoryTitle.textContent = title;
        currentCategory = category;
        
        // Close mobile menu on click
        if (navLinksContainer.classList.contains('nav-active')) {
            navLinksContainer.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
        }

        updateView();
    }

    navAll.addEventListener('click', (e) => {
        e.preventDefault();
        handleCategoryClick(navAll, 'all', 'All Notes');
    });

    navTheory.addEventListener('click', (e) => {
        e.preventDefault();
        handleCategoryClick(navTheory, 'theory', 'Theory Notes');
    });

    navPractical.addEventListener('click', (e) => {
        e.preventDefault();
        handleCategoryClick(navPractical, 'practical', 'Practical Notes');
    });

    // Search and Sort
    searchBtn.addEventListener('click', updateView);
    sortSelect.addEventListener('change', updateView);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') updateView();
    });

    // Initialize
    fetchNotes();
});