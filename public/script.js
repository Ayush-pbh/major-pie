// script.js
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const dob = document.getElementById('dob').value;
    // const recaptchaToken = document.getElementById('recaptchaToken').value;


    // Make a POST request to the backend to handle registration
    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password, confirmPassword, dob }),
    });

    const data = await response.json();
    document.getElementById('registration-message').textContent = data.message;
});

// document.getElementById('login-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     // Make a POST request to the backend to handle login
//     const response = await fetch('/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();
//     document.getElementById('login-message').textContent = data.message;
// });

// Function to remove all iframes
function removeAllIFrames() {
    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe => {
        iframe.parentNode.removeChild(iframe);
    });
    console.log("IFrame Sanitized!");
}
window.onload = removeAllIFrames(); // Call the function when the page loads