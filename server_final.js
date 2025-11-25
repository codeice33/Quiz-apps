const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:4000', 'http://127.0.0.1:4000', 'https://quiz-appi.onrender.com', 'https://quiz-apps-rho.vercel.app', 'null'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// In-memory storage
const manualPayouts = [];
const payments = [];
const winners = [
    { name: 'Top Player 1', score: 95, total_questions: 100, score_percentage: 95, email: 'top1@example.com', timestamp: Date.now() - 86400000, paidAmount: 0 },
    { name: 'Top Player 2', score: 88, total_questions: 100, score_percentage: 88, email: 'top2@example.com', timestamp: Date.now() - 43200000, paidAmount: 5000 },
    { name: 'Winner Player', score: 92, total_questions: 100, score_percentage: 92, email: 'winner@example.com', timestamp: Date.now() - 3600000, paidAmount: 10000 }
];

// Helper function
function findPayoutIndex(timestamp) {
    return manualPayouts.findIndex(p => String(p.timestamp) === String(timestamp));
}

// Routes
app.get('/', (req, res) => {
    res.send('Quiz App Backend is running.');
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), server: 'Quiz App Backend' });
});

// Manual payout endpoints
app.post('/manual-payout', (req, res) => {
    const { name, account_number, bank_name, email, reward_amount = 500, score = 0, total_questions = 0, score_percentage = 0 } = req.body;
    
    if (!name || !account_number || !bank_name) {
        return res.status(400).json({ success: false, message: 'Name, account number, and bank name are required.' });
    }
    
    if (!/^\d{10}$/.test(account_number)) {
        return res.status(400).json({ success: false, message: 'Account number must be exactly 10 digits.' });
    }
    
    const now = Date.now();
    const duplicate = manualPayouts.find(p =>
        p.name === name && p.account_number === account_number && p.bank_name === bank_name &&
        p.email === email && Math.abs(now - p.timestamp) < 10000
    );
    
    if (duplicate) {
        return res.status(409).json({ success: false, message: 'Duplicate submission detected. Please wait a moment.' });
    }
    
    const payout = { name, account_number, bank_name, email, reward_amount, score, total_questions, score_percentage, timestamp: now, paid: false };
    manualPayouts.push(payout);
    
    console.log('\n--- MANUAL PAYOUT REQUEST ---');
    console.log('Name:', name);
    console.log('Account:', account_number);
    console.log('Bank:', bank_name);
    console.log('Email:', email);
    console.log('Amount: ₦' + reward_amount);
    console.log('Score:', score + '/' + total_questions + ' (' + score_percentage + '%)');
    console.log('-----------------------------\n');
    
    res.json({ success: true });
});

app.get('/manual-payouts', (req, res) => {
    res.json(manualPayouts);
});

app.post('/manual-payouts/mark-paid', (req, res) => {
    const { timestamp } = req.body;
    const idx = findPayoutIndex(timestamp);
    if (idx !== -1) {
        manualPayouts[idx].paid = true;
        const payout = manualPayouts[idx];
        const match = winners.find(w => (w.email && w.email === payout.email) || (w.account_number && w.account_number === payout.account_number));
        if (match) {
            match.paidAmount = (match.paidAmount || 0) + (payout.reward_amount || 100);
        }
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Payout not found' });
});

app.post('/manual-payouts/clear-paid', (req, res) => {
    for (let i = manualPayouts.length - 1; i >= 0; i--) {
        if (manualPayouts[i].paid) manualPayouts.splice(i, 1);
    }
    res.json({ success: true });
});

// Leaderboard endpoint
app.get('/leaderboard', (req, res) => {
    const topScorers = [...winners].sort((a, b) => b.score - a.score).slice(0, 20);
    const biggestWinners = [...winners].filter(w => w.paidAmount && w.paidAmount > 0).sort((a, b) => b.paidAmount - a.paidAmount).slice(0, 20);
    res.json({ topScorers, biggestWinners });
});

// Record score endpoint
app.post('/record-score', (req, res) => {
    const { name, score, total_questions, email, score_percentage } = req.body;
    if (typeof score !== 'number') {
        return res.status(400).json({ success: false, message: 'Score required' });
    }
    const entry = {
        name: name || 'Anonymous',
        score,
        total_questions: total_questions || 0,
        score_percentage: score_percentage || 0,
        email: email || '',
        timestamp: Date.now(),
        paidAmount: 0
    };
    winners.push(entry);
    console.log('Score recorded:', entry);
    res.json({ success: true });
});

// Email endpoint (simulated)
app.post('/send-email', (req, res) => {
    const { name, email, accessCode } = req.body;
    if (!name || !email || !accessCode) {
        return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }
    console.log('Email sent to:', email);
    setTimeout(() => res.json({ success: true, message: 'Email sent' }), 1000);
});

// Paystack endpoints (placeholder)
app.post('/claim-reward', (req, res) => {
    const { name, account_number, bank_code, amount = 100 } = req.body;
    if (!name || !account_number || !bank_code) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    res.json({ success: true, message: 'Payout initiated' });
});

app.post('/verify-payment', (req, res) => {
    const { reference, amount } = req.body;
    if (!reference) return res.status(400).json({ success: false, message: 'Reference required' });
    payments.push({ reference, amount: amount || 500, timestamp: Date.now() });
    res.json({ success: true, message: 'Payment verified' });
});

// Debug info
console.log('Paystack Key:', process.env.PAYSTACK_SECRET_KEY ? process.env.PAYSTACK_SECRET_KEY.slice(0, 6) + '...' : 'NOT SET');

// Start server
const server = app.listen(PORT, () => {
    console.log(`Backend server running and listening on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err.message);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});
