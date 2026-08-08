// --- Global State Variables ---
let allNotes = []; 
let currentCategory = 'all';
let currentUser = null; // Stores logged-in user data (credits, owned notes)
let selectedNoteForPurchase = null; 

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Sidebar Logic
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinksContainer.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
    });

    // DOM Elements
    const categoryTitle = document.getElementById('category-title');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const navAll = document.getElementById('nav-all');
    const navTheory = document.getElementById('nav-theory');
    const navPractical = document.getElementById('nav-practical');
    const allNavItems = [navAll, navTheory, navPractical];

    // Initialize App: Fetch User -> Fetch Notes
    async function init() {
        await fetchCurrentUser();
        await fetchNotes();
    }
    
    // --- Fetch User Data ---
    async function fetchCurrentUser() {
        const localName = localStorage.getItem('userName');
        if (!localName) return; // User is not logged in

        try {
            const response = await fetch(`${BACKEND_URL}/api/users/getusers`);
            if (response.ok) {
                const result = await response.json();
                const users = result.data ? result.data : result;
                currentUser = users.find(u => u.userName === localName || u.username === localName);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    }

    // --- Fetch Notes ---
    async function fetchNotes() {
        const notesGrid = document.getElementById('notes-grid');
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
                    <p>Failed to load notes. Please check your connection.</p>
                </div>`;
        }
    }

    // --- Filter, Search, and Sort ---
    function updateView() {
        let processedNotes = [...allNotes];

        // 1. Filter Category
        if (currentCategory === 'theory') {
            processedNotes = processedNotes.filter(n => n.paper && n.paper.toLowerCase() === 'theory');
        } else if (currentCategory === 'practical') {
            processedNotes = processedNotes.filter(n => n.paper && n.paper.toLowerCase() === 'practical');
        }

        // 2. Filter Search
        const query = searchInput.value.toLowerCase();
        if (query) {
            processedNotes = processedNotes.filter(n => {
                return (n.name && n.name.toLowerCase().includes(query)) ||
                       (n.teacher && n.teacher.toLowerCase().includes(query)) ||
                       (n.subject && n.subject.toLowerCase().includes(query)) ||
                       (n.paperCode && n.paperCode.toLowerCase().includes(query));
            });
        }

        // 3. Sort
        const sortValue = sortSelect.value;
        processedNotes.sort((a, b) => {
            switch(sortValue) {
                case 'date-desc': return new Date(b.uploadedOn) - new Date(a.uploadedOn);
                case 'date-asc': return new Date(a.uploadedOn) - new Date(b.uploadedOn);
                case 'name-asc': return (a.name || '').localeCompare(b.name || '');
                case 'name-desc': return (b.name || '').localeCompare(a.name || '');
                case 'subject-asc': return (a.subject || '').localeCompare(b.subject || '');
                case 'teacher-asc': return (a.teacher || '').localeCompare(b.teacher || '');
                default: return 0;
            }
        });

        displayNotes(processedNotes);
    }

    // --- Render Notes ---
    function displayNotes(notesToDisplay) {
        const notesGrid = document.getElementById('notes-grid');
        notesGrid.innerHTML = ''; 

        if (notesToDisplay.length === 0) {
            notesGrid.innerHTML = `<div class="empty-state"><p>No notes found matching your criteria.</p></div>`;
            return;
        }

        notesToDisplay.forEach(note => {
            const dateObj = new Date(note.uploadedOn);
            const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown Date';
            
            // Set secure PDF url
            let safeUrl = note.noteUrl || '#';
            if (safeUrl !== '#' && !safeUrl.endsWith('.pdf') && safeUrl.includes('/image/upload/')) {
                safeUrl = `${safeUrl}.pdf`;
            }
            
            // Verify if note is unlocked
            const price = note.price !== undefined ? note.price : 5;
            let isUnlocked = false;
            
            if (currentUser) {
                // Unlocked if user purchased it, uploaded it, or if it's free
                if ((currentUser.notes && currentUser.notes.includes(note._id)) || 
                     currentUser.userName === note.uploadedBy || 
                     price === 0) {
                    isUnlocked = true;
                }
            } else if (price === 0) {
                isUnlocked = true; // Free for everyone
            }

            const card = document.createElement('div');
            card.className = 'note-card';

            card.innerHTML = `
                <div class="card-header">
                    <span class="note-badge">${note.paper || 'General'}</span>
                    <span class="note-date">${formattedDate}</span>
                </div>
                <h3>${note.name || 'Untitled Note'}</h3>
                <p class="note-subject">${note.subject || 'No Subject'} - ${note.paperCode || 'N/A'}</p>
                
                <div class="note-meta-grid">
                    <div class="meta-item"><span class="meta-label">Teacher</span><span class="meta-value">${note.teacher || 'N/A'}</span></div>
                    <div class="meta-item"><span class="meta-label">Semester</span><span class="meta-value">${note.semester || 'N/A'}</span></div>
                    <div class="meta-item"><span class="meta-label">Module No</span><span class="meta-value">${note.moduleNumber || 'N/A'}</span></div>
                </div>

                <div class="card-footer">
                    <!-- Left side: Uploader & Price stacked together -->
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <div class="uploader-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>${note.uploadedBy || 'Anonymous'}</span>
                        </div>
                        <div class="price-info">
                            🪙 ${price} Credits
                        </div>
                    </div>
                    
                    <!-- Right side: Button -->
                    ${isUnlocked ? `
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn-download" style="align-self: flex-end;">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> View
                        </a>
                    ` : `
                        <button class="btn-lock" style="align-self: flex-end;" onclick="openPurchaseModal('${note._id}', '${note.name.replace(/'/g, "\\'")}', ${price})">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Unlock
                        </button>
                    `}
                </div>
            `;
            notesGrid.appendChild(card);
        });
    }

    // Event Listeners for Nav
    function handleCategoryClick(navElement, category, title) {
        allNavItems.forEach(item => item.classList.remove('active'));
        navElement.classList.add('active');
        categoryTitle.textContent = title;
        currentCategory = category;
        if (navLinksContainer.classList.contains('nav-active')) {
            navLinksContainer.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
        }
        updateView();
    }
    navAll.addEventListener('click', (e) => { e.preventDefault(); handleCategoryClick(navAll, 'all', 'All Notes'); });
    navTheory.addEventListener('click', (e) => { e.preventDefault(); handleCategoryClick(navTheory, 'theory', 'Theory Notes'); });
    navPractical.addEventListener('click', (e) => { e.preventDefault(); handleCategoryClick(navPractical, 'practical', 'Practical Notes'); });

    sortSelect.addEventListener('change', updateView);
    searchInput.addEventListener('input', updateView);

    // Run startup
    init();
});

// --- Modal & Purchase Logic (Exposed to window for inline onclick) ---
window.openPurchaseModal = (noteId, noteName, price) => {
    if (!currentUser) {
        alert("You must be logged in to unlock notes.");
        window.location.href = './logIn.html';
        return;
    }
    selectedNoteForPurchase = { noteId, price };
    document.getElementById('purchase-note-name').innerText = noteName;
    document.getElementById('purchase-note-price').innerText = price + " Credits";
    document.getElementById('purchase-modal').style.display = 'flex';
};

window.closePurchaseModal = () => {
    document.getElementById('purchase-modal').style.display = 'none';
    selectedNoteForPurchase = null;
};

window.submitPurchase = async () => {
    if (!selectedNoteForPurchase || !currentUser) return;
    
    // Optimistic Check
    if (currentUser.credits < selectedNoteForPurchase.price) {
        alert("Insufficient credits to unlock this note. Please buy more credits from your profile.");
        closePurchaseModal();
        return;
    }

    const confirmBtn = document.getElementById('btn-confirm-purchase');
    confirmBtn.innerText = "Unlocking...";
    confirmBtn.disabled = true;

    try {
        const response = await fetch(`${BACKEND_URL}/api/notes/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: currentUser.userName,
                noteId: selectedNoteForPurchase.noteId
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Update local state without needing a full page reload
            currentUser.credits = data.credits;
            currentUser.notes.push(selectedNoteForPurchase.noteId);
            
            alert("Note unlocked successfully!");
            closePurchaseModal();
            
            // Re-render the grid so the lock button changes to the view button
            document.getElementById('search-input').dispatchEvent(new Event('input')); 
        } else {
            alert(data.message || "Failed to purchase note.");
            closePurchaseModal();
        }
    } catch (error) {
        console.error("Purchase error:", error);
        alert("A network error occurred.");
        closePurchaseModal();
    } finally {
        confirmBtn.innerText = "Yes, Unlock";
        confirmBtn.disabled = false;
    }
};