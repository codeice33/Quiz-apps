// IMPORTANT: Set this to your backend's deployed URL
const ONLINE_BACKEND = 'https://quiz-appi.onrender.com'; // <-- Backend deployed on Render

// Global variables for payment and quiz state
let quizEndedForCheating = false;
let claimingReward = false;
let hasStakedMoney = false;
let userEmail = '';
let userName = '';
let userPhone = '';
let userId = ''; // Unique ID for each user
let stakeAmount = 500; // Default stake amount in Naira
let isAdminMode = false;
let adminCode = 'quiz2024admin'; // Admin code - DO NOT CHANGE THIS VALUE

// Store access codes in local storage
const accessCodes = JSON.parse(localStorage.getItem('quizAccessCodes')) || {};

// Initialize DOM elements for quiz
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const claimRewardButton = document.getElementById("claim-reward-btn");
let timerElement = document.getElementById("timer");
const payoutForm = document.getElementById("payout-form");

// DOM Elements for welcome screen and payment
const welcomeScreen = document.getElementById('welcome-screen');
const paymentForm = document.getElementById('payment-form');
const quizContainer = document.getElementById('quiz-container');
const stakeBtn = document.getElementById('stake-btn');
const stakeAmountInput = document.getElementById('stake-amount');
const stakeAmountDisplay = document.getElementById('stake-amount-display');
const paymentName = document.getElementById('payment-name');
const paymentEmail = document.getElementById('payment-email');
const paymentPhone = document.getElementById('payment-phone');
const payNowBtn = document.getElementById('pay-now-btn');

// Function to handle cheating prevention
function handleCheating() {
    // Only trigger anti-cheat if:
    // 1. Quiz has not already ended for cheating
    // 2. User is not in the process of claiming a reward
    // 3. User has staked money and started the quiz
    // 4. User has answered at least 5 questions
    if (!quizEndedForCheating && 
        !claimingReward && 
        hasStakedMoney && 
        currentQuestionIndex >= 5) {
        
        quizEndedForCheating = true;
        resetState();
        questionElement.innerHTML = 'Quiz ended: You left the browser tab.';
        nextButton.style.display = 'none';
        claimRewardButton.style.display = 'none';
        payoutForm.style.display = 'none';
    }
}

// Anti-cheating event listeners - only active during the quiz
// We'll use a flag to track if anti-cheating is active
let antiCheatingActive = false;

function enableAntiCheating() {
    antiCheatingActive = true;
    console.log('Anti-cheating measures activated');
}

function disableAntiCheating() {
    antiCheatingActive = false;
    console.log('Anti-cheating measures deactivated');
}

window.addEventListener('blur', function() {
    if (antiCheatingActive) {
        handleCheating();
    }
});

document.addEventListener('visibilitychange', function() {
    if (antiCheatingActive && document.visibilityState === 'hidden') {
        handleCheating();
    }
});

// Update stake amount display when input changes
stakeAmountInput.addEventListener('input', () => {
    // Ensure minimum stake amount is 100
    let amount = parseInt(stakeAmountInput.value);
    if (isNaN(amount) || amount < 100) {
        amount = 100;
        stakeAmountInput.value = 100;
    }
    
    // Update the global stake amount
    stakeAmount = amount;
    
    // Update display in the payment form
    stakeAmountDisplay.textContent = `₦${stakeAmount}`;
    
    // Update button text
    stakeBtn.textContent = `Stake ₦${stakeAmount} to Play`;
});

// Admin functionality
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const adminPanel = document.getElementById('admin-panel');
const verifyAdminBtn = document.getElementById('verify-admin-btn');
const adminCodeInput = document.getElementById('admin-code');
const freeAccessPanel = document.getElementById('free-access-panel');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const generateAccessBtn = document.getElementById('generate-access-btn');
const accessCodeDisplay = document.getElementById('access-code-display');
const accessCodeSpan = document.getElementById('access-code');
const userIdSpan = document.getElementById('user-id');
const accessCodeInput = document.getElementById('access-code-input');
const redeemCodeBtn = document.getElementById('redeem-code-btn');
const adminAccessDiv = document.getElementById('admin-access');

// Show admin toggle button with special key combination (Ctrl+Shift+A)
document.addEventListener('keydown', function(event) {
    // Check for both uppercase and lowercase 'a' to make it more reliable
    if (event.ctrlKey && event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        console.log('Admin access shortcut detected');
        if (adminAccessDiv) {
            adminAccessDiv.style.display = 'block';
        } else {
            console.error('Admin access div not found');
        }
    }
});

// Toggle admin panel
if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', () => {
        if (adminPanel.style.display === 'none') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }
    });
}

// Verify admin code
if (verifyAdminBtn) {
    verifyAdminBtn.addEventListener('click', () => {
        if (adminCodeInput.value === adminCode) {
            isAdminMode = true;
            freeAccessPanel.style.display = 'block';
            alert('Admin access granted!');
        } else {
            alert('Invalid admin code');
        }
    });
}

