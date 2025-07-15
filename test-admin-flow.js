// Test the complete flow: submit payout -> check admin panel
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testCompleteFlow() {
    console.log('🧪 Testing complete payout flow...\n');
    
    try {
        // Step 1: Check initial payout count
        console.log('1. Checking initial payout count...');
        const initialResponse = await axios.get(`${BASE_URL}/manual-payouts`);
        const initialCount = initialResponse.data.length;
        console.log(`✅ Initial payout count: ${initialCount}`);
        
        // Step 2: Submit a new payout
        console.log('\n2. Submitting new payout...');
        const newPayout = {
            name: 'Test User Flow',
            account_number: '9876543210',
            bank_name: 'Flow Test Bank',
            email: 'flowtest@example.com',
            reward_amount: 750,
            score: 7,
            total_questions: 10,
            score_percentage: 70
        };
        
        const submitResponse = await axios.post(`${BASE_URL}/manual-payout`, newPayout);
        console.log('✅ Payout submitted:', submitResponse.data);
        
        // Step 3: Check if payout appears in admin panel
        console.log('\n3. Checking if payout appears in admin panel...');
        const afterResponse = await axios.get(`${BASE_URL}/manual-payouts`);
        const afterCount = afterResponse.data.length;
        console.log(`✅ Payout count after submission: ${afterCount}`);
        
        if (afterCount > initialCount) {
            console.log('✅ SUCCESS: Payout successfully added to admin panel!');
            
            // Find the new payout
            const newPayoutInList = afterResponse.data.find(p => p.name === 'Test User Flow');
            if (newPayoutInList) {
                console.log('✅ Found new payout in list:');
                console.log(`   Name: ${newPayoutInList.name}`);
                console.log(`   Account: ${newPayoutInList.account_number}`);
                console.log(`   Bank: ${newPayoutInList.bank_name}`);
                console.log(`   Amount: ₦${newPayoutInList.reward_amount}`);
                console.log(`   Time: ${new Date(newPayoutInList.timestamp).toLocaleString()}`);
            }
        } else {
            console.log('❌ FAILED: Payout was not added to admin panel');
        }
        
        // Step 4: Test mark as paid functionality
        console.log('\n4. Testing mark as paid functionality...');
        const latestPayout = afterResponse.data[afterResponse.data.length - 1];
        if (latestPayout) {
            const markPaidResponse = await axios.post(`${BASE_URL}/manual-payouts/mark-paid`, {
                timestamp: latestPayout.timestamp
            });
            console.log('✅ Mark as paid response:', markPaidResponse.data);
            
            // Verify it was marked as paid
            const verifyResponse = await axios.get(`${BASE_URL}/manual-payouts`);
            const markedPayout = verifyResponse.data.find(p => p.timestamp === latestPayout.timestamp);
            if (markedPayout && markedPayout.paid) {
                console.log('✅ Payout successfully marked as paid');
            } else {
                console.log('❌ Failed to mark payout as paid');
            }
        }
        
        console.log('\n🎉 Complete flow test finished!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testCompleteFlow();