
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// In-memory storage for manual payout requests (for demo; use DB for production)
const manualPayouts = [];

// Helper: Find payout by timestamp (unique enough for demo, allow type coercion)
function findPayoutIndex(timestamp) {
    // Accept both string and number for timestamp
    return manualPayouts.findIndex(p => String(p.timestamp) === String(timestamp));
}

// Manual payout endpoint (for admin only)
app.post('/manual-payout', (req, res) => {
    const { name, account_number, bank_name, email } = req.body;
    // Prevent duplicate submissions (same name, account, bank, email within 10 seconds)
    const now = Date.now();
    const duplicate = manualPayouts.find(p =>
        p.name === name &&
        p.account_number === account_number &&
        p.bank_name === bank_name &&
        p.email === email &&
        Math.abs(now - p.timestamp) < 10000 // 10 seconds
    );
    if (duplicate) {
        return res.status(409).json({ success: false, message: 'Duplicate submission detected. Please wait a moment.' });
    }
    const payout = {
        name,
        account_number,
        bank_name,
        email,
        timestamp: now,
        paid: false
    };
    manualPayouts.push(payout);
    // Print payout info to terminal for admin
    console.log('\n--- MANUAL PAYOUT REQUEST ---');
    console.log('Full Name:', name);
    console.log('Account Number:', account_number);
    console.log('Bank:', bank_name);
    console.log('Email:', email);
    console.log('-----------------------------\n');
    res.json({ success: true });
});

// Mark payout as paid
app.post('/manual-payouts/mark-paid', (req, res) => {
    const { timestamp } = req.body;
    const idx = findPayoutIndex(timestamp);
    if (idx !== -1) {
        manualPayouts[idx].paid = true;
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Payout not found' });
});

// Clear all paid payouts
app.post('/manual-payouts/clear-paid', (req, res) => {
    for (let i = manualPayouts.length - 1; i >= 0; i--) {
        if (manualPayouts[i].paid) manualPayouts.splice(i, 1);
    }
    res.json({ success: true });
});

// Admin endpoint to get all manual payout requests
app.get('/manual-payouts', (req, res) => {
    res.json(manualPayouts);
});

// Debug: Print Paystack secret key (first 6 chars only for security)
console.log('Paystack Key:', process.env.PAYSTACK_SECRET_KEY ? process.env.PAYSTACK_SECRET_KEY.slice(0, 6) + '...' : 'NOT SET');

// Root route for friendly message
app.get('/', (req, res) => {
    res.send('Quiz App Backend is running.');
});

app.use(cors());
app.use(express.json());

// Paystack payout endpoint
app.post('/claim-reward', async (req, res) => {
    // Collect payout details from frontend
    const { name, account_number, bank_code, email, amount = 100 } = req.body;
    if (!name || !account_number || !bank_code || !email) {
        return res.status(400).json({ success: false, message: 'All payout details are required.' });
    }

    try {
        // 1. Create a transfer recipient
        const recipientResp = await axios.post('https://api.paystack.co/transferrecipient', {
            type: 'nuban',
            name,
            account_number,
            bank_code,
            currency: 'NGN',
            email
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const recipientCode = recipientResp.data.data.recipient_code;

        // 2. Initiate transfer (test mode)
        const transferResp = await axios.post('https://api.paystack.co/transfer', {
            source: 'balance',
            amount: amount * 100, // Paystack expects kobo
            recipient: recipientCode,
            reason: 'Quiz reward payout'
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ success: true, message: 'Reward claimed! Paystack payout initiated.', transfer: transferResp.data });
    } catch (error) {
        // Log the full error for debugging
        console.error('Paystack payout error:', error.response ? error.response.data : error);
        let msg = 'Paystack payout failed.';
        if (error.response && error.response.data) {
            msg = error.response.data.message;
        }
        res.status(500).json({ success: false, message: msg });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
