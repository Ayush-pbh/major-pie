// script.js

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const otp = document.getElementById('otp').value;

    // Make a POST request to the backend to handle login
    const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, otp }),
    });

    const data = await response.json();
    document.getElementById('login-message').textContent = data.message;
});


async function sendOtp() {
    let email = document.getElementById('email').value;
    const response = await fetch('/login-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    document.getElementById('login-message').textContent = data.message;

}

// Function to remove all iframes
function removeAllIFrames() {
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe => {
        iframe.parentNode.removeChild(iframe);
    });
    console.log("IFrame Sanitized!");

}

// Event listener for page load
window.onload = removeAllIFrames(); // Call the function when the page loads