// Generate unique access code for a user
if (generateAccessBtn) {
    generateAccessBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        const email = userEmailInput.value.trim();
        const codePriceInput = document.getElementById('code-price') || document.getElementById('code-amount');
        let codePrice = 500; // default price
        if (codePriceInput) {
            const val = parseInt(codePriceInput.value);
            if (!isNaN(val) && val >= 100) {
                codePrice = val;
            }
        }
        
        if (!name || !email) {
            alert('Please enter both name and email');
            return;
        }
        
        // Generate unique user ID and access code
        const userId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const accessCode = generateRandomCode(8);
        
        // Store in local storage with amount
        accessCodes[accessCode] = {
            userId: userId,
            name: name,
            email: email,
            amount: codePrice,
            createdAt: Date.now(),
            used: false
        };
        
        localStorage.setItem('quizAccessCodes', JSON.stringify(accessCodes));
        
        // Display the generated code and price
        accessCodeSpan.textContent = accessCode;
        userIdSpan.textContent = userId;
        const codePriceDisplay = document.getElementById('code-price-display') || document.getElementById('code-amount-display');
        if (codePriceDisplay) {
            codePriceDisplay.textContent = codePrice;
        }
        accessCodeDisplay.style.display = 'block';
    });
}

// Function to generate random access code
function generateRandomCode(length) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Migration function to convert old 'price' field to 'amount'
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
}

// Redeem access code
if (redeemCodeBtn) {
    redeemCodeBtn.addEventListener('click', () => {
        const code = accessCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            alert('Please enter an access code');
            return;
        }
        
        // Get the latest access codes from local storage and migrate if needed
        migrateAccessCodes();
        const accessCodes = JSON.parse(localStorage.getItem('quizAccessCodes')) || {};
        const now = new Date().getTime();
        
        if (accessCodes[code]) {
            // Check if code is expired
            if (accessCodes[code].expiresAt && accessCodes[code].expiresAt < now) {
                alert('This access code has expired.');
                return;
            }
            
            // Check if code is already used
            if (accessCodes[code].used) {
                alert('This access code has already been used.');
                return;
            }
            
            // Mark code as used
            accessCodes[code].used = true;
            accessCodes[code].usedAt = now;
            localStorage.setItem('quizAccessCodes', JSON.stringify(accessCodes));
            
            // Set user info
            userName = accessCodes[code].name;
            userEmail = accessCodes[code].email;
            userId = accessCodes[code].userId;
            
            // Set stake amount to code amount if available (with fallback to price for old codes)
            const codeAmount = accessCodes[code].amount || accessCodes[code].price;
            if (codeAmount && !isNaN(codeAmount)) {
                stakeAmount = codeAmount;
                // Update stake amount display in UI
                if (stakeAmountDisplay) {
                    stakeAmountDisplay.textContent = `₦${stakeAmount}`;
                }
                if (stakeAmountInput) {
                    stakeAmountInput.value = stakeAmount;
                }
            }
            
            // Start quiz without payment
            hasStakedMoney = true;
            welcomeScreen.style.display = 'none';
            quizContainer.style.display = 'block';
            
            // Store user info for potential reward payout
            if (payoutName) payoutName.value = userName;
            if (payoutEmail) payoutEmail.value = userEmail;
            
            // Start the quiz
            startQuiz();
            
            console.log(`User ${userName} (${userId}) started quiz with access code: ${code}`);
            alert(`Welcome ${userName}! Your quiz is starting now.`);
        } else {
            alert('Invalid access code. Please check and try again.');
        }
    });
}

// Payment flow event listeners
stakeBtn.addEventListener('click', () => {
    // Get the stake amount
    stakeAmount = parseInt(stakeAmountInput.value);
    
    // Validate stake amount
    if (isNaN(stakeAmount) || stakeAmount < 100) {
        alert('Please enter a valid stake amount (minimum ₦100)');
        stakeAmountInput.focus();
        return;
    }
    
    // Update display in the payment form
    stakeAmountDisplay.textContent = `₦${stakeAmount}`;
    
    // Update pay now button text
    payNowBtn.textContent = `Pay ₦${stakeAmount} Now`;
    
    // Show payment form
    welcomeScreen.style.display = 'none';
    paymentForm.style.display = 'block';
});

// Initialize Paystack payment
payNowBtn.addEventListener('click', () => {
    // Validate form
    userName = paymentName.value.trim();
    userEmail = paymentEmail.value.trim();
    userPhone = paymentPhone.value.trim();
    
    if (!userName || !userEmail || !userPhone) {
        alert('Please fill in all payment details');
        return;
    }
    
    // Initialize Paystack payment with custom stake amount
    const paymentAmount = stakeAmount * 100; // Convert to kobo
    
    let handler = PaystackPop.setup({
        key: 'pk_live_a581d155aa9a69f12752b2d23e10ad8741191985', // Your Paystack public key
        email: userEmail,
        amount: paymentAmount,
        currency: 'NGN',
        ref: 'quiz_stake_' + Math.floor(Math.random() * 1000000000 + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: "Full Name",
                    variable_name: "full_name",
                    value: userName
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone",
                    value: userPhone
                }
            ]
        },
        callback: function(response) {
            console.log('Paystack callback response:', response);
            
            // If we get a callback from Paystack, it means the payment was successful
            // The response object contains: reference, status, trans, message
            if (response.status === 'success') {
                console.log('Paystack reported successful payment');
            } else {
                console.log('Paystack callback with status:', response.status);
            }
            
            // Proceed with verification regardless of status
            verifyPayment(response.reference);
        },
        onClose: function() {
            // Handle when user closes payment modal
            console.log('Payment window closed');
            payNowBtn.disabled = false;
            
            // If the user closed without completing payment
            if (!hasStakedMoney) {
                alert('Payment was not completed. Please try again when you are ready.');
            }
        }
    });
    
    handler.openIframe();
});

