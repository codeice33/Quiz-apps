// Simple localStorage auth for the Quiz app.
// NOTE: This is client-side only (not secure for real passwords).

(function () {
    const USERS_KEY = 'quizUsers';
    const CURRENT_USER_KEY = 'currentUser';
    const REDIRECT_KEY = 'postLoginRedirect';

    function safeJsonParse(value, fallback) {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function getUsers() {
        return safeJsonParse(localStorage.getItem(USERS_KEY) || '[]', []);
    }

    function setUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getCurrentUser() {
        return safeJsonParse(localStorage.getItem(CURRENT_USER_KEY) || 'null', null);
    }

    function setCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    function logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    function isThemeAppPage() {
        return document.body && document.body.classList.contains('theme-app');
    }

    function requireLoginForApp() {
        if (!isThemeAppPage()) return;
        const user = getCurrentUser();
        if (!user || !user.email) {
            // Remember where to return after login
            localStorage.setItem(REDIRECT_KEY, 'index.html');
            window.location.replace('login.html');
        }
    }

    function updateTopbar() {
        const user = getCurrentUser();
        const userChip = document.querySelector('[data-auth="user"]');
        const userNameEl = document.querySelector('[data-auth="user-name"]');
        const loginLink = document.querySelector('[data-auth="login-link"]');
        const signupLink = document.querySelector('[data-auth="signup-link"]');
        const logoutBtn = document.querySelector('[data-auth="logout-btn"]');

        if (!user || !user.email) {
            if (userChip) userChip.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginLink) loginLink.style.display = 'inline-flex';
            if (signupLink) signupLink.style.display = 'inline-flex';
            return;
        }

        if (userNameEl) userNameEl.textContent = user.name || user.email;
        if (userChip) userChip.style.display = 'inline-flex';
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';

        if (logoutBtn && !logoutBtn.__authBound) {
            logoutBtn.__authBound = true;
            logoutBtn.addEventListener('click', function () {
                logout();
                window.location.replace('login.html');
            });
        }
    }

    function prefillPaymentForm() {
        if (!isThemeAppPage()) return;
        const user = getCurrentUser();
        if (!user || !user.email) return;

        const nameInput = document.getElementById('payment-name');
        const emailInput = document.getElementById('payment-email');
        const phoneInput = document.getElementById('payment-phone');

        if (emailInput) emailInput.value = user.email || '';
        if (nameInput) nameInput.value = user.name || '';

        // pull phone from saved users list
        const users = getUsers();
        const full = users.find((u) => u && u.email === user.email);
        if (phoneInput && full && full.phone) phoneInput.value = full.phone;
    }

    // Expose minimal API for auth pages
    window.Auth = {
        getUsers,
        setUsers,
        getCurrentUser,
        setCurrentUser,
        logout,
    };

    // Run early guard (best-effort; navigation may already start loading other scripts)
    requireLoginForApp();

    document.addEventListener('DOMContentLoaded', function () {
        // Enforce again after DOM ready (in case body class was not ready earlier)
        requireLoginForApp();
        updateTopbar();
        prefillPaymentForm();
    });
})();

