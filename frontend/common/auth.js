// Authentication logic
// --- Authentication Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const emailNote = document.getElementById('emailNote');

    if (toggleFormBtn) {
        toggleFormBtn.addEventListener('click', () => {
            loginForm.classList.toggle('hidden');
            signupForm.classList.toggle('hidden');
            const isSignupVisible = !signupForm.classList.contains('hidden');
            toggleFormBtn.innerHTML = isSignupVisible 
                ? 'Already have an account? <span class="text-blue-600 font-semibold">Login</span>'
                : 'New to Canteen? <span class="text-blue-600 font-semibold">Create an account</span>';
            if (emailNote) {
                emailNote.classList.toggle('hidden', !isSignupVisible);
            }
        });
    }
    
    // Add event listeners for login and signup form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = event.target.loginEmail.value;
            const password = event.target.loginPassword.value;
            // TODO: Implement login logic here (e.g., API call)
            console.log('Login attempt with:', { email, password });
            // For now, redirect to dashboard on successful "login"
            window.location.href = 'student/dashboard.html';
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = event.target.signupEmail.value;
            const password = event.target.signupPassword.value;
            const confirmPassword = event.target.confirmPassword.value;

            if (!email.endsWith('@vit.edu.in')) {
                alert('Only @vit.edu.in emails are allowed.');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            // TODO: Implement signup logic here (e.g., API call)
            console.log('Signup attempt with:', { email, password });
            // For now, redirect to login page after successful "signup"
            window.location.href = 'index.html';
        });
    }
});