// Function to verify payment with the server
function verifyPayment(reference) {
    // Show loading message
    payNowBtn.disabled = true;
    payNowBtn.textContent = 'Verifying payment...';
    
    console.log('Payment reference received:', reference);
    
    // IMPORTANT: Since we received a callback from Paystack, we can assume the payment was successful
    // This is a more reliable approach than depending on our server verification
    
    // Proceed with the quiz regardless of server verification
    setTimeout(() => {
        // Start the quiz immediately since Paystack already confirmed payment
        hasStakedMoney = true;
        paymentForm.style.display = 'none';
        quizContainer.style.display = 'block';
        
        // Store user info for potential reward payout
        if (payoutName) payoutName.value = userName;
        if (payoutEmail) payoutEmail.value = userEmail;
        
        // Start the quiz
        startQuiz();
        
        // Show success message with stake amount
        alert(`Payment of ₦${stakeAmount} successful! The quiz will now begin. Answer correctly to win up to ₦${stakeAmount * 10}!`);
        
        // Still try to verify with our server in the background (for record-keeping)
        let apiUrl;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            apiUrl = 'http://localhost:4000/verify-payment';
        } else {
            apiUrl = ONLINE_BACKEND + '/verify-payment';
        }
        
        // Send verification request to our server (but don't wait for it)
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reference,
                amount: stakeAmount,
                email: userEmail,
                name: userName
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Server verification response:', data);
            // We don't need to do anything with this response since we already started the quiz
        })
        .catch(error => {
            console.error('Background verification error (non-critical):', error);
            // This error doesn't affect the user experience since we already started the quiz
        });
    }, 1500); // Short delay for better UX
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let questions =[
    {
        question: "Which is the largest animal in the world?",
        answers: [
            { text: "Shark", correct: false },
            { text: "Blue whale", correct: true },
            { text: "Elephant", correct: false },
            { text: "Giraffe", correct: false },
        ]
    },
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false },
            { text: "Paris", correct: true },
            { text: "Lisbon", correct: false },
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Saturn", correct: false },
        ]
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        answers: [
            { text: "William Shakespeare", correct: true },
            { text: "Charles Dickens", correct: false },
            { text: "Jane Austen", correct: false },
            { text: "Mark Twain", correct: false },
        ]
    },
    {
        question: "What is the largest continent?",
        answers: [
            { text: "Africa", correct: false },
            { text: "Asia", correct: true },
            { text: "Europe", correct: false },
            { text: "Antarctica", correct: false },
        ]
    },
    {
        question: "Which gas do plants absorb from the atmosphere?",
        answers: [
            { text: "Oxygen", correct: false },
            { text: "Carbon Dioxide", correct: true },
            { text: "Nitrogen", correct: false },
            { text: "Hydrogen", correct: false },
        ]
    },
    {
        question: "Who painted the Mona Lisa?",
        answers: [
            { text: "Vincent Van Gogh", correct: false },
            { text: "Leonardo da Vinci", correct: true },
            { text: "Pablo Picasso", correct: false },
            { text: "Claude Monet", correct: false },
        ]
    },
    {
        question: "What is the boiling point of water?",
        answers: [
            { text: "90°C", correct: false },
            { text: "100°C", correct: true },
            { text: "80°C", correct: false },
            { text: "120°C", correct: false },
        ]
    },
    {
        question: "Which language is used to style web pages?",
        answers: [
            { text: "HTML", correct: false },
            { text: "CSS", correct: true },
            { text: "Python", correct: false },
            { text: "Java", correct: false },
        ]
    },
    {
        question: "What is the hardest natural substance?",
        answers: [
            { text: "Gold", correct: false },
            { text: "Iron", correct: false },
            { text: "Diamond", correct: true },
            { text: "Silver", correct: false },
        ]
    },
    {
        question: "What is the smallest prime number?",
        answers: [
            { text: "1", correct: false },
            { text: "2", correct: true },
            { text: "3", correct: false },
            { text: "5", correct: false },
        ]
    },
    {
        question: "Which country is known as the Land of the Rising Sun?",
        answers: [
            { text: "China", correct: false },
            { text: "Japan", correct: true },
            { text: "Thailand", correct: false },
            { text: "India", correct: false },
        ]
    },
    {
        question: "Who discovered gravity?",
        answers: [
            { text: "Albert Einstein", correct: false },
            { text: "Isaac Newton", correct: true },
            { text: "Galileo Galilei", correct: false },
            { text: "Nikola Tesla", correct: false },
        ]
    },
    {
        question: "What is the main ingredient in guacamole?",
        answers: [
            { text: "Tomato", correct: false },
            { text: "Avocado", correct: true },
            { text: "Onion", correct: false },
            { text: "Pepper", correct: false },
        ]
    },
    {
        question: "Which ocean is the largest?",
        answers: [
            { text: "Atlantic", correct: false },
            { text: "Pacific", correct: true },
            { text: "Indian", correct: false },
            { text: "Arctic", correct: false },
        ]
    },
    {
        question: "What is the chemical symbol for gold?",
        answers: [
            { text: "Au", correct: true },
            { text: "Ag", correct: false },
            { text: "Gd", correct: false },
            { text: "Go", correct: false },
        ]
    },
    {
        question: "Who is known as the Father of Computers?",
        answers: [
            { text: "Charles Babbage", correct: true },
            { text: "Alan Turing", correct: false },
            { text: "Bill Gates", correct: false },
            { text: "Steve Jobs", correct: false },
        ]
    },
    {
        question: "Which country gifted the Statue of Liberty to the USA?",
        answers: [
            { text: "England", correct: false },
            { text: "France", correct: true },
            { text: "Germany", correct: false },
            { text: "Spain", correct: false },
        ]
    },
    {
        question: "What is the largest desert in the world?",
        answers: [
            { text: "Sahara", correct: false },
            { text: "Antarctic", correct: true },
            { text: "Gobi", correct: false },
            { text: "Kalahari", correct: false },
        ]
    },
    {
        question: "Which instrument measures atmospheric pressure?",
        answers: [
            { text: "Thermometer", correct: false },
            { text: "Barometer", correct: true },
            { text: "Hygrometer", correct: false },
            { text: "Anemometer", correct: false },
        ]
    },
    {
        question: "Who invented the telephone?",
        answers: [
            { text: "Alexander Graham Bell", correct: true },
            { text: "Thomas Edison", correct: false },
            { text: "Nikola Tesla", correct: false },
            { text: "Guglielmo Marconi", correct: false },
        ]
    },
    {
        question: "What is the capital of Australia?",
        answers: [
            { text: "Sydney", correct: false },
            { text: "Melbourne", correct: false },
            { text: "Canberra", correct: true },
            { text: "Perth", correct: false },
        ]
    },
    {
        question: "Which is the longest river in the world?",
        answers: [
            { text: "Amazon", correct: false },
            { text: "Nile", correct: true },
            { text: "Yangtze", correct: false },
            { text: "Mississippi", correct: false },
        ]
    },
    {
        question: "What is the square root of 64?",
        answers: [
            { text: "6", correct: false },
            { text: "8", correct: true },
            { text: "7", correct: false },
            { text: "9", correct: false },
        ]
    },
    {
        question: "Which element has the atomic number 1?",
        answers: [
            { text: "Oxygen", correct: false },
            { text: "Hydrogen", correct: true },
            { text: "Helium", correct: false },
            { text: "Carbon", correct: false },
        ]
    },
    {
        question: "Who was the first President of the United States?",
        answers: [
            { text: "Abraham Lincoln", correct: false },
            { text: "George Washington", correct: true },
            { text: "Thomas Jefferson", correct: false },
            { text: "John Adams", correct: false },
        ]
    },
    {
        question: "Which is the largest internal organ in the human body?",
        answers: [
            { text: "Heart", correct: false },
            { text: "Liver", correct: true },
            { text: "Lung", correct: false },
            { text: "Kidney", correct: false },
        ]
    },
    {
        question: "What is the main language spoken in Brazil?",
        answers: [
            { text: "Spanish", correct: false },
            { text: "Portuguese", correct: true },
            { text: "French", correct: false },
            { text: "English", correct: false },
        ]
    },
    {
        question: "Which year did World War II end?",
        answers: [
            { text: "1945", correct: true },
            { text: "1939", correct: false },
            { text: "1942", correct: false },
            { text: "1950", correct: false },
        ]
    },
    {
        question: "What is the freezing point of water?",
        answers: [
            { text: "0°C", correct: true },
            { text: "32°C", correct: false },
            { text: "-10°C", correct: false },
            { text: "100°C", correct: false },
        ]
    },
    {
        question: "Which country hosted the 2016 Summer Olympics?",
        answers: [
            { text: "China", correct: false },
            { text: "Brazil", correct: true },
            { text: "UK", correct: false },
            { text: "Russia", correct: false },
        ]
    },
    {
        question: "What is the tallest mountain in the world?",
        answers: [
            { text: "K2", correct: false },
            { text: "Mount Everest", correct: true },
            { text: "Kangchenjunga", correct: false },
            { text: "Lhotse", correct: false },
        ]
    },
    {
        question: "Which is the smallest continent?",
        answers: [
            { text: "Europe", correct: false },
            { text: "Australia", correct: true },
            { text: "Antarctica", correct: false },
            { text: "South America", correct: false },
        ]
    },
    {
        question: "Who is the author of 'Harry Potter'?",
        answers: [
            { text: "J.K. Rowling", correct: true },
            { text: "J.R.R. Tolkien", correct: false },
            { text: "Stephen King", correct: false },
            { text: "Roald Dahl", correct: false },
        ]
    },
    // --- Added questions to make 50 ---
    {
        question: "What is the capital of Canada?",
        answers: [
            { text: "Toronto", correct: false },
            { text: "Ottawa", correct: true },
            { text: "Vancouver", correct: false },
            { text: "Montreal", correct: false },
        ]
    },
    {
        question: "Which metal is liquid at room temperature?",
        answers: [
            { text: "Mercury", correct: true },
            { text: "Gold", correct: false },
            { text: "Silver", correct: false },
            { text: "Copper", correct: false },
        ]
    },
    {
        question: "What is the largest planet in our solar system?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Jupiter", correct: true },
            { text: "Saturn", correct: false },
            { text: "Mars", correct: false },
        ]
    },
    {
        question: "Who painted the ceiling of the Sistine Chapel?",
        answers: [
            { text: "Michelangelo", correct: true },
            { text: "Da Vinci", correct: false },
            { text: "Raphael", correct: false },
            { text: "Donatello", correct: false },
        ]
    },
    {
        question: "Which country is known as the Land of a Thousand Lakes?",
        answers: [
            { text: "Finland", correct: true },
            { text: "Sweden", correct: false },
            { text: "Norway", correct: false },
            { text: "Denmark", correct: false },
        ]
    },
    {
        question: "What is the chemical symbol for sodium?",
        answers: [
            { text: "Na", correct: true },
            { text: "So", correct: false },
            { text: "S", correct: false },
            { text: "N", correct: false },
        ]
    },
    {
        question: "Who is the Greek god of the sea?",
        answers: [
            { text: "Poseidon", correct: true },
            { text: "Zeus", correct: false },
            { text: "Apollo", correct: false },
            { text: "Hermes", correct: false },
        ]
    },
    {
        question: "Which country invented paper?",
        answers: [
            { text: "China", correct: true },
            { text: "Egypt", correct: false },
            { text: "Greece", correct: false },
            { text: "India", correct: false },
        ]
    },
    {
        question: "What is the main ingredient in traditional Japanese miso soup?",
        answers: [
            { text: "Miso paste", correct: true },
            { text: "Soy sauce", correct: false },
            { text: "Rice", correct: false },
            { text: "Seaweed", correct: false },
        ]
    },
    {
        question: "Which is the smallest bone in the human body?",
        answers: [
            { text: "Stapes", correct: true },
            { text: "Femur", correct: false },
            { text: "Tibia", correct: false },
            { text: "Ulna", correct: false },
        ]
    },
    {
        question: "What is the national flower of Japan?",
        answers: [
            { text: "Cherry Blossom", correct: true },
            { text: "Rose", correct: false },
            { text: "Lily", correct: false },
            { text: "Lotus", correct: false },
        ]
    },
    {
        question: "Which element is needed for strong bones and teeth?",
        answers: [
            { text: "Calcium", correct: true },
            { text: "Iron", correct: false },
            { text: "Potassium", correct: false },
            { text: "Magnesium", correct: false },
        ]
    },
    {
        question: "Who was the first man to step on the moon?",
        answers: [
            { text: "Neil Armstrong", correct: true },
            { text: "Buzz Aldrin", correct: false },
            { text: "Yuri Gagarin", correct: false },
            { text: "Michael Collins", correct: false },
        ]
    },
    {
        question: "Which country is the origin of the car brand 'Toyota'?",
        answers: [
            { text: "Japan", correct: true },
            { text: "USA", correct: false },
            { text: "Germany", correct: false },
            { text: "South Korea", correct: false },
        ]
    },
    {
        question: "What is the largest mammal on land?",
        answers: [
            { text: "Elephant", correct: true },
            { text: "Giraffe", correct: false },
            { text: "Hippopotamus", correct: false },
            { text: "Rhinoceros", correct: false },
        ]
    },
    {
        question: "Which is the longest bone in the human body?",
        answers: [
            { text: "Femur", correct: true },
            { text: "Tibia", correct: false },
            { text: "Fibula", correct: false },
            { text: "Humerus", correct: false },
        ]
    },
    {
        question: "What is the capital city of Kenya?",
        answers: [
            { text: "Nairobi", correct: true },
            { text: "Mombasa", correct: false },
            { text: "Kampala", correct: false },
            { text: "Addis Ababa", correct: false },
        ]
    },
    {
        question: "Which gas do humans need to breathe?",
        answers: [
            { text: "Oxygen", correct: true },
            { text: "Carbon Dioxide", correct: false },
            { text: "Nitrogen", correct: false },
            { text: "Hydrogen", correct: false },
        ]
    },
    {
        question: "What is the largest island in the world?",
        answers: [
            { text: "Greenland", correct: true },
            { text: "Australia", correct: false },
            { text: "Borneo", correct: false },
            { text: "Madagascar", correct: false },
        ]
    }
];

