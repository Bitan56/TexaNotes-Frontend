document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Note ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');

    if (!noteId) {
        alert("No note ID provided!");
        window.location.href = "manage-notes.html";
        return;
    }

    // 2. Fetch Existing Note Data
    try {
        const response = await fetch(`${BACKEND_URL}/api/notes/${noteId}`);
        if (!response.ok) throw new Error("Failed to fetch note details");
        
        const result = await response.json();
        const note = result.data ? result.data : result;

        // Populate the form fields
        document.getElementById('name').value = note.name || '';
        document.getElementById('uploadedBy').value = note.uploadedBy || '';
        document.getElementById('teacher').value = note.teacher || '';
        document.getElementById('subject').value = note.subject || '';
        document.getElementById('paperCode').value = note.paperCode || '';
        document.getElementById('semester').value = note.semester || '';
        document.getElementById('moduleNumber').value = note.moduleNumber || '';
        
        if (note.paper) {
            document.getElementById('paper').value = note.paper;
        }

        // Setup current file link
        if (note.noteUrl) {
            let safeUrl = note.noteUrl;
            if (!safeUrl.endsWith('.pdf') && safeUrl.includes('/image/upload/')) {
                safeUrl = `${safeUrl}.pdf`;
            }
            document.getElementById('current-file-link').href = safeUrl;
        } else {
            document.getElementById('current-file-info').innerText = "No current file attached.";
        }

    } catch (error) {
        console.error("Error loading note:", error);
        alert("Could not load note data.");
    }

    // 3. Handle Form Submission
    const form = document.getElementById('edit-note-form');
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.innerText = "Updating Note...";
        submitBtn.disabled = true;

        // Use FormData because we might be sending a file
        const formData = new FormData();
        
        // Append text fields
        formData.append('name', document.getElementById('name').value);
        formData.append('uploadedBy', document.getElementById('uploadedBy').value);
        formData.append('teacher', document.getElementById('teacher').value);
        formData.append('subject', document.getElementById('subject').value);
        formData.append('paperCode', document.getElementById('paperCode').value);
        formData.append('semester', document.getElementById('semester').value);
        formData.append('moduleNumber', document.getElementById('moduleNumber').value);
        formData.append('paper', document.getElementById('paper').value);

        // Append file if selected
        const fileInput = document.getElementById('file');
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/notes/update/${noteId}`, {
                method: 'PUT',
                body: formData // No Content-Type header needed for FormData; browser sets it automatically
            });

            if (response.ok) {
                statusMessage.style.color = "green";
                statusMessage.innerText = "Note updated successfully!";
                setTimeout(() => {
                    window.location.href = "manage-notes.html";
                }, 1500);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update note");
            }
        } catch (error) {
            console.error("Update error:", error);
            statusMessage.style.color = "red";
            statusMessage.innerText = error.message;
            submitBtn.innerText = "Update Note";
            submitBtn.disabled = false;
        }
    });
});