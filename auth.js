import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Initialize Firebase Auth
const auth = getAuth();

// Select nav-links container
const navLinksContainer = document.getElementById('nav-links');

// Render login/signup or user info
const renderNavLinks = (user) => {
    navLinksContainer.innerHTML = ''; // Clear existing content

    if (user) {
        // User logged in: show profile and logout
        const profilePic = document.createElement('img');
        profilePic.src = user.photoURL || 'https://placehold.co/40x40';
        profilePic.alt = 'Profile';
        profilePic.className = 'w-8 h-8 rounded-full border border-white';

        const displayName = document.createElement('span');
        displayName.textContent = user.displayName || 'User';
        displayName.className = 'text-gray-200 font-medium ml-2';

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition';
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                console.log("User signed out");
            } catch (err) {
                console.error("Logout error:", err);
            }
        });

        const userContainer = document.createElement('div');
        userContainer.className = 'flex items-center gap-2';
        userContainer.appendChild(profilePic);
        userContainer.appendChild(displayName);
        userContainer.appendChild(logoutBtn);

        navLinksContainer.appendChild(userContainer);
    } else {
        // User not logged in: show login and signup
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Login';
        loginLink.className = 'px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition';

        const signupLink = document.createElement('a');
        signupLink.href = 'signup.html';
        signupLink.textContent = 'Sign Up';
        signupLink.className = 'px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition';

        navLinksContainer.appendChild(loginLink);
        navLinksContainer.appendChild(signupLink);
    }
};

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
    renderNavLinks(user);
});