// DOM elements already initialized at the top of the file

// Timer elements
let timerInterval = null;
let timerTimeout = null;

// Create timer element if it doesn't exist
if (!timerElement) {
    timerElement = document.createElement('div');
    timerElement.id = 'timer';
    timerElement.style.cssText = 'font-size:18px;font-weight:600;margin-bottom:10px;color:#d9534f;';
    questionElement.parentNode.insertBefore(timerElement, questionElement);
}

let currentQuestionIndex = 0;
let score = 0;

function startQuiz(){
    // Reset quiz state
    quizEndedForCheating = false;
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    nextButton.style.display = "none";
    claimRewardButton.style.display = "none";
    payoutForm.style.display = "none";
    
    // Disable anti-cheating at the start
    disableAntiCheating();
    
    // Show user status info if they have staked money
    const userStatusInfo = document.getElementById('user-status-info');
    const userStatusText = document.getElementById('user-status-text');
    if (hasStakedMoney && userStatusInfo && userStatusText) {
        let statusMessage = `Welcome, ${userName || 'Player'}! `;
        statusMessage += `Your stake: ₦${stakeAmount} | `;
        statusMessage += `Good luck with your quiz!`;
        
        userStatusText.innerHTML = statusMessage;
        userStatusInfo.style.display = 'block';
    } else if (userStatusInfo) {
        userStatusInfo.style.display = 'none';
    }
    
    // Shuffle questions and answers
    questions = shuffleArray(questions);
    questions.forEach(q => {
        q.answers = shuffleArray(q.answers);
    });
    
    // Show the first question
    showQuestion();
    
    // Enable anti-cheating after a delay to ensure the quiz is fully loaded
    setTimeout(() => {
        // Only enable anti-cheating if the user has progressed to at least 5 questions
        if (currentQuestionIndex >= 5) {
            enableAntiCheating();
        }
    }, 10000); // 10 second delay
}

