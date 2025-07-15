// Test the manual payout endpoint directly
const axios = require('axios');

async function testPayout() {
    try {
        console.log('Testing manual payout endpoint...');
        
        const response = await axios.post('https://quiz-appi.onrender.com/manual-payout', {
            name: 'Test User',
            account_number: '1234567890',
            bank_name: 'Test Bank',
            email: 'test@example.com',
            reward_amount: 500,
            score: 8,
            total_questions: 10,
            score_percentage: 80
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        console.log('✓ Success:', response.data);
        
    } catch (error) {
        console.error('✗ Error details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.code);
        } else {
            console.error('Request setup error:', error.message);
        }
    }
}

testPayout();