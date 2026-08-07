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
    const sortSelect = document.getElementById('sort-select');
    
    // Nav Links
    const navAll = document.getElementById('nav-all');
    const navTheory = document.getElementById('nav-theory');
    const navPractical = document.getElementById('nav-practical');
    const allNavItems = [navAll, navTheory, navPractical];

    // State Variables
    let allNotes = []; 
    let currentCategory = 'all';

    // --- Fetch Notes ---
    async function fetchNotes() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/notes/getnotes`);
            if (!response.ok) throw new Error('Failed to fetch notes');
            
            const result = await response.json();
            allNotes = result.data ? result.data : result;
            
            updateView();
        } catch (error) {
            console.error('Error:', error);
            notesGrid.innerHTML = `
                <div class="error-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="color: #ef4444; margin-bottom: 1rem;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p>Failed to load notes. Please check your connection or try again later.</p>
                </div>`;
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
                       (note.subject && note.subject.toLowerCase().includes(query)) ||
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
                    return (a.subject || '').localeCompare(b.subject || '');
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
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="color: var(--text-light); margin-bottom: 1rem;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>No notes found matching your criteria.</p>
                </div>`;
            return;
        }

        notesToDisplay.forEach(note => {
            // Make date look nice (e.g., "Aug 7, 2026")
            const dateObj = new Date(note.uploadedOn);
            const formattedDate = !isNaN(dateObj) 
                ? dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                : 'Unknown Date';

            const card = document.createElement('div');
            card.className = 'note-card';
            
            // Secure Cloudinary URL logic
            let safeUrl = note.noteUrl || '#';
            if (safeUrl !== '#' && !safeUrl.endsWith('.pdf') && safeUrl.includes('/image/upload/')) {
                safeUrl = `${safeUrl}.pdf`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <span class="note-badge">${note.paper || 'General'}</span>
                    <span class="note-date">${formattedDate}</span>
                </div>
                
                <h3>${note.name || 'Untitled Note'}</h3>
                <p class="note-subject">${note.subject || 'No Subject'} - ${note.paperCode || 'N/A'}</p>
                
                <div class="note-meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">Teacher</span>
                        <span class="meta-value">${note.teacher || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Semester</span>
                        <span class="meta-value">${note.semester || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Module No</span>
                        <span class="meta-value">${note.moduleNumber || 'N/A'}</span>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="uploader-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>${note.uploadedBy || 'Anonymous'}</span>
                    </div>
                    
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-download">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View
                    </a>
                </div>
            `;
            notesGrid.appendChild(card);
        });
    }

    // --- Event Listeners ---
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
        e.preventDefault(); handleCategoryClick(navAll, 'all', 'All Notes');
    });
    navTheory.addEventListener('click', (e) => {
        e.preventDefault(); handleCategoryClick(navTheory, 'theory', 'Theory Notes');
    });
    navPractical.addEventListener('click', (e) => {
        e.preventDefault(); handleCategoryClick(navPractical, 'practical', 'Practical Notes');
    });

    // Search and Sort
    sortSelect.addEventListener('change', updateView);
    searchInput.addEventListener('input', updateView); // Using 'input' for instant search filtering

    // Initialize
    fetchNotes();
});