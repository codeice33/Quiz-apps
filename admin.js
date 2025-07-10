// admin.js
// Fetch and display manual payout requests for admin

const payoutList = document.getElementById('payout-list');
const noPayouts = document.getElementById('no-payouts');

// IMPORTANT: Set this to your backend's deployed URL
const ONLINE_BACKEND = 'https://quiz-appi.onrender.com'; // <-- Backend deployed on Render

function fetchPayouts() {
    let apiUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://192.168.1.10:4000/manual-payouts';
    } else {
        apiUrl = ONLINE_BACKEND + '/manual-payouts';
    }
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            payoutList.innerHTML = '';
            if (data && data.length > 0) {
                noPayouts.style.display = 'none';
                data.forEach((payout, idx) => {
                    const li = document.createElement('li');
                    li.className = 'payout-item';
                    li.innerHTML = `
                        <div><span class="payout-label">#${idx + 1}</span></div>
                        <div><span class="payout-label">Name:</span> ${payout.name}</div>
                        <div><span class="payout-label">Account Number:</span> ${payout.account_number}</div>
                        <div><span class="payout-label">Bank:</span> ${payout.bank_name}</div>
                        <div><span class="payout-label">Email:</span> ${payout.email}</div>
                        <div><span class="payout-label">Time:</span> ${new Date(payout.timestamp).toLocaleString()}</div>
                    `;
                    payoutList.appendChild(li);
                });
            } else {
                noPayouts.style.display = 'block';
            }
        })
        .catch(() => {
            payoutList.innerHTML = '';
            noPayouts.style.display = 'block';
        });
}

// Refresh every 10 seconds
document.addEventListener('DOMContentLoaded', () => {
    fetchPayouts();
    setInterval(fetchPayouts, 10000);
});