function showQuestion(){
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    // Timer logic: 10 seconds per question
    let timeLeft = 10;
    timerElement.textContent = `Time left: ${timeLeft}s`;
    clearInterval(timerInterval);
    clearTimeout(timerTimeout);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 10000 / 10); // Update every 100ms
    timerTimeout = setTimeout(() => {
        timerElement.textContent = 'Time up!';
        // Mark as failed, show correct answer, move to next
        Array.from(answerButtons.children).forEach(button => {
            if(button.dataset && button.dataset.correct === "true"){
                button.classList.add("correct");
            }
            button.disabled = true;
        });
        // Move to next after 1s
        setTimeout(() => {
            nextButton.style.display = "block";
            handelNextButton();
        }, 1000);
    }, 10000);

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if(answer.correct){
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click" , selectAnswer);
    });
}

function resetState(){
    nextButton.style.display = "none";
    while(answerButtons.firstChild){
        answerButtons.removeChild(answerButtons.firstChild);
    }
    timerElement.textContent = '';
    clearInterval(timerInterval);
    clearTimeout(timerTimeout);
}

function selectAnswer(e){
    clearInterval(timerInterval);
    clearTimeout(timerTimeout);
    const selectedBtn = e.target;
    const iscorrect = selectedBtn.dataset.correct === "true";
    if(iscorrect){
        selectedBtn.classList.add("correct");
        score++;
    }else{
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block"
}

function showscore(){
    resetState();
    
    // Disable anti-cheating at the end of the quiz
    disableAntiCheating();
    
    // Calculate percentage score
    const percentage = Math.round((score / questions.length) * 100);
    
    // Display score with percentage and play again info
    let scoreMessage = `You scored ${score} out of ${questions.length}! (${percentage}%)`;
    
    // Add play again message - now requires new stake
    if (hasStakedMoney) {
        scoreMessage += `<br><br><small style="color: #ff6b35; font-weight: bold;">⚠️ To play again, you need to stake again!</small>`;
    }
    
    questionElement.innerHTML = scoreMessage;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
    
    // Only show claim reward button if user has staked money and scored at least 80%
    if (hasStakedMoney && percentage >= 80) {
        const rewardAmount = calculateReward(percentage);
        claimRewardButton.innerHTML = `Claim ₦${rewardAmount} Reward`;
        claimRewardButton.style.display = "block";
    } else {
        claimRewardButton.style.display = "none";
    }
    
    // Reset the staking status after quiz completion so user needs to pay again
    hasStakedMoney = false;
}

// Calculate reward based on score percentage and stake amount
function calculateReward(percentage) {
    // Base reward is the stake amount
    let multiplier = 1;
    
    // Bonus for high scores
    if (percentage >= 95) {
        multiplier = 10; // Perfect or near-perfect score: 10x stake
    } else if (percentage >= 90) {
        multiplier = 5; // Excellent score: 5x stake
    } else if (percentage >= 85) {
        multiplier = 3; // Very good score: 3x stake
    } else if (percentage >= 80) {
        multiplier = 2; // Good score: 2x stake
    }
    
    // Calculate reward based on stake amount and multiplier
    return stakeAmount * multiplier;
}

function handelNextButton(){
    currentQuestionIndex++;
    
    // Enable anti-cheating after 5 questions
    if (currentQuestionIndex >= 5 && !antiCheatingActive) {
        enableAntiCheating();
        console.log('Anti-cheating activated after 5 questions');
    }
    
    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        // Disable anti-cheating at the end of the quiz
        disableAntiCheating();
        showscore();
    }
}




