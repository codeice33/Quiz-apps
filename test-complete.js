// Comprehensive test for all endpoints
const axios = require('axios');

const BASE_URL = 'https://quiz-appi.onrender.com';

async function runTests() {
    console.log('🧪 Running comprehensive server tests...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        
        // Test 2: Root endpoint
        console.log('\n2. Testing root endpoint...');
        const rootResponse = await axios.get(BASE_URL);
        console.log('✅ Root endpoint passed:', rootResponse.data);
        
        // Test 3: Manual payout with valid data
        console.log('\n3. Testing manual payout with valid data...');
        const validPayoutResponse = await axios.post(`${BASE_URL}/manual-payout`, {
            name: 'John Doe',
            account_number: '1234567890',
            bank_name: 'Test Bank',
            email: 'john@example.com',
            reward_amount: 1000,
            score: 9,
            total_questions: 10,
            score_percentage: 90
        });
        console.log('✅ Valid payout passed:', validPayoutResponse.data);
        
        // Test 4: Manual payout with invalid account number
        console.log('\n4. Testing manual payout with invalid account number...');
        try {
            await axios.post(`${BASE_URL}/manual-payout`, {
                name: 'Jane Doe',
                account_number: '123', // Invalid - too short
                bank_name: 'Test Bank',
                email: 'jane@example.com'
            });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Invalid account validation passed:', error.response.data.message);
            } else {
                throw error;
            }
        }
        
        // Test 5: Manual payout without email (should work with default)
        console.log('\n5. Testing manual payout without email...');
        const noEmailResponse = await axios.post(`${BASE_URL}/manual-payout`, {
            name: 'Bob Smith',
            account_number: '9876543210',
            bank_name: 'Another Bank',
            reward_amount: 500
        });
        console.log('✅ No email payout passed:', noEmailResponse.data);
        
        // Test 6: Get all payouts
        console.log('\n6. Testing get all payouts...');
        const payoutsResponse = await axios.get(`${BASE_URL}/manual-payouts`);
        console.log('✅ Get payouts passed. Total payouts:', payoutsResponse.data.length);
        
        console.log('\n🎉 All tests passed! Server is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

runTests();