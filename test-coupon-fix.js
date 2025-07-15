// Test script to verify coupon code price fix
const fs = require('fs');
const path = require('path');

// Simulate localStorage for testing
class LocalStorageMock {
    constructor() {
        this.store = {};
    }
    
    getItem(key) {
        return this.store[key] || null;
    }
    
    setItem(key, value) {
        this.store[key] = value;
    }
    
    removeItem(key) {
        delete this.store[key];
    }
    
    clear() {
        this.store = {};
    }
}

const localStorage = new LocalStorageMock();

// Test function to simulate code generation (admin-codes.html style)
function generateCodeWithAmount(name, email, amount) {
    const userId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const accessCode = generateRandomCode(8);
    
    const accessCodes = JSON.parse(localStorage.getItem('quizAccessCodes')) || {};
    
    accessCodes[accessCode] = {
        userId: userId,
        name: name,
        email: email,
        amount: amount, // Using 'amount' field like admin-codes.html
        createdAt: Date.now(),
        used: false
    };
    
    localStorage.setItem('quizAccessCodes', JSON.stringify(accessCodes));
    return accessCode;
}

// Test function to simulate old code generation (script.js style)
function generateCodeWithPrice(name, email, price) {
    const userId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const accessCode = generateRandomCode(8);
    
    const accessCodes = JSON.parse(localStorage.getItem('quizAccessCodes')) || {};
    
    accessCodes[accessCode] = {
        userId: userId,
        name: name,
        email: email,
        price: price, // Using old 'price' field
        createdAt: Date.now(),
        used: false
    };
    
    localStorage.setItem('quizAccessCodes', JSON.stringify(accessCodes));
    return accessCode;
}

// Migration function (from script.js)
function migrateAccessCodes() {
    const accessCodes = JSON.parse(localStorage.getItem('quizAccessCodes')) || {};
    let migrated = false;
    
    for (const code in accessCodes) {
        if (accessCodes[code].price && !accessCodes[code].amount) {
            accessCodes[code].amount = accessCodes[code].price;
            delete accessCodes[code].price;
            migrated = true;
        }
    }
    
    if (migrated) {
        localStorage.setItem('quizAccessCodes', JSON.stringify(accessCodes));
        console.log('Access codes migrated from price to amount field');
    }
    
    return migrated;
}

// Test redemption logic (from script.js)
function testRedemption(code) {
    migrateAccessCodes();
    const accessCodes = JSON.parse(localStorage.getItem('quizAccessCodes')) || {};
    
    if (!accessCodes[code]) {
        return { success: false, error: 'Code not found' };
    }
    
    if (accessCodes[code].used) {
        return { success: false, error: 'Code already used' };
    }
    
    // Test the key logic - getting the stake amount
    let stakeAmount = 500; // default
    const codeAmount = accessCodes[code].amount || accessCodes[code].price;
    if (codeAmount && !isNaN(codeAmount)) {
        stakeAmount = codeAmount;
    }
    
    return {
        success: true,
        name: accessCodes[code].name,
        email: accessCodes[code].email,
        originalAmount: accessCodes[code].amount,
        originalPrice: accessCodes[code].price,
        finalStakeAmount: stakeAmount
    };
}

function generateRandomCode(length) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Run tests
console.log('🧪 Testing Coupon Code Price Fix...\n');

// Test 1: New code with amount field
console.log('1. Testing new code generation (with amount field)...');
const newCode = generateCodeWithAmount('John Doe', 'john@example.com', 750);
const newResult = testRedemption(newCode);
console.log(`   Code: ${newCode}`);
console.log(`   Result:`, newResult);
console.log(`   ✅ Amount correctly used: ${newResult.finalStakeAmount === 750 ? 'YES' : 'NO'}\n`);

// Test 2: Old code with price field
console.log('2. Testing old code generation (with price field)...');
const oldCode = generateCodeWithPrice('Jane Smith', 'jane@example.com', 1000);
const oldResult = testRedemption(oldCode);
console.log(`   Code: ${oldCode}`);
console.log(`   Result:`, oldResult);
console.log(`   ✅ Price correctly migrated: ${oldResult.finalStakeAmount === 1000 ? 'YES' : 'NO'}\n`);

// Test 3: Migration test
console.log('3. Testing migration functionality...');
const preMigrationCodes = JSON.parse(localStorage.getItem('quizAccessCodes'));
console.log('   Codes before migration:', Object.keys(preMigrationCodes).map(code => ({
    code,
    hasPrice: !!preMigrationCodes[code].price,
    hasAmount: !!preMigrationCodes[code].amount
})));

const migrated = migrateAccessCodes();
const postMigrationCodes = JSON.parse(localStorage.getItem('quizAccessCodes'));
console.log('   Migration performed:', migrated);
console.log('   Codes after migration:', Object.keys(postMigrationCodes).map(code => ({
    code,
    hasPrice: !!postMigrationCodes[code].price,
    hasAmount: !!postMigrationCodes[code].amount
})));

// Test 4: Edge cases
console.log('\n4. Testing edge cases...');

// Test with invalid amount
const invalidCode = generateCodeWithAmount('Test User', 'test@example.com', 'invalid');
const invalidResult = testRedemption(invalidCode);
console.log(`   Invalid amount test: ${invalidResult.finalStakeAmount === 500 ? 'PASSED (defaulted to 500)' : 'FAILED'}`);

// Test with zero amount
const zeroCode = generateCodeWithAmount('Zero User', 'zero@example.com', 0);
const zeroResult = testRedemption(zeroCode);
console.log(`   Zero amount test: ${zeroResult.finalStakeAmount === 500 ? 'PASSED (defaulted to 500)' : 'FAILED'}`);

console.log('\n🎉 All tests completed!');

// Show final state
console.log('\n📊 Final localStorage state:');
console.log(JSON.stringify(JSON.parse(localStorage.getItem('quizAccessCodes')), null, 2));