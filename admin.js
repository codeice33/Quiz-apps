// admin.js
// Fetch and display manual payout requests for admin

const payoutList = document.getElementById('payout-list');
const noPayouts = document.getElementById('no-payouts');
const connectionStatus = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');

function showStatus(message, type = 'info') {
    if (connectionStatus && statusText) {
        statusText.textContent = message;
        connectionStatus.style.display = 'block';
        connectionStatus.style.backgroundColor = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1';
        connectionStatus.style.color = type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460';
        connectionStatus.style.border = `1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'}`;
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (connectionStatus) connectionStatus.style.display = 'none';
            }, 5000);
        }
    }
}

// IMPORTANT: Set this to your backend's deployed URL
const ONLINE_BACKEND = 'https://quiz-appi.onrender.com'; // <-- Backend deployed on Render

// Basic HTML escape to avoid injection from server data
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fetchPayouts() {
    let apiUrl = ONLINE_BACKEND + '/manual-payouts';
    
    console.log('Fetching payouts from:', apiUrl);
    showStatus('Loading payouts...', 'info');
    
    fetch(apiUrl)
        .then(res => {
            console.log('Fetch response status:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Fetched payout data:', data);
            showStatus(`Successfully loaded ${data.length} payout(s)`, 'success');
            
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
                        <div><span class="payout-label">Reward Amount:</span> ₦${payout.reward_amount || 500}</div>
                        ${payout.score ? `<div><span class="payout-label">Score:</span> ${payout.score}/${payout.total_questions} (${payout.score_percentage}%)</div>` : ''}
                        <div><span class="payout-label">Time:</span> ${new Date(payout.timestamp).toLocaleString()}</div>
                        <button class="mark-paid-btn" style="margin-top:10px;padding:6px 16px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;display:${payout.paid ? 'none' : 'inline'};">Mark as Paid ₦${payout.reward_amount || 500}</button>
                        <span class="paid-status" style="margin-left:10px;color:#28a745;font-weight:600;display:${payout.paid ? 'inline' : 'none'};">PAID</span>
                    `;
                    // Add click event for Mark as Paid
                    const paidBtn = li.querySelector('.mark-paid-btn');
                    const paidStatus = li.querySelector('.paid-status');
                    if (paidBtn) {
                        paidBtn.addEventListener('click', () => {
                            let markPaidUrl = ONLINE_BACKEND + '/manual-payouts/mark-paid';
                            
                            fetch(markPaidUrl, {
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
        .catch((error) => {
            console.error('Error fetching payouts:', error);
            showStatus(`Error loading payouts: ${error.message}`, 'error');
            payoutList.innerHTML = `<li class="payout-item" style="color: red; text-align: center; padding: 20px;">
                <strong>Connection Error</strong><br>
                ${error.message}<br><br>
                <small>Make sure the server is running on https://quiz-appi.onrender.com<br>
                Try refreshing the page or check the browser console for details.</small>
            </li>`;
            noPayouts.style.display = 'none';
        });
}

// Fetch and render leaderboard data
function fetchLeaderboard() {
    const url = ONLINE_BACKEND + '/leaderboard';
    console.log('Fetching leaderboard from:', url);
    // show loading placeholders
    const topList = document.getElementById('leaderboard-top');
    const winnersList = document.getElementById('leaderboard-winners');
    if (topList) topList.innerHTML = '<li style="padding:8px;color:#888">Loading...</li>';
    if (winnersList) winnersList.innerHTML = '<li style="padding:8px;color:#888">Loading...</li>';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(url, { signal: controller.signal })
        .then(res => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            if (topList) topList.innerHTML = '';
            if (winnersList) winnersList.innerHTML = '';

            if (data && Array.isArray(data.topScorers) && data.topScorers.length) {
                data.topScorers.forEach((item, idx) => {
                    const li = document.createElement('li');
                    li.style.padding = '8px 6px';
                    li.style.borderBottom = '1px solid #e9ecef';
                    let pct = item.score_percentage;
                    if ((pct === undefined || pct === null || isNaN(pct)) && item.total_questions && item.total_questions > 0) {
                        pct = Math.round((Number(item.score) / Number(item.total_questions)) * 100);
                    }
                    const pctText = (pct === undefined || pct === null || isNaN(pct)) ? 'N/A' : pct + '%';
                    li.innerHTML = `<strong>${idx + 1}. ${escapeHtml(item.name || 'Anonymous')}</strong><br><small>Score: ${item.score}/${item.total_questions || 'N/A'} (${pctText})</small>`;
                    topList.appendChild(li);
                });
            } else if (topList) {
                topList.innerHTML = '<li style="padding:8px">No top scorers yet.</li>';
            }

            if (data && Array.isArray(data.biggestWinners) && data.biggestWinners.length) {
                data.biggestWinners.forEach((item) => {
                    const li = document.createElement('li');
                    li.style.padding = '8px 6px';
                    li.style.borderBottom = '1px solid #e9ecef';
                    li.innerHTML = `<strong>${escapeHtml(item.name || 'Anonymous')}</strong><br><small>Amount Paid: ₦${item.paidAmount || 0}</small>`;
                    winnersList.appendChild(li);
                });
            } else if (winnersList) {
                winnersList.innerHTML = '<li style="padding:8px">No winners yet.</li>';
            }
        })
        .catch(err => {
            console.warn('Failed to fetch leaderboard:', err);
            const msg = err.name === 'AbortError' ? 'Request timed out.' : `Unable to load leaderboard: ${err.message}`;
            if (topList) topList.innerHTML = `<li style="padding:8px;color:#888">${escapeHtml(msg)}</li>`;
            if (winnersList) winnersList.innerHTML = `<li style="padding:8px;color:#888">${escapeHtml(msg)}</li>`;
        });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch of payouts
    fetchPayouts();
    // Initial fetch of leaderboard
    fetchLeaderboard();
    
    // Set up auto-refresh every 10 seconds
    setInterval(fetchPayouts, 10000);
    // Refresh leaderboard every 15 seconds
    setInterval(fetchLeaderboard, 15000);
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            showStatus('Refreshing...', 'info');
            fetchPayouts();
        });
    }
    
    // Add clear paid history button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Paid History';
    clearBtn.style.cssText = 'margin:20px auto 0;display:block;padding:10px 24px;background:#dc3545;color:#fff;border:none;border-radius:5px;font-size:16px;font-weight:600;cursor:pointer;';
    clearBtn.onclick = function() {
        if (confirm('Are you sure you want to clear all paid payout history?')) {
            let clearUrl = ONLINE_BACKEND + '/manual-payouts/clear-paid';
            
            fetch(clearUrl, { method: 'POST' })
                .then(res => res.json())
                .then(resp => {
                    if (resp.success) fetchPayouts();
                    else alert('Failed to clear paid history.');
                })
                .catch(() => alert('Failed to clear paid history.'));
        }
    };
    // Append clear button inside the admin container instead of document body
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
        adminContainer.appendChild(clearBtn);
    } else {
        // Fallback to body if admin container not found
        document.body.appendChild(clearBtn);
    }
});
