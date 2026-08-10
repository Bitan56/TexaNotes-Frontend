let selectedPrice = 0;
let selectedCredits = 0;

// IMPORTANT: Replace this with your actual GPay UPI ID!
const MY_UPI_ID = "bitanchakraborty00@okhdfcbank"; 
const PAYEE_NAME = "TexaNotes";

function selectPackage(price, credits) {
    selectedPrice = price;
    selectedCredits = credits;

    // Highlight selected card
    const cards = document.querySelectorAll('.package-card');
    cards.forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    // Update Payment Section
    document.getElementById('display-credits').innerText = credits;
    document.getElementById('display-price').innerText = `₹${price}`;
    document.getElementById('payment-section').style.display = 'block';

    // Generate UPI URI
    const upiUri = `upi://pay?pa=${MY_UPI_ID}&pn=${PAYEE_NAME}&am=${price}&cu=INR`;
    
    // Set Mobile Deep Link
    document.getElementById('upi-link-btn').href = upiUri;

    // Generate Desktop QR Code using a public API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
    document.getElementById('qr-code-img').src = qrUrl;

    // Scroll down to payment section smoothly
    document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth' });
}

async function verifyAndClaim() {
    const userName = localStorage.getItem('userName');
    const utrInput = document.getElementById('utr-input').value;
    
    if (!userName) {
        alert("You must be logged in to claim credits.");
        window.location.href = './logIn.html';
        return;
    }

    if (selectedCredits === 0) {
        alert("Please select a package first.");
        return;
    }

    if (!utrInput || utrInput.length < 12) {
        alert("Please enter a valid 12-digit UTR or Transaction ID from your UPI app.");
        return;
    }

    const btn = document.getElementById('btn-verify-payment');
    btn.innerText = "Verifying...";
    btn.disabled = true;

    try {
        const API_URL = `${BACKEND_URL}`;
        
        const response = await fetch(`${API_URL}/api/credits/user-buy-credits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: userName,
                amountPaid: selectedPrice,
                creditsToAdd: selectedCredits,
                transactionId: utrInput
            })
        });

        if (response.ok) {
            alert(`Payment verified! ${selectedCredits} credits have been added to your account.`);
            window.location.href = '../index.html'; // Redirect back home
        } else {
            const data = await response.json();
            alert(data.message || "Verification failed. Please contact support.");
        }
    } catch (error) {
        console.error("Error during payment verification:", error);
        alert("A network error occurred.");
    } finally {
        btn.innerText = "Claim Credits";
        btn.disabled = false;
    }
}