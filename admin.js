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
                        <div><span class="payout-label">${idx + 1}</span></div>
                        <div><span class="payout-label">Name:</span> ${payout.name}</div>
                        <div><span class="payout-label">Account Number:</span> ${payout.account_number}</div>
                        <div><span class="payout-label">Bank:</span> ${payout.bank_name}</div>
                        <div><span class="payout-label">Email:</span> ${payout.email}</div>
                        <div><span class="payout-label">Time:</span> ${new Date(payout.timestamp).toLocaleString()}</div>
                        <button class="mark-paid-btn" style="margin-top:10px;padding:6px 16px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;">Mark as Paid</button>
                        <span class="paid-status" style="margin-left:10px;color:#28a745;font-weight:600;display:none;">PAID</span>
                    `;
                    // Add click event for Mark as Paid
                    const paidBtn = li.querySelector('.mark-paid-btn');
                    const paidStatus = li.querySelector('.paid-status');
                    paidBtn.addEventListener('click', () => {
                        paidBtn.style.display = 'none';
                        paidStatus.style.display = 'inline';
                    });
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