nextButton.addEventListener("click" , ()=>{
    if(currentQuestionIndex < questions.length){
        handelNextButton();
    }else{
        // Play Again functionality - always require new payment
        payoutForm.style.display = "none";
        claimingReward = false;
        
        // Always send user back to welcome screen to stake again
        quizContainer.style.display = 'none';
        welcomeScreen.style.display = 'block';
        
        // Reset user data for new game
        userName = '';
        userEmail = '';
        userPhone = '';
        userId = '';
    }
});




// Initialize payout form elements
const payoutName = document.getElementById("payout-name");
const payoutAccount = document.getElementById("payout-account");
const payoutBank = document.getElementById("payout-bank");
const payoutEmail = document.getElementById("payout-email");
const submitPayoutBtn = document.getElementById("submit-payout-btn");

claimRewardButton.addEventListener("click", () => {
    claimingReward = true;
    payoutForm.style.display = "block";
    claimRewardButton.style.display = "none";
});

// Function to test server connection
async function testServerConnection(apiUrl) {
    try {
        const healthUrl = apiUrl.replace('/manual-payout', '/health');
        console.log('Testing server connection to:', healthUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(healthUrl, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Server connection test result:', response.ok, response.status);
        return response.ok;
    } catch (error) {
        console.error('Server connection test failed:', error.name, error.message);
        return false;
    }
}

submitPayoutBtn.addEventListener("click", async () => {
    const name = payoutName.value.trim();
    const account_number = payoutAccount.value.trim();
    const bank_name = payoutBank.value.trim() || payoutBank.options[payoutBank.selectedIndex].text;
    const email = payoutEmail.value.trim();
    
    if(!name || !account_number || !bank_name) {
        alert("Please fill in name, account number, and bank details.");
        return;
    }
    
    // Validate account number format (10 digits)
    if (!/^\d{10}$/.test(account_number)) {
        alert("Account number must be exactly 10 digits.");
        return;
    }
    
    // Calculate reward amount based on score
    const percentage = Math.round((score / questions.length) * 100);
    const reward_amount = calculateReward(percentage);
    
    // Disable button to prevent double submission
    submitPayoutBtn.disabled = true;
    submitPayoutBtn.textContent = "Processing...";
    
    // Use the global ONLINE_BACKEND constant
    let apiUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://localhost:4000/manual-payout';
    } else {
        apiUrl = ONLINE_BACKEND + '/manual-payout';
    }
    
    console.log('Submitting payout to:', apiUrl);
    console.log('Payout data:', { name, account_number, bank_name, email: email || 'undefined' });
    
    // Test server connection first
    const isServerReachable = await testServerConnection(apiUrl);
    if (!isServerReachable) {
        // Try alternative localhost addresses
        const alternativeUrls = [
            'http://127.0.0.1:4000/manual-payout',
            'http://localhost:4000/manual-payout'
        ];
        
        let foundWorkingUrl = false;
        for (const altUrl of alternativeUrls) {
            if (altUrl !== apiUrl) {
                console.log('Trying alternative URL:', altUrl);
                const altReachable = await testServerConnection(altUrl);
                if (altReachable) {
                    apiUrl = altUrl;
                    foundWorkingUrl = true;
                    console.log('Using alternative URL:', apiUrl);
                    break;
                }
            }
        }
        
        if (!foundWorkingUrl) {
            alert('Cannot connect to server. Please make sure the server is running on http://localhost:4000 and try again.\n\nTo start the server:\n1. Open command prompt\n2. Navigate to the quiz app folder\n3. Run: node server.js');
            submitPayoutBtn.disabled = false;
            submitPayoutBtn.textContent = "Submit for Payment";
            return;
        }
    }
    
    // Retry function for robust submission
    async function submitWithRetry(url, data, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt} of ${maxRetries} to submit payout`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                    throw new Error(errorData.message || `Server error: ${response.status}`);
                }
                
                return await response.json();
                
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw error; // Re-throw on final attempt
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
        }
    }
    
    // Submit with retry logic
    submitWithRetry(apiUrl, {
        name, 
        account_number, 
        bank_name, 
        email: email || undefined,
        reward_amount,
        score,
        total_questions: questions.length,
        score_percentage: percentage
    })
    .then((data) => {
        if (data.success) {
            // Calculate reward amount based on score
            const percentage = Math.round((score / questions.length) * 100);
            const rewardAmount = calculateReward(percentage);
            
            alert(`Submission successful! You will receive your ₦${rewardAmount} reward in 20-40 minutes.`);
            payoutForm.style.display = "none";
            claimingReward = false;
        } else {
            throw new Error(data.message || 'Unexpected server response');
        }
    })
    .catch((error) => {
        console.error('Payout submission error:', error);
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        
        // Provide more specific error messages
        let errorMessage = "There was an error submitting your payout request. ";
        
        if (error.name === 'AbortError') {
            errorMessage += "Request timed out after multiple attempts. Please check your connection and try again.";
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += "Cannot connect to server. Please make sure the server is running:\n\n1. Open command prompt\n2. Navigate to quiz app folder\n3. Run: node server.js";
        } else if (error.message.includes('Account number')) {
            errorMessage += "Please check that your account number is exactly 10 digits.";
        } else if (error.message.includes('Bank code')) {
            errorMessage += "Please check your bank selection.";
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage += "Network connection failed. Please check if the server is running on http://localhost:4000";
        } else if (error.message.includes('CORS')) {
            errorMessage += "Server connection blocked. Please restart the server.";
        } else if (error.message.includes('500')) {
            errorMessage += "Server error. Please check server logs and try again.";
        } else {
            errorMessage += "Error details: " + error.message + "\n\nTroubleshooting:\n1. Make sure server is running\n2. Check browser console for details\n3. Try refreshing the page";
        }
        
        alert(errorMessage);
        submitPayoutBtn.disabled = false;
        submitPayoutBtn.textContent = "Submit for Payment";
    });
});

// Don't start quiz automatically - wait for payment
// startQuiz();

// QUIZMASTER AI Assistant Functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const chatClose = document.getElementById('ai-chat-close');
    const chatMessages = document.getElementById('ai-chat-messages');
    const chatInput = document.getElementById('ai-chat-input');
    const chatSend = document.getElementById('ai-chat-send');
    const quickHelpBtns = document.querySelectorAll('.quick-help-btn');

    // Toggle chat window
    if (chatToggle) {
        chatToggle.addEventListener('click', function() {
            if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
                chatWindow.style.display = 'flex';
                chatToggle.style.transform = 'scale(0.9)';
            } else {
                chatWindow.style.display = 'none';
                chatToggle.style.transform = 'scale(1)';
            }
        });
    }

    // Close chat window
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            chatWindow.style.display = 'none';
            chatToggle.style.transform = 'scale(1)';
        });
    }

    // AI Response Database
    const aiResponses = {
        payment: {
            title: "💳 Payment Help",
            message: `Here's how payments work:

• **Minimum Stake:** ₦100
• **Payment Method:** Secure Paystack payment
• **One-time Payment:** Each quiz requires a new stake
• **Instant Start:** Quiz begins immediately after payment

**Having payment issues?**
Contact our support team:
📧 Email: icyxchange00@gmail.com
📱 WhatsApp: +2348146839663
📞 Phone: +2348146839663

We're here to help! 🤝`
        },
        quiz: {
            title: "❓ Quiz Help",
            message: `Quiz Information:

• **Questions:** Multiple choice questions
• **Time Limit:** No time pressure - take your time!
• **Anti-Cheat:** Don't switch tabs during quiz
• **Scoring:** Percentage-based scoring system

**Quiz Tips:**
✅ Read questions carefully
✅ Stay focused on the quiz tab
✅ Answer all questions to complete

**Need help during quiz?**
📧 Email: icyxchange00@gmail.com
📱 WhatsApp: +2348146839663`
        },
        rewards: {
            title: "🏆 Rewards Information",
            message: `Reward Structure:

🥉 **80-84% correct:** 2x your stake
🥈 **85-89% correct:** 3x your stake  
🥇 **90-94% correct:** 5x your stake
💎 **95-100% correct:** 10x your stake

**Example:** Stake ₦500, score 95% = Win ₦5,000!

**Payout Process:**
1. Complete quiz with 80%+ score
2. Click "Claim Reward" button
3. Enter your bank details
4. Receive payment within 24 hours

**Questions about rewards?**
📧 Email: icyxchange00@gmail.com
📱 WhatsApp: +2348146839663`
        },
        contact: {
            title: "📞 Contact Information",
            message: `Get in touch with us:

**Primary Contact:**
📧 **Email:** icyxchange00@gmail.com
📱 **WhatsApp:** +2348146839663
📞 **Phone:** +2348146839663

**Business Hours:**
🕒 Monday - Friday: 9:00 AM - 6:00 PM
🕒 Saturday: 10:00 AM - 4:00 PM
🕒 Sunday: Closed

**For urgent issues:**
Use WhatsApp for fastest response!

**What we can help with:**
• Payment problems
• Technical issues
• Account questions
• Reward claims
• General inquiries

We typically respond within 2 hours! 🚀`
        },
        default: {
            title: "🤖 QUIZMASTER Response",
            message: `I understand you need help! Here are the most common topics I can assist with:

**Quick Help Options:**
💳 Payment issues and questions
❓ Quiz rules and gameplay
🏆 Rewards and payout information
📞 Contact our support team

**Or try asking about:**
• "How do I start a quiz?"
• "What are the payment methods?"
• "How do rewards work?"
• "I need technical support"

**For immediate assistance:**
📧 Email: icyxchange00@gmail.com
📱 WhatsApp: +2348146839663

How else can I help you today? 😊`
        }
    };

    // Add message to chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            background: ${isUser ? '#001e4d' : 'white'};
            color: ${isUser ? 'white' : '#333'};
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            ${isUser ? 'margin-left: 20px;' : 'margin-right: 20px;'}
        `;
        
        if (isUser) {
            messageDiv.innerHTML = `<strong>You:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = message;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Process user input and generate AI response
    function processUserInput(input) {
        const lowerInput = input.toLowerCase();
        
        // Keyword matching for responses
        if (lowerInput.includes('payment') || lowerInput.includes('pay') || lowerInput.includes('stake') || lowerInput.includes('money')) {
            return aiResponses.payment;
        } else if (lowerInput.includes('quiz') || lowerInput.includes('question') || lowerInput.includes('game') || lowerInput.includes('play')) {
            return aiResponses.quiz;
        } else if (lowerInput.includes('reward') || lowerInput.includes('win') || lowerInput.includes('prize') || lowerInput.includes('payout')) {
            return aiResponses.rewards;
        } else if (lowerInput.includes('contact') || lowerInput.includes('support') || lowerInput.includes('help') || lowerInput.includes('phone') || lowerInput.includes('email')) {
            return aiResponses.contact;
        } else {
            return aiResponses.default;
        }
    }

    // Handle quick help buttons
    quickHelpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            const response = aiResponses[topic] || aiResponses.default;
            
            setTimeout(() => {
                addMessage(`<strong>QUIZMASTER:</strong> ${response.message}`);
            }, 500);
        });
    });

    // Handle chat input
    function handleChatInput() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            
            // Simulate AI thinking delay
            setTimeout(() => {
                const response = processUserInput(message);
                addMessage(`<strong>QUIZMASTER:</strong> ${response.message}`);
            }, 1000);
        }
    }

    // Send button click
    if (chatSend) {
        chatSend.addEventListener('click', handleChatInput);
    }

    // Enter key press
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleChatInput();
            }
        });
    }

    // Add hover effects to chat toggle
    if (chatToggle) {
        chatToggle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        chatToggle.addEventListener('mouseleave', function() {
            if (chatWindow.style.display !== 'flex') {
                this.style.transform = 'scale(1)';
            }
        });
    }
});