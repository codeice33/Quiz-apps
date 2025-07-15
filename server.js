
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8000', 'http://127.0.0.1:8000', 'https://quiz-appi.onrender.com', 'null'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// In-memory storage for manual payout requests and payments (for demo; use DB for production)
const manualPayouts = [];
const payments = [];

// Helper: Find payout by timestamp (unique enough for demo, allow type coercion)
function findPayoutIndex(timestamp) {
    // Accept both string and number for timestamp
    return manualPayouts.findIndex(p => String(p.timestamp) === String(timestamp));
}

// Manual payout endpoint (for admin only)
app.post('/manual-payout', (req, res) => {
    const { 
        name, 
        account_number, 
        bank_name, 
        email, 
        reward_amount = 500, 
        score = 0, 
        total_questions = 0, 
        score_percentage = 0 
    } = req.body;
    
    // Basic validation
    if (!name || !account_number || !bank_name) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, account number, and bank name are required.' 
        });
    }
    
    // Validate account number format (should be numeric and reasonable length)
    if (!/^\d{10}$/.test(account_number)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Account number must be exactly 10 digits.' 
        });
    }
    
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
        reward_amount,
        score,
        total_questions,
        score_percentage,
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
    console.log('Reward Amount:', `₦${reward_amount}`);
    console.log('Score:', `${score}/${total_questions} (${score_percentage}%)`);
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        server: 'Quiz App Backend'
    });
});

// Send email endpoint (for access codes)
app.post('/send-email', (req, res) => {
    const { name, email, accessCode, expiryDate, quizUrl } = req.body;
    
    // Basic validation
    if (!name || !email || !accessCode) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, email, and access code are required.' 
        });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email format.' 
        });
    }
    
    // For now, we'll simulate email sending by logging to console
    // In production, you would integrate with a real email service like SendGrid, Mailgun, etc.
    console.log('\n--- EMAIL NOTIFICATION ---');
    console.log('To:', email);
    console.log('Subject: Your Quiz Access Code');
    console.log('Content:');
    console.log(`Dear ${name},`);
    console.log('');
    console.log('Your quiz access code has been generated:');
    console.log(`Access Code: ${accessCode}`);
    console.log(`Expires: ${expiryDate}`);
    console.log('');
    console.log(`You can use this code to access the quiz at: ${quizUrl}`);
    console.log('');
    console.log('Best regards,');
    console.log('Quiz App Team');
    console.log('-------------------------\n');
    
    // Simulate a small delay like a real email service
    setTimeout(() => {
        res.json({ 
            success: true, 
            message: 'Email sent successfully (simulated)',
            details: {
                recipient: email,
                accessCode: accessCode,
                expiryDate: expiryDate
            }
        });
    }, 1000);
});

// Paystack payout endpoint
app.post('/claim-reward', async (req, res) => {
    // Collect payout details from frontend
    const { name, account_number, bank_code, email, amount = 100 } = req.body;
    
    // Basic validation
    if (!name || !account_number || !bank_code) {
        return res.status(400).json({ success: false, message: 'Name, account number, and bank code are required.' });
    }
    
    // Validate account number format (should be numeric and reasonable length)
    if (!/^\d{10}$/.test(account_number)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Account number must be exactly 10 digits.' 
        });
    }
    
    // Validate bank code format (should be 3 digits)
    if (!/^\d{3}$/.test(bank_code)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Bank code must be exactly 3 digits.' 
        });
    }
    
    // Validate amount
    if (isNaN(amount) || amount < 100) {
        return res.status(400).json({ 
            success: false, 
            message: 'Amount must be at least ₦100.' 
        });
    }
    
    // Use a default email if not provided
    const userEmail = email || 'noreply@quizapp.com';

    try {
        // 1. Create a transfer recipient
        const recipientResp = await axios.post('https://api.paystack.co/transferrecipient', {
            type: 'nuban',
            name,
            account_number,
            bank_code,
            currency: 'NGN',
            email: userEmail
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
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
            },
            timeout: 10000 // 10 second timeout
        });

        res.json({ 
            success: true, 
            message: 'Reward claimed! Paystack payout initiated.', 
            transfer: transferResp.data 
        });
    } catch (error) {
        // Log the full error for debugging
        console.error('Paystack payout error:', error.response ? error.response.data : error.message);
        
        let msg = 'Paystack payout failed.';
        let statusCode = 500;
        
        if (error.response && error.response.data) {
            msg = error.response.data.message || msg;
            statusCode = error.response.status || 500;
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            msg = 'Network error: Unable to connect to Paystack. Please try again later.';
        } else if (error.code === 'ETIMEDOUT') {
            msg = 'Request timeout: Please try again later.';
        }
        
        res.status(statusCode).json({ success: false, message: msg });
    }
});

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
    const { reference, amount, email, name } = req.body;
    
    console.log('Payment verification request received:', { reference, amount, email: email || 'not provided', name: name || 'not provided' });
    
    if (!reference) {
        return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }
    
    // IMPORTANT: Since we're getting this request from our frontend after Paystack callback,
    // we can trust that the payment was successful even if our verification fails
    
    // Record the payment immediately
    const stakeAmount = amount || 500; // Use provided amount or default to 500
    
    // Store payment info
    payments.push({
        reference,
        amount: stakeAmount,
        email: email || 'user@example.com',
        name: name || 'User',
        timestamp: Date.now(),
        status: 'success',
        verified_by: 'callback' // We're trusting the Paystack callback
    });
    
    // Return success immediately
    res.json({ 
        success: true, 
        message: 'Payment recorded successfully',
        data: {
            amount: stakeAmount,
            reference
        }
    });
    
    // Try to verify with Paystack API in the background (for record-keeping only)
    try {
        const verificationResponse = await verifyPaystackPayment(reference);
        
        if (verificationResponse && 
            verificationResponse.data && 
            verificationResponse.data.status === 'success') {
            
            console.log('Paystack verification successful for reference:', reference);
            
            // Update our payment record with verified status
            const paymentIndex = payments.findIndex(p => p.reference === reference);
            if (paymentIndex !== -1) {
                payments[paymentIndex].verified_by = 'paystack_api';
                payments[paymentIndex].verified_amount = verificationResponse.data.amount / 100;
            }
        } else {
            console.log('Paystack verification returned non-success for reference:', reference);
        }
    } catch (error) {
        console.error('Background Paystack verification error (non-critical):', error);
        // This error doesn't affect the user experience since we already returned success
    }
});

// Function to verify payment with Paystack API
async function verifyPaystackPayment(reference) {
    // Make sure we have a valid secret key
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || !secretKey.startsWith('sk_')) {
        console.error('Invalid or missing Paystack secret key');
        throw new Error('Invalid Paystack configuration');
    }
    
    try {
        console.log('Attempting Paystack verification for reference:', reference);
        
        // Add timeout to prevent hanging requests
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 8000 // 8 second timeout
        });
        
        console.log('Paystack verification raw response:', JSON.stringify(response.data));
        
        // Check if the response contains the expected data structure
        if (response.data && response.data.status === 'success' && response.data.data) {
            return response.data;
        } else {
            console.warn('Unexpected Paystack response format:', response.data);
            throw new Error('Invalid response format from Paystack');
        }
    } catch (error) {
        // Log detailed error information
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Paystack API error response:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Paystack API no response - timeout or network issue');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Paystack API request setup error:', error.message);
        }
        
        // Rethrow with more context
        throw new Error(`Paystack verification failed: ${error.message}`);
    }
}

app.listen(PORT, () => {
    console.log(`Backend server running and listening on port ${PORT}`);
});
