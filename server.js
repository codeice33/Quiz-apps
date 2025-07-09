// Manual payout endpoint (for admin only)
app.post('/manual-payout', (req, res) => {
    const { name, account_number, bank_name, email } = req.body;
    // Print payout info to terminal for admin
    console.log('\n--- MANUAL PAYOUT REQUEST ---');
    console.log('Full Name:', name);
    console.log('Account Number:', account_number);
    console.log('Bank:', bank_name);
    console.log('Email:', email);
    console.log('-----------------------------\n');
    res.json({ success: true });
});
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 4000;

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
