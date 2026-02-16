// Auto-logout after 10 minutes of inactivity
let inactivityTimeout;
const TIMEOUT_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(logoutUser, TIMEOUT_DURATION);
}

function logoutUser() {
    // Clear any stored authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to logout page or login page
    window.location.href = 'login.html'; // Change this to your logout URL
}

// Listen for user activity
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

// Start the timer when page loads
resetInactivityTimer();
