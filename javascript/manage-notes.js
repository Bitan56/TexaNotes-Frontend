document.addEventListener('DOMContentLoaded', () => {
    fetchNotes();
});

// Fetch all notes
async function fetchNotes() {
    const tbody = document.getElementById('notes-table-body');
    
    try {
        const response = await fetch('https://texanotes-backend.vercel.app/api/notes/getnotes');
        
        if (!response.ok) {
            throw new Error("Failed to fetch notes");
        }

        const result = await response.json();
        const notes = result.data ? result.data : result;

        if (notes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center loading-text">No notes found in the system.</td></tr>';
            return;
        }

        // Generate table rows dynamically
        tbody.innerHTML = notes.map(note => {
            return `
                <tr>
                    <td><strong>${note.name || 'Untitled'}</strong></td>
                    <td>${note.paper || 'N/A'}</td>
                    <td>${note.teacher || 'Unknown'}</td>
                    <td>
                        <a href="${note.noteUrl || '#'}" target="_blank" class="btn-action btn-view">View File</a>
                    </td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editNote('${note._id}')">Edit</button>
                        <button class="btn-action btn-delete" onclick="deleteNote('${note._id}', '${note.name}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching notes:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:red; padding: 2rem;">Error connecting to the server.</td></tr>';
    }
}

// Delete note logic
window.deleteNote = async (noteId, noteName) => {
    if (!confirm(`Are you sure you want to permanently delete the note: "${noteName}"? This will also remove the file from storage.`)) {
        return;
    }

    try {
        // Assuming your backend route is DELETE /api/notes/delete/:id
        const response = await fetch(`https://texanotes-backend.vercel.app/api/notes/delete/${noteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Note deleted successfully.');
            fetchNotes(); // Refresh the table
        } else {
            const errorData = await response.json().catch(() => null);
            alert(errorData?.message || 'Failed to delete note.');
        }
    } catch (error) {
        console.error("Error deleting note:", error);
        alert("A network error occurred.");
    }
};

// Edit note logic
window.editNote = (noteId) => {
    // Redirects the user to the edit page and passes the note's ID in the URL
    window.location.href = `edit-note.html?id=${noteId}`;
};