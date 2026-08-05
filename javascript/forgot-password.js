const API_BASE = "https://texanotes-backend.vercel.app/api/auth";

// State to hold the email across the different steps
let userEmail = "";

// UI Elements
const stepEmail = document.getElementById('step-email');
const stepOtp = document.getElementById('step-otp');
const stepPassword = document.getElementById('step-password');

// Step 1: Send OTP
document.getElementById('email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email').value;
    const btn = document.getElementById('btn-email');

    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/sendOtp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput })
        });
        
        const data = await response.json();

        if (response.ok) {
            userEmail = emailInput; // Save email for next steps
            stepEmail.classList.remove('active');
            stepOtp.classList.add('active');
            alert("OTP sent to your email!");
        } else {
            alert(data.message || "Failed to send OTP.");
        }
    } catch (error) {
        alert("Network error. Please try again.");
    } finally {
        btn.textContent = "Send OTP";
        btn.disabled = false;
    }
});

// Step 2: Verify OTP
document.getElementById('otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const otpInput = document.getElementById('otp').value;
    const btn = document.getElementById('btn-otp');

    btn.textContent = "Verifying...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/verifyOtp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, otp: otpInput })
        });
        
        const data = await response.json();

        if (response.ok) {
            stepOtp.classList.remove('active');
            stepPassword.classList.add('active');
        } else {
            alert(data.message || "Invalid OTP.");
        }
    } catch (error) {
        alert("Network error. Please try again.");
    } finally {
        btn.textContent = "Verify OTP";
        btn.disabled = false;
    }
});

// Step 3: Reset Password
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById('new-password').value;
    const btn = document.getElementById('btn-password');

    btn.textContent = "Resetting...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/resetPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: passwordInput })
        });
        
        const data = await response.json();

        if (response.ok) {
            alert("Password reset successfully! You can now log in.");
            window.location.href = "./logIn.html"; // Redirect to login
        } else {
            alert(data.message || "Failed to reset password.");
        }
    } catch (error) {
        alert("Network error. Please try again.");
    } finally {
        btn.textContent = "Reset Password";
        btn.disabled = false;
    }
});