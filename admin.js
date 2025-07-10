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
                        <button class="mark-paid-btn" style="margin-top:10px;padding:6px 16px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;display:${payout.paid ? 'none' : 'inline'};">Mark as Paid</button>
                        <span class="paid-status" style="margin-left:10px;color:#28a745;font-weight:600;display:${payout.paid ? 'inline' : 'none'};">PAID</span>
                    `;
                    // Add click event for Mark as Paid
                    const paidBtn = li.querySelector('.mark-paid-btn');
                    const paidStatus = li.querySelector('.paid-status');
                    if (paidBtn) {
                        paidBtn.addEventListener('click', () => {
                            fetch(ONLINE_BACKEND + '/manual-payouts/mark-paid', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ timestamp: payout.timestamp })
                            })
                            .then(res => res.json())
                            .then(resp => {
                                if (resp.success) {
                                    paidBtn.style.display = 'none';
                                    paidStatus.style.display = 'inline';
                                } else {
                                    alert('Failed to mark as paid.');
                                }
                            })
                            .catch(() => alert('Failed to mark as paid.'));
                        });
                    }
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

// Add clear paid history button
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Paid History';
    clearBtn.style.cssText = 'margin:20px auto 0;display:block;padding:10px 24px;background:#dc3545;color:#fff;border:none;border-radius:5px;font-size:16px;font-weight:600;cursor:pointer;';
    clearBtn.onclick = function() {
        if (confirm('Are you sure you want to clear all paid payout history?')) {
            fetch(ONLINE_BACKEND + '/manual-payouts/clear-paid', { method: 'POST' })
                .then(res => res.json())
                .then(resp => {
                    if (resp.success) fetchPayouts();
                    else alert('Failed to clear paid history.');
                })
                .catch(() => alert('Failed to clear paid history.'));
        }
    };
    document.body.appendChild(clearBtn);
});
}

// Refresh every 10 seconds
document.addEventListener('DOMContentLoaded', () => {
    fetchPayouts();
    setInterval(fetchPayouts, 10000);
});
