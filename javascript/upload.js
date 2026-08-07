document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('pdfFile');
    const fileError = document.getElementById('file-error');
    const submitBtn = document.querySelector('.btn-submit');

    // 1. File Size Validation (Max 2MB)
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        
        if (file) {
            if (file.type !== "application/pdf") {
                fileError.textContent = "Only PDF files are allowed.";
                this.value = ''; // Clear the input
            } else if (file.size > maxSize) {
                fileError.textContent = "File size exceeds 2MB. Please select a smaller file.";
                this.value = ''; // Clear the input
            } else {
                fileError.textContent = ""; // Clear errors
            }
        }
    });

    // 2. Handle Form Submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Change button state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;

        // Collect all form data (Automatically grabs all inputs and the file)
        const formData = new FormData(uploadForm);

        try {
            // Send POST request
            const response = await fetch(`${BACKEND_URL}/api/notes/uploadnotes`, {
                method: 'POST',
                // Do NOT set a 'Content-Type' header here. 
                // The browser will automatically set 'multipart/form-data' with the correct boundaries for FormData.
                body: formData 
            });

            if (response.ok) {
                alert('Notes uploaded successfully!');
                uploadForm.reset();
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData && errorData.message ? errorData.message : 'Upload failed. Please try again.';
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Error during upload:', error);
            alert('A network error occurred. Please ensure your backend is running on localhost:8000.');
        } finally {
            // Restore button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});