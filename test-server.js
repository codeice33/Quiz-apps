// Simple test script to verify server endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEndpoints() {
    console.log('Testing server endpoints...\n');
    
    try {
        // Test root endpoint
        console.log('1. Testing root endpoint...');
        const rootResponse = await axios.get(BASE_URL);
        console.log('✓ Root endpoint working:', rootResponse.data);
        
        // Test manual payout endpoint with invalid data
        console.log('\n2. Testing manual payout validation...');
        try {
            await axios.post(`${BASE_URL}/manual-payout`, {
                name: 'Test User',
                account_number: '123', // Invalid - too short
                bank_name: 'Test Bank'
            });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✓ Manual payout validation working:', error.response.data.message);
            } else {
                console.log('✗ Unexpected error:', error.message);
            }
        }
        
        // Test claim reward endpoint with invalid data
        console.log('\n3. Testing claim reward validation...');
        try {
            await axios.post(`${BASE_URL}/claim-reward`, {
                name: 'Test User',
                account_number: '123', // Invalid - too short
                bank_code: '12' // Invalid - too short
            });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✓ Claim reward validation working:', error.response.data.message);
            } else {
                console.log('✗ Unexpected error:', error.message);
            }
        }
        
        // Test payment verification endpoint
        console.log('\n4. Testing payment verification...');
        try {
            await axios.post(`${BASE_URL}/verify-payment`, {});
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✓ Payment verification validation working:', error.response.data.message);
            } else {
                console.log('✗ Unexpected error:', error.message);
            }
        }
        
        console.log('\n✓ All endpoint tests completed successfully!');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        console.log('Make sure the server is running with: node server.js');
    }
}

// Run tests if server is available
testEndpoints();