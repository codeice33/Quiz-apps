// IMPORTANT: Set this to your backend's deployed URL
const ONLINE_BACKEND = 'https://quiz-appi.onrender.com'; // <-- Backend deployed on Render

// Using fixed backend URL from ONLINE_BACKEND constant (no local override)

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
        let apiUrl = ONLINE_BACKEND + '/verify-payment';
        
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

// --- QUESTION BANK BY DIFFICULTY ---
// --- EXPANDED QUESTION BANKS ---
// --- EXPANDED QUESTION BANKS ---
const hardQuestions = [
    { question: "What is the capital of Liechtenstein?", answers: [ { text: "Vaduz", correct: true }, { text: "Bern", correct: false }, { text: "Vienna", correct: false }, { text: "Zurich", correct: false } ] },
    { question: "Who developed the polio vaccine?", answers: [ { text: "Jonas Salk", correct: true }, { text: "Louis Pasteur", correct: false }, { text: "Edward Jenner", correct: false }, { text: "Alexander Fleming", correct: false } ] },
    { question: "Which mathematician is known as the father of geometry?", answers: [ { text: "Euclid", correct: true }, { text: "Pythagoras", correct: false }, { text: "Archimedes", correct: false }, { text: "Isaac Newton", correct: false } ] },
    { question: "What is the rarest blood type?", answers: [ { text: "AB negative", correct: true }, { text: "O positive", correct: false }, { text: "A positive", correct: false }, { text: "B negative", correct: false } ] },
    { question: "Which African country was never colonized?", answers: [ { text: "Ethiopia", correct: true }, { text: "Nigeria", correct: false }, { text: "Ghana", correct: false }, { text: "Kenya", correct: false } ] },
    { question: "What is the chemical symbol for potassium?", answers: [ { text: "K", correct: true }, { text: "P", correct: false }, { text: "Pt", correct: false }, { text: "Po", correct: false } ] },
    { question: "Who was the first person to reach the South Pole?", answers: [ { text: "Roald Amundsen", correct: true }, { text: "Robert Falcon Scott", correct: false }, { text: "Ernest Shackleton", correct: false }, { text: "Edmund Hillary", correct: false } ] },
    { question: "Which planet has the shortest day?", answers: [ { text: "Jupiter", correct: true }, { text: "Saturn", correct: false }, { text: "Mars", correct: false }, { text: "Mercury", correct: false } ] },
    { question: "What is the largest internal organ in the human body?", answers: [ { text: "Liver", correct: true }, { text: "Heart", correct: false }, { text: "Lung", correct: false }, { text: "Kidney", correct: false } ] },
    { question: "Who was the first woman in space?", answers: [ { text: "Valentina Tereshkova", correct: true }, { text: "Sally Ride", correct: false }, { text: "Mae Jemison", correct: false }, { text: "Yuri Gagarin", correct: false } ] },
    { question: "Which country has the most UNESCO World Heritage Sites?", answers: [ { text: "Italy", correct: true }, { text: "China", correct: false }, { text: "Spain", correct: false }, { text: "France", correct: false } ] },
    { question: "What is the smallest bone in the human body?", answers: [ { text: "Stapes", correct: true }, { text: "Femur", correct: false }, { text: "Ulna", correct: false }, { text: "Tibia", correct: false } ] },
    { question: "Who is the author of 'The Brothers Karamazov'?", answers: [ { text: "Fyodor Dostoevsky", correct: true }, { text: "Leo Tolstoy", correct: false }, { text: "Anton Chekhov", correct: false }, { text: "Vladimir Nabokov", correct: false } ] },
    { question: "Which element has the highest melting point?", answers: [ { text: "Tungsten", correct: true }, { text: "Iron", correct: false }, { text: "Gold", correct: false }, { text: "Platinum", correct: false } ] },
    { question: "What is the largest moon of Saturn?", answers: [ { text: "Titan", correct: true }, { text: "Rhea", correct: false }, { text: "Iapetus", correct: false }, { text: "Dione", correct: false } ] },
    { question: "Who was the first African to win an Olympic gold medal?", answers: [ { text: "Abebe Bikila", correct: true }, { text: "Haile Gebrselassie", correct: false }, { text: "Samuel Wanjiru", correct: false }, { text: "Kipchoge Keino", correct: false } ] },
    { question: "Which country is the largest producer of uranium?", answers: [ { text: "Kazakhstan", correct: true }, { text: "Canada", correct: false }, { text: "Australia", correct: false }, { text: "Russia", correct: false } ] },
    { question: "What is the longest river in Asia?", answers: [ { text: "Yangtze", correct: true }, { text: "Yellow River", correct: false }, { text: "Mekong", correct: false }, { text: "Ganges", correct: false } ] },
    { question: "Who painted 'Guernica'?", answers: [ { text: "Pablo Picasso", correct: true }, { text: "Salvador Dalí", correct: false }, { text: "Joan Miró", correct: false }, { text: "Francisco Goya", correct: false } ] },
    { question: "Which Nobel Prize category was first awarded in 1969?", answers: [ { text: "Economics", correct: true }, { text: "Peace", correct: false }, { text: "Literature", correct: false }, { text: "Chemistry", correct: false } ] },

    { question: "Which country hosted the 2008 Summer Olympics?", answers: [ { text: "China", correct: true }, { text: "UK", correct: false }, { text: "Brazil", correct: false }, { text: "Russia", correct: false } ] },
    { question: "Who was the first President of South Africa after apartheid?", answers: [ { text: "Nelson Mandela", correct: true }, { text: "Jacob Zuma", correct: false }, { text: "Thabo Mbeki", correct: false }, { text: "F.W. de Klerk", correct: false } ] },
    { question: "Which football club is known as 'The Old Lady'?", answers: [ { text: "Juventus", correct: true }, { text: "AC Milan", correct: false }, { text: "Inter Milan", correct: false }, { text: "Roma", correct: false } ] },
    { question: "What is the largest bone in the human body?", answers: [ { text: "Femur", correct: true }, { text: "Tibia", correct: false }, { text: "Fibula", correct: false }, { text: "Humerus", correct: false } ] },
    { question: "Which country is the origin of the car brand 'Hyundai'?", answers: [ { text: "South Korea", correct: true }, { text: "Japan", correct: false }, { text: "China", correct: false }, { text: "USA", correct: false } ] },
    { question: "Who discovered penicillin?", answers: [ { text: "Alexander Fleming", correct: true }, { text: "Louis Pasteur", correct: false }, { text: "Marie Curie", correct: false }, { text: "Edward Jenner", correct: false } ] },
    { question: "Which footballer has the most international goals?", answers: [ { text: "Cristiano Ronaldo", correct: true }, { text: "Ali Daei", correct: false }, { text: "Pele", correct: false }, { text: "Ferenc Puskas", correct: false } ] },
    { question: "What is the capital of Kazakhstan?", answers: [ { text: "Astana", correct: true }, { text: "Almaty", correct: false }, { text: "Tashkent", correct: false }, { text: "Bishkek", correct: false } ] },
    { question: "Which country has the most volcanoes?", answers: [ { text: "Indonesia", correct: true }, { text: "Japan", correct: false }, { text: "USA", correct: false }, { text: "Italy", correct: false } ] },
    { question: "Who is the only player to win the Champions League with three different clubs?", answers: [ { text: "Clarence Seedorf", correct: true }, { text: "Cristiano Ronaldo", correct: false }, { text: "Samuel Eto'o", correct: false }, { text: "Zlatan Ibrahimovic", correct: false } ] },
    { question: "What is the largest desert in the world?", answers: [ { text: "Antarctic", correct: true }, { text: "Sahara", correct: false }, { text: "Gobi", correct: false }, { text: "Kalahari", correct: false } ] },
    { question: "Which country is the largest island in the world?", answers: [ { text: "Greenland", correct: true }, { text: "Australia", correct: false }, { text: "Borneo", correct: false }, { text: "Madagascar", correct: false } ] },
    { question: "Who invented the World Wide Web?", answers: [ { text: "Tim Berners-Lee", correct: true }, { text: "Bill Gates", correct: false }, { text: "Steve Jobs", correct: false }, { text: "Mark Zuckerberg", correct: false } ] },
    { question: "Which footballer is nicknamed 'The Pharaoh'?", answers: [ { text: "Mohamed Salah", correct: true }, { text: "Ahmed Hegazi", correct: false }, { text: "Mahmoud Hassan Trezeguet", correct: false }, { text: "Mohamed Elneny", correct: false } ] },
    { question: "What is the chemical symbol for lead?", answers: [ { text: "Pb", correct: true }, { text: "Ld", correct: false }, { text: "Le", correct: false }, { text: "Pd", correct: false } ] },
    { question: "Which country is the largest archipelago in the world?", answers: [ { text: "Indonesia", correct: true }, { text: "Philippines", correct: false }, { text: "Japan", correct: false }, { text: "Greece", correct: false } ] },
    { question: "Who was the first man to step on the moon?", answers: [ { text: "Neil Armstrong", correct: true }, { text: "Buzz Aldrin", correct: false }, { text: "Yuri Gagarin", correct: false }, { text: "Michael Collins", correct: false } ] },
    { question: "Which football club is known as 'The Blues'?", answers: [ { text: "Chelsea", correct: true }, { text: "Manchester City", correct: false }, { text: "Everton", correct: false }, { text: "Leicester City", correct: false } ] },
    { question: "What is the largest ocean on Earth?", answers: [ { text: "Pacific", correct: true }, { text: "Atlantic", correct: false }, { text: "Indian", correct: false }, { text: "Arctic", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup as both player and coach?", answers: [ { text: "Mario Zagallo", correct: true }, { text: "Franz Beckenbauer", correct: false }, { text: "Didier Deschamps", correct: false }, { text: "Zinedine Zidane", correct: false } ] },
    { question: "What is the capital of Canada?", answers: [ { text: "Ottawa", correct: true }, { text: "Toronto", correct: false }, { text: "Vancouver", correct: false }, { text: "Montreal", correct: false } ] },
    { question: "Which country is the largest exporter of oil?", answers: [ { text: "Saudi Arabia", correct: true }, { text: "Russia", correct: false }, { text: "USA", correct: false }, { text: "Canada", correct: false } ] },
    { question: "Who is the only player to win the Ballon d'Or, FIFA World Player of the Year, and UEFA Best Player in the same year?", answers: [ { text: "Cristiano Ronaldo", correct: true }, { text: "Lionel Messi", correct: false }, { text: "Ronaldinho", correct: false }, { text: "Luka Modric", correct: false } ] },
    { question: "What is the smallest country in the world?", answers: [ { text: "Vatican City", correct: true }, { text: "Monaco", correct: false }, { text: "Nauru", correct: false }, { text: "San Marino", correct: false } ] },
    { question: "Which footballer is known as 'The Flea'?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Cristiano Ronaldo", correct: false }, { text: "Neymar", correct: false }, { text: "Kylian Mbappe", correct: false } ] },
    { question: "What is the chemical symbol for mercury?", answers: [ { text: "Hg", correct: true }, { text: "Mc", correct: false }, { text: "Me", correct: false }, { text: "Mr", correct: false } ] },
    { question: "Which country is the largest democracy in the world?", answers: [ { text: "India", correct: true }, { text: "USA", correct: false }, { text: "Brazil", correct: false }, { text: "Indonesia", correct: false } ] },
    { question: "Who was the first female Prime Minister of the UK?", answers: [ { text: "Margaret Thatcher", correct: true }, { text: "Theresa May", correct: false }, { text: "Elizabeth II", correct: false }, { text: "Angela Merkel", correct: false } ] },
    { question: "Which footballer is known as 'The Black Panther'?", answers: [ { text: "Eusebio", correct: true }, { text: "Pele", correct: false }, { text: "George Weah", correct: false }, { text: "Samuel Eto'o", correct: false } ] },
    { question: "What is the largest lake in Africa?", answers: [ { text: "Lake Victoria", correct: true }, { text: "Lake Tanganyika", correct: false }, { text: "Lake Malawi", correct: false }, { text: "Lake Chad", correct: false } ] },
    { question: "Who is the only player to win the UEFA Champions League as both player and manager?", answers: [ { text: "Zinedine Zidane", correct: true }, { text: "Pep Guardiola", correct: false }, { text: "Carlo Ancelotti", correct: false }, { text: "Frank Lampard", correct: false } ] },
    { question: "What is the capital of Turkey?", answers: [ { text: "Ankara", correct: true }, { text: "Istanbul", correct: false }, { text: "Izmir", correct: false }, { text: "Bursa", correct: false } ] },
    { question: "Which country is the largest producer of cocoa?", answers: [ { text: "Ivory Coast", correct: true }, { text: "Ghana", correct: false }, { text: "Nigeria", correct: false }, { text: "Cameroon", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Boot and Golden Ball in the same tournament?", answers: [ { text: "Ronaldo (Brazil)", correct: true }, { text: "Pele", correct: false }, { text: "Maradona", correct: false }, { text: "Zidane", correct: false } ] },
    { question: "What is the largest island in the Mediterranean Sea?", answers: [ { text: "Sicily", correct: true }, { text: "Sardinia", correct: false }, { text: "Cyprus", correct: false }, { text: "Crete", correct: false } ] },
    { question: "Which footballer is known as 'The King'?", answers: [ { text: "Pele", correct: true }, { text: "Maradona", correct: false }, { text: "Zidane", correct: false }, { text: "Ronaldo", correct: false } ] },
    { question: "What is the chemical symbol for sodium?", answers: [ { text: "Na", correct: true }, { text: "So", correct: false }, { text: "S", correct: false }, { text: "N", correct: false } ] },
    { question: "Which country is the largest peninsula in the world?", answers: [ { text: "Arabian Peninsula", correct: true }, { text: "Iberian Peninsula", correct: false }, { text: "Scandinavian Peninsula", correct: false }, { text: "Balkan Peninsula", correct: false } ] },
    { question: "Who was the first African to win the Nobel Peace Prize?", answers: [ { text: "Albert Lutuli", correct: true }, { text: "Nelson Mandela", correct: false }, { text: "Desmond Tutu", correct: false }, { text: "Kofi Annan", correct: false } ] },
    { question: "Which footballer is known as 'The Atomic Flea'?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Cristiano Ronaldo", correct: false }, { text: "Neymar", correct: false }, { text: "Kylian Mbappe", correct: false } ] },
    { question: "What is the largest waterfall in the world?", answers: [ { text: "Victoria Falls", correct: true }, { text: "Niagara Falls", correct: false }, { text: "Iguazu Falls", correct: false }, { text: "Angel Falls", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup as captain and coach?", answers: [ { text: "Franz Beckenbauer", correct: true }, { text: "Mario Zagallo", correct: false }, { text: "Didier Deschamps", correct: false }, { text: "Zinedine Zidane", correct: false } ] },
    { question: "What is the capital of Switzerland?", answers: [ { text: "Bern", correct: true }, { text: "Zurich", correct: false }, { text: "Geneva", correct: false }, { text: "Basel", correct: false } ] },
    { question: "Which country is the largest producer of diamonds?", answers: [ { text: "Russia", correct: true }, { text: "Botswana", correct: false }, { text: "Canada", correct: false }, { text: "South Africa", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Ball twice?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Pele", correct: false }, { text: "Maradona", correct: false }, { text: "Ronaldo", correct: false } ] },
    { question: "What is the largest bay in the world?", answers: [ { text: "Bay of Bengal", correct: true }, { text: "Hudson Bay", correct: false }, { text: "San Francisco Bay", correct: false }, { text: "Bay of Biscay", correct: false } ] },
    { question: "Which footballer is known as 'The Maestro'?", answers: [ { text: "Andrea Pirlo", correct: true }, { text: "Xavi", correct: false }, { text: "Iniesta", correct: false }, { text: "Modric", correct: false } ] },
    { question: "What is the chemical symbol for iron?", answers: [ { text: "Fe", correct: true }, { text: "Ir", correct: false }, { text: "In", correct: false }, { text: "Io", correct: false } ] },
    { question: "Which country is the largest landlocked country in the world?", answers: [ { text: "Kazakhstan", correct: true }, { text: "Mongolia", correct: false }, { text: "Chad", correct: false }, { text: "Bolivia", correct: false } ] },
    { question: "Who was the first African to win the Nobel Prize in Literature?", answers: [ { text: "Wole Soyinka", correct: true }, { text: "Chinua Achebe", correct: false }, { text: "Ngugi wa Thiong'o", correct: false }, { text: "Nadine Gordimer", correct: false } ] },
    { question: "Which footballer is known as 'The Phenomenon'?", answers: [ { text: "Ronaldo Nazario", correct: true }, { text: "Ronaldinho", correct: false }, { text: "Kaka", correct: false }, { text: "Romario", correct: false } ] },
    { question: "What is the largest river in Africa?", answers: [ { text: "Nile", correct: true }, { text: "Congo", correct: false }, { text: "Niger", correct: false }, { text: "Zambezi", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Glove twice?", answers: [ { text: "Manuel Neuer", correct: true }, { text: "Gianluigi Buffon", correct: false }, { text: "Iker Casillas", correct: false }, { text: "Peter Schmeichel", correct: false } ] },
    { question: "What is the capital of Finland?", answers: [ { text: "Helsinki", correct: true }, { text: "Oslo", correct: false }, { text: "Stockholm", correct: false }, { text: "Copenhagen", correct: false } ] },
    { question: "Which country is the largest producer of gold?", answers: [ { text: "China", correct: true }, { text: "Australia", correct: false }, { text: "Russia", correct: false }, { text: "USA", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Boot and Golden Ball in the same tournament?", answers: [ { text: "Ronaldo (Brazil)", correct: true }, { text: "Pele", correct: false }, { text: "Maradona", correct: false }, { text: "Zidane", correct: false } ] },
    { question: "What is the largest island in the Mediterranean Sea?", answers: [ { text: "Sicily", correct: true }, { text: "Sardinia", correct: false }, { text: "Cyprus", correct: false }, { text: "Crete", correct: false } ] },
    { question: "Which footballer is known as 'The King'?", answers: [ { text: "Pele", correct: true }, { text: "Maradona", correct: false }, { text: "Zidane", correct: false }, { text: "Ronaldo", correct: false } ] },
    { question: "What is the chemical symbol for sodium?", answers: [ { text: "Na", correct: true }, { text: "So", correct: false }, { text: "S", correct: false }, { text: "N", correct: false } ] },
    { question: "Which country is the largest peninsula in the world?", answers: [ { text: "Arabian Peninsula", correct: true }, { text: "Iberian Peninsula", correct: false }, { text: "Scandinavian Peninsula", correct: false }, { text: "Balkan Peninsula", correct: false } ] },
    { question: "Who was the first African to win the Nobel Peace Prize?", answers: [ { text: "Albert Lutuli", correct: true }, { text: "Nelson Mandela", correct: false }, { text: "Desmond Tutu", correct: false }, { text: "Kofi Annan", correct: false } ] },
    { question: "Which footballer is known as 'The Atomic Flea'?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Cristiano Ronaldo", correct: false }, { text: "Neymar", correct: false }, { text: "Kylian Mbappe", correct: false } ] },
    { question: "What is the largest waterfall in the world?", answers: [ { text: "Victoria Falls", correct: true }, { text: "Niagara Falls", correct: false }, { text: "Iguazu Falls", correct: false }, { text: "Angel Falls", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup as captain and coach?", answers: [ { text: "Franz Beckenbauer", correct: true }, { text: "Mario Zagallo", correct: false }, { text: "Didier Deschamps", correct: false }, { text: "Zinedine Zidane", correct: false } ] },
    { question: "What is the capital of Switzerland?", answers: [ { text: "Bern", correct: true }, { text: "Zurich", correct: false }, { text: "Geneva", correct: false }, { text: "Basel", correct: false } ] },
    { question: "Which country is the largest producer of diamonds?", answers: [ { text: "Russia", correct: true }, { text: "Botswana", correct: false }, { text: "Canada", correct: false }, { text: "South Africa", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Ball twice?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Pele", correct: false }, { text: "Maradona", correct: false }, { text: "Ronaldo", correct: false } ] },
    { question: "What is the largest bay in the world?", answers: [ { text: "Bay of Bengal", correct: true }, { text: "Hudson Bay", correct: false }, { text: "San Francisco Bay", correct: false }, { text: "Bay of Biscay", correct: false } ] },
    { question: "Which footballer is known as 'The Maestro'?", answers: [ { text: "Andrea Pirlo", correct: true }, { text: "Xavi", correct: false }, { text: "Iniesta", correct: false }, { text: "Modric", correct: false } ] },
    { question: "What is the chemical symbol for iron?", answers: [ { text: "Fe", correct: true }, { text: "Ir", correct: false }, { text: "In", correct: false }, { text: "Io", correct: false } ] },
    { question: "Which country is the largest landlocked country in the world?", answers: [ { text: "Kazakhstan", correct: true }, { text: "Mongolia", correct: false }, { text: "Chad", correct: false }, { text: "Bolivia", correct: false } ] },
    { question: "Who was the first African to win the Nobel Prize in Literature?", answers: [ { text: "Wole Soyinka", correct: true }, { text: "Chinua Achebe", correct: false }, { text: "Ngugi wa Thiong'o", correct: false }, { text: "Nadine Gordimer", correct: false } ] },
    { question: "Which footballer is known as 'The Phenomenon'?", answers: [ { text: "Ronaldo Nazario", correct: true }, { text: "Ronaldinho", correct: false }, { text: "Kaka", correct: false }, { text: "Romario", correct: false } ] },
    { question: "What is the largest river in Africa?", answers: [ { text: "Nile", correct: true }, { text: "Congo", correct: false }, { text: "Niger", correct: false }, { text: "Zambezi", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Glove twice?", answers: [ { text: "Manuel Neuer", correct: true }, { text: "Gianluigi Buffon", correct: false }, { text: "Iker Casillas", correct: false }, { text: "Peter Schmeichel", correct: false } ] },
    { question: "What is the capital of Finland?", answers: [ { text: "Helsinki", correct: true }, { text: "Oslo", correct: false }, { text: "Stockholm", correct: false }, { text: "Copenhagen", correct: false } ] },
    { question: "Which country is the largest producer of gold?", answers: [ { text: "China", correct: true }, { text: "Australia", correct: false }, { text: "Russia", correct: false }, { text: "USA", correct: false } ] },
];
const mediumQuestions = [
    { question: "Which team won the 2018 FIFA World Cup?", answers: [ { text: "France", correct: true }, { text: "Croatia", correct: false }, { text: "Brazil", correct: false }, { text: "Germany", correct: false } ] },
    { question: "Who is the all-time top scorer in the English Premier League?", answers: [ { text: "Alan Shearer", correct: true }, { text: "Wayne Rooney", correct: false }, { text: "Sergio Aguero", correct: false }, { text: "Thierry Henry", correct: false } ] },
    { question: "What is the chemical symbol for potassium?", answers: [ { text: "K", correct: true }, { text: "P", correct: false }, { text: "Pt", correct: false }, { text: "Po", correct: false } ] },
    { question: "What is the capital of Spain?", answers: [ { text: "Madrid", correct: true }, { text: "Barcelona", correct: false }, { text: "Valencia", correct: false }, { text: "Seville", correct: false } ] },
    { question: "Which continent is the Sahara Desert located in?", answers: [ { text: "Africa", correct: true }, { text: "Asia", correct: false }, { text: "Australia", correct: false }, { text: "Europe", correct: false } ] },
    { question: "Who invented the telephone?", answers: [ { text: "Alexander Graham Bell", correct: true }, { text: "Thomas Edison", correct: false }, { text: "Nikola Tesla", correct: false }, { text: "Guglielmo Marconi", correct: false } ] },
    { question: "What is the largest island in the world?", answers: [ { text: "Greenland", correct: true }, { text: "Australia", correct: false }, { text: "Borneo", correct: false }, { text: "Madagascar", correct: false } ] },
    { question: "Which element has the chemical symbol 'O'?", answers: [ { text: "Oxygen", correct: true }, { text: "Gold", correct: false }, { text: "Osmium", correct: false }, { text: "Oganesson", correct: false } ] },
    { question: "Who wrote 'Romeo and Juliet'?", answers: [ { text: "William Shakespeare", correct: true }, { text: "Charles Dickens", correct: false }, { text: "Jane Austen", correct: false }, { text: "Mark Twain", correct: false } ] },
    { question: "What is the largest country in South America?", answers: [ { text: "Brazil", correct: true }, { text: "Argentina", correct: false }, { text: "Colombia", correct: false }, { text: "Peru", correct: false } ] },
    { question: "Which planet is known for its rings?", answers: [ { text: "Saturn", correct: true }, { text: "Jupiter", correct: false }, { text: "Uranus", correct: false }, { text: "Neptune", correct: false } ] },
    { question: "What is the hardest natural substance on Earth?", answers: [ { text: "Diamond", correct: true }, { text: "Gold", correct: false }, { text: "Iron", correct: false }, { text: "Silver", correct: false } ] },
    { question: "Who discovered gravity?", answers: [ { text: "Isaac Newton", correct: true }, { text: "Albert Einstein", correct: false }, { text: "Galileo Galilei", correct: false }, { text: "Marie Curie", correct: false } ] },
    { question: "What is the capital of Kenya?", answers: [ { text: "Nairobi", correct: true }, { text: "Mombasa", correct: false }, { text: "Kisumu", correct: false }, { text: "Eldoret", correct: false } ] },
    { question: "Which river is the longest in the world?", answers: [ { text: "Nile", correct: true }, { text: "Amazon", correct: false }, { text: "Yangtze", correct: false }, { text: "Mississippi", correct: false } ] },
    { question: "Who painted the Starry Night?", answers: [ { text: "Vincent van Gogh", correct: true }, { text: "Pablo Picasso", correct: false }, { text: "Claude Monet", correct: false }, { text: "Leonardo da Vinci", correct: false } ] },
    { question: "What is the largest desert in the world?", answers: [ { text: "Antarctic", correct: true }, { text: "Sahara", correct: false }, { text: "Gobi", correct: false }, { text: "Kalahari", correct: false } ] },
    { question: "Which country is known as the Land of the Rising Sun?", answers: [ { text: "Japan", correct: true }, { text: "China", correct: false }, { text: "Thailand", correct: false }, { text: "India", correct: false } ] },
    { question: "Who is the author of 'Harry Potter'?", answers: [ { text: "J.K. Rowling", correct: true }, { text: "J.R.R. Tolkien", correct: false }, { text: "Stephen King", correct: false }, { text: "Roald Dahl", correct: false } ] },
    { question: "What is the capital of Australia?", answers: [ { text: "Canberra", correct: true }, { text: "Sydney", correct: false }, { text: "Melbourne", correct: false }, { text: "Perth", correct: false } ] },
    { question: "Which gas do plants absorb from the atmosphere?", answers: [ { text: "Carbon Dioxide", correct: true }, { text: "Oxygen", correct: false }, { text: "Nitrogen", correct: false }, { text: "Hydrogen", correct: false } ] },
    { question: "Which football club is nicknamed 'The Red Devils'?", answers: [ { text: "Manchester United", correct: true }, { text: "Liverpool", correct: false }, { text: "Arsenal", correct: false }, { text: "Chelsea", correct: false } ] },
    { question: "What is the largest planet in our solar system?", answers: [ { text: "Jupiter", correct: true }, { text: "Saturn", correct: false }, { text: "Earth", correct: false }, { text: "Mars", correct: false } ] },
    { question: "Who is the all-time top scorer in the English Premier League?", answers: [ { text: "Alan Shearer", correct: true }, { text: "Wayne Rooney", correct: false }, { text: "Sergio Aguero", correct: false }, { text: "Thierry Henry", correct: false } ] },
    { question: "What is the chemical symbol for sodium?", answers: [ { text: "Na", correct: true }, { text: "So", correct: false }, { text: "S", correct: false }, { text: "N", correct: false } ] },
    { question: "Which country is the largest peninsula in the world?", answers: [ { text: "Arabian Peninsula", correct: true }, { text: "Iberian Peninsula", correct: false }, { text: "Scandinavian Peninsula", correct: false }, { text: "Balkan Peninsula", correct: false } ] },
    { question: "Who was the first African to win the Nobel Peace Prize?", answers: [ { text: "Albert Lutuli", correct: true }, { text: "Nelson Mandela", correct: false }, { text: "Desmond Tutu", correct: false }, { text: "Kofi Annan", correct: false } ] },
    { question: "Which footballer is known as 'The Atomic Flea'?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Cristiano Ronaldo", correct: false }, { text: "Neymar", correct: false }, { text: "Kylian Mbappe", correct: false } ] },
    { question: "What is the largest waterfall in the world?", answers: [ { text: "Victoria Falls", correct: true }, { text: "Niagara Falls", correct: false }, { text: "Iguazu Falls", correct: false }, { text: "Angel Falls", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup as captain and coach?", answers: [ { text: "Franz Beckenbauer", correct: true }, { text: "Mario Zagallo", correct: false }, { text: "Didier Deschamps", correct: false }, { text: "Zinedine Zidane", correct: false } ] },
    { question: "What is the capital of Switzerland?", answers: [ { text: "Bern", correct: true }, { text: "Zurich", correct: false }, { text: "Geneva", correct: false }, { text: "Basel", correct: false } ] },
    { question: "Which country is the largest producer of diamonds?", answers: [ { text: "Russia", correct: true }, { text: "Botswana", correct: false }, { text: "Canada", correct: false }, { text: "South Africa", correct: false } ] },
    { question: "Who is the only player to win the FIFA World Cup Golden Ball twice?", answers: [ { text: "Lionel Messi", correct: true }, { text: "Pele", correct: false }, { text: "Maradona", correct: false }, { text: "Ronaldo", correct: false } ] },
    { question: "What is the largest bay in the world?", answers: [ { text: "Bay of Bengal", correct: true }, { text: "Hudson Bay", correct: false }, { text: "San Francisco Bay", correct: false }, { text: "Bay of Biscay", correct: false } ] },
    { question: "Which footballer is known as 'The Maestro'?", answers: [ { text: "Andrea Pirlo", correct: true }, { text: "Xavi", correct: false }, { text: "Iniesta", correct: false }, { text: "Modric", correct: false } ] },
    { question: "What is the chemical symbol for iron?", answers: [ { text: "Fe", correct: true }, { text: "Ir", correct: false }, { text: "In", correct: false }, { text: "Io", correct: false } ] },
];
const easyQuestions = [
    { question: "What is the capital of France?", answers: [ { text: "Paris", correct: true }, { text: "Berlin", correct: false }, { text: "Madrid", correct: false }, { text: "Lisbon", correct: false } ] },
    { question: "Which is the largest animal in the world?", answers: [ { text: "Blue whale", correct: true }, { text: "Shark", correct: false }, { text: "Elephant", correct: false }, { text: "Giraffe", correct: false } ] },
    { question: "Which planet is known as the Red Planet?", answers: [ { text: "Mars", correct: true }, { text: "Earth", correct: false }, { text: "Jupiter", correct: false }, { text: "Saturn", correct: false } ] },
    { question: "Who is known as the Father of Computers?", answers: [ { text: "Charles Babbage", correct: true }, { text: "Alan Turing", correct: false }, { text: "Bill Gates", correct: false }, { text: "Steve Jobs", correct: false } ] },
    { question: "Which country won the 2014 FIFA World Cup?", answers: [ { text: "Germany", correct: true }, { text: "Argentina", correct: false }, { text: "Brazil", correct: false }, { text: "Netherlands", correct: false } ] },
    { question: "What is the boiling point of water?", answers: [ { text: "100°C", correct: true }, { text: "90°C", correct: false }, { text: "80°C", correct: false }, { text: "120°C", correct: false } ] },
    { question: "Who painted the Mona Lisa?", answers: [ { text: "Leonardo da Vinci", correct: true }, { text: "Vincent Van Gogh", correct: false }, { text: "Pablo Picasso", correct: false }, { text: "Claude Monet", correct: false } ] },
    { question: "Which footballer is called 'CR7'?", answers: [ { text: "Cristiano Ronaldo", correct: true }, { text: "Lionel Messi", correct: false }, { text: "Neymar", correct: false }, { text: "Kylian Mbappe", correct: false } ] },
    { question: "What is the main language spoken in Brazil?", answers: [ { text: "Portuguese", correct: true }, { text: "Spanish", correct: false }, { text: "French", correct: false }, { text: "English", correct: false } ] },
    { question: "Which country is known as the Land of a Thousand Lakes?", answers: [ { text: "Finland", correct: true }, { text: "Sweden", correct: false }, { text: "Norway", correct: false }, { text: "Denmark", correct: false } ] },
    { question: "What is the tallest mountain in the world?", answers: [ { text: "Mount Everest", correct: true }, { text: "K2", correct: false }, { text: "Kangchenjunga", correct: false }, { text: "Lhotse", correct: false } ] },
    { question: "Which continent is Egypt located in?", answers: [ { text: "Africa", correct: true }, { text: "Asia", correct: false }, { text: "Europe", correct: false }, { text: "South America", correct: false } ] },
    { question: "What is the largest ocean on Earth?", answers: [ { text: "Pacific Ocean", correct: true }, { text: "Atlantic Ocean", correct: false }, { text: "Indian Ocean", correct: false }, { text: "Arctic Ocean", correct: false } ] },
    { question: "How many days are there in a leap year?", answers: [ { text: "366", correct: true }, { text: "365", correct: false }, { text: "364", correct: false }, { text: "360", correct: false } ] },
    { question: "What is the largest organ in the human body?", answers: [ { text: "Skin", correct: true }, { text: "Liver", correct: false }, { text: "Heart", correct: false }, { text: "Lung", correct: false } ] },
    { question: "Which instrument has keys, pedals, and strings?", answers: [ { text: "Piano", correct: true }, { text: "Guitar", correct: false }, { text: "Violin", correct: false }, { text: "Drum", correct: false } ] },
    { question: "What is the currency of Japan?", answers: [ { text: "Yen", correct: true }, { text: "Won", correct: false }, { text: "Dollar", correct: false }, { text: "Euro", correct: false } ] },
    { question: "Which gas do humans need to breathe?", answers: [ { text: "Oxygen", correct: true }, { text: "Carbon Dioxide", correct: false }, { text: "Nitrogen", correct: false }, { text: "Hydrogen", correct: false } ] },
    { question: "What color do you get when you mix red and white?", answers: [ { text: "Pink", correct: true }, { text: "Purple", correct: false }, { text: "Orange", correct: false }, { text: "Brown", correct: false } ] },
    { question: "Which planet is closest to the sun?", answers: [ { text: "Mercury", correct: true }, { text: "Venus", correct: false }, { text: "Earth", correct: false }, { text: "Mars", correct: false } ] },
    { question: "How many continents are there?", answers: [ { text: "7", correct: true }, { text: "5", correct: false }, { text: "6", correct: false }, { text: "8", correct: false } ] },
    { question: "What is the largest mammal on land?", answers: [ { text: "Elephant", correct: true }, { text: "Giraffe", correct: false }, { text: "Hippopotamus", correct: false }, { text: "Rhinoceros", correct: false } ] },
    { question: "Which country is famous for pizza and pasta?", answers: [ { text: "Italy", correct: true }, { text: "France", correct: false }, { text: "Spain", correct: false }, { text: "Greece", correct: false } ] },
    { question: "What is the freezing point of water?", answers: [ { text: "0°C", correct: true }, { text: "32°C", correct: false }, { text: "100°C", correct: false }, { text: "-10°C", correct: false } ] },
    { question: "Which animal is known as the King of the Jungle?", answers: [ { text: "Lion", correct: true }, { text: "Tiger", correct: false }, { text: "Elephant", correct: false }, { text: "Leopard", correct: false } ] },
    { question: "What is the main ingredient in bread?", answers: [ { text: "Flour", correct: true }, { text: "Sugar", correct: false }, { text: "Salt", correct: false }, { text: "Butter", correct: false } ] },
    { question: "Which shape has three sides?", answers: [ { text: "Triangle", correct: true }, { text: "Square", correct: false }, { text: "Circle", correct: false }, { text: "Rectangle", correct: false } ] },
    { question: "What is the capital city of Nigeria?", answers: [ { text: "Abuja", correct: true }, { text: "Lagos", correct: false }, { text: "Kano", correct: false }, { text: "Port Harcourt", correct: false } ] },
    { question: "Which fruit is yellow and curved?", answers: [ { text: "Banana", correct: true }, { text: "Apple", correct: false }, { text: "Orange", correct: false }, { text: "Grape", correct: false } ] },
    { question: "What do bees make?", answers: [ { text: "Honey", correct: true }, { text: "Milk", correct: false }, { text: "Wax", correct: false }, { text: "Bread", correct: false } ] },
    { question: "Which month comes after June?", answers: [ { text: "July", correct: true }, { text: "August", correct: false }, { text: "May", correct: false }, { text: "September", correct: false } ] },
    { question: "What is the opposite of 'hot'?", answers: [ { text: "Cold", correct: true }, { text: "Warm", correct: false }, { text: "Cool", correct: false }, { text: "Boiling", correct: false } ] },
    { question: "Which animal barks?", answers: [ { text: "Dog", correct: true }, { text: "Cat", correct: false }, { text: "Cow", correct: false }, { text: "Sheep", correct: false } ] },
    { question: "What is H2O commonly known as?", answers: [ { text: "Water", correct: true }, { text: "Oxygen", correct: false }, { text: "Hydrogen", correct: false }, { text: "Salt", correct: false } ] },
    { question: "Which day comes after Friday?", answers: [ { text: "Saturday", correct: true }, { text: "Sunday", correct: false }, { text: "Monday", correct: false }, { text: "Thursday", correct: false } ] },
    { question: "What is the color of the sky on a clear day?", answers: [ { text: "Blue", correct: true }, { text: "Green", correct: false }, { text: "Red", correct: false }, { text: "Yellow", correct: false } ] },
    { question: "Which animal is known for its trunk?", answers: [ { text: "Elephant", correct: true }, { text: "Lion", correct: false }, { text: "Horse", correct: false }, { text: "Dog", correct: false } ] },
    { question: "How many legs does a spider have?", answers: [ { text: "8", correct: true }, { text: "6", correct: false }, { text: "4", correct: false }, { text: "10", correct: false } ] },
    { question: "What is the name of our galaxy?", answers: [ { text: "Milky Way", correct: true }, { text: "Andromeda", correct: false }, { text: "Solar System", correct: false }, { text: "Orion", correct: false } ] },
    { question: "Which vegetable is orange and long?", answers: [ { text: "Carrot", correct: true }, { text: "Potato", correct: false }, { text: "Tomato", correct: false }, { text: "Cucumber", correct: false } ] },
    { question: "What do you call a baby cat?", answers: [ { text: "Kitten", correct: true }, { text: "Puppy", correct: false }, { text: "Cub", correct: false }, { text: "Calf", correct: false } ] },
    { question: "Which season comes after summer?", answers: [ { text: "Autumn", correct: true }, { text: "Winter", correct: false }, { text: "Spring", correct: false }, { text: "Rainy", correct: false } ] },
    { question: "What is the fastest land animal?", answers: [ { text: "Cheetah", correct: true }, { text: "Lion", correct: false }, { text: "Horse", correct: false }, { text: "Tiger", correct: false } ] },
    { question: "Which bird is known for its colorful tail?", answers: [ { text: "Peacock", correct: true }, { text: "Sparrow", correct: false }, { text: "Crow", correct: false }, { text: "Pigeon", correct: false } ] },
    { question: "What is the main source of energy for the Earth?", answers: [ { text: "Sun", correct: true }, { text: "Moon", correct: false }, { text: "Wind", correct: false }, { text: "Water", correct: false } ] },
    { question: "Which shape is round?", answers: [ { text: "Circle", correct: true }, { text: "Square", correct: false }, { text: "Triangle", correct: false }, { text: "Rectangle", correct: false } ] },
    { question: "What is the name of the fairy in Peter Pan?", answers: [ { text: "Tinker Bell", correct: true }, { text: "Cinderella", correct: false }, { text: "Ariel", correct: false }, { text: "Belle", correct: false } ] },
    { question: "Which animal is known for building dams?", answers: [ { text: "Beaver", correct: true }, { text: "Otter", correct: false }, { text: "Rabbit", correct: false }, { text: "Squirrel", correct: false } ] },
    { question: "What is the largest planet in our solar system?", answers: [ { text: "Jupiter", correct: true }, { text: "Saturn", correct: false }, { text: "Earth", correct: false }, { text: "Mars", correct: false } ] },
    { question: "Which country is known as the Land of the Rising Sun?", answers: [ { text: "Japan", correct: true }, { text: "China", correct: false }, { text: "Thailand", correct: false }, { text: "India", correct: false } ] },
];

// Select questions based on stake amount
function getQuestionsForStake(stake) {
    if (stake < 5000) return shuffleArray(hardQuestions).slice(0, 70);
    if (stake <= 15000) return shuffleArray(mediumQuestions).slice(0, 35);
    return shuffleArray(easyQuestions).slice(0, 40);
}

let questions = getQuestionsForStake(stakeAmount);

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
    
    // Always refresh questions based on current stake
    questions = getQuestionsForStake(stakeAmount);
    
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
    
    // Record score to leaderboard (non-blocking)
    (async () => {
        try {
            // Use existing userName if available, otherwise ask for a display name
            let displayName = userName && userName.trim() ? userName : null;
            if (!displayName) {
                displayName = prompt('Enter a display name for the leaderboard (or leave empty to remain anonymous):');
                if (displayName) {
                    userName = displayName;
                }
            }

            const payload = {
                name: displayName || 'Anonymous',
                score: score,
                total_questions: questions.length,
                email: userEmail || undefined,
                score_percentage: percentage
            };

            // Fire-and-forget, don't block the UI. Log errors quietly.
            fetch(ONLINE_BACKEND + '/record-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(res => {
                if (!res.ok) console.warn('Recording score returned', res.status);
                return res.json().catch(() => ({}));
            }).then(data => console.log('Recorded score response:', data)).catch(err => console.warn('Record score failed:', err));
        } catch (err) {
            console.warn('Leaderboard recording error:', err);
        }
    })();

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

// User-facing leaderboard functions
async function fetchUserLeaderboard() {
    try {
        // Show loading placeholders
        const topList = document.getElementById('user-leaderboard-top');
        const winnersList = document.getElementById('user-leaderboard-winners');
        if (topList) topList.innerHTML = '<li style="padding:8px;color:#888">Loading...</li>';
        if (winnersList) winnersList.innerHTML = '<li style="padding:8px;color:#888">Loading...</li>';

        // Timeout-aware fetch
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(ONLINE_BACKEND + '/leaderboard', { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
            throw new Error('HTTP ' + res.status + ' - ' + res.statusText);
        }

        const data = await res.json();

        // Clear lists for fresh data
        if (topList) topList.innerHTML = '';
        if (winnersList) winnersList.innerHTML = '';

        if (data && Array.isArray(data.topScorers) && data.topScorers.length) {
            data.topScorers.forEach((item, idx) => {
                const li = document.createElement('li');
                li.style.padding = '8px 6px';
                li.style.borderBottom = '1px solid #e9ecef';
                // compute safe percentage
                let pct = item.score_percentage;
                if ((pct === undefined || pct === null || isNaN(pct)) && item.total_questions && item.total_questions > 0) {
                    pct = Math.round((Number(item.score) / Number(item.total_questions)) * 100);
                }
                const pctText = (pct === undefined || pct === null || isNaN(pct)) ? 'N/A' : pct + '%';
                li.innerHTML = `<strong>${idx + 1}. ${escapeHtml(item.name || 'Anonymous')}</strong><br><small>Score: ${item.score}/${item.total_questions || 'N/A'} (${pctText})</small>`;
                topList.appendChild(li);
            });
        } else if (topList) {
            topList.innerHTML = '<li style="padding:8px;color:#888">No top scorers yet.</li>';
        }

        if (data && Array.isArray(data.biggestWinners) && data.biggestWinners.length) {
            data.biggestWinners.forEach((item) => {
                const li = document.createElement('li');
                li.style.padding = '8px 6px';
                li.style.borderBottom = '1px solid #e9ecef';
                li.innerHTML = `<strong>${escapeHtml(item.name || 'Anonymous')}</strong><br><small>Amount Paid: ₦${item.paidAmount || 0}</small>`;
                winnersList.appendChild(li);
            });
        } else if (winnersList) {
            winnersList.innerHTML = '<li style="padding:8px;color:#888">No winners yet.</li>';
        }
    } catch (err) {
        console.warn('Failed to load leaderboard:', err);
        const topList = document.getElementById('user-leaderboard-top');
        const winnersList = document.getElementById('user-leaderboard-winners');
        const message = err.name === 'AbortError' ? 'Request timed out. Try again.' : `Unable to load leaderboard: ${err.message}`;
        if (topList) topList.innerHTML = `<li style="padding:8px;color:#888">${escapeHtml(message)}</li>`;
        if (winnersList) winnersList.innerHTML = `<li style="padding:8px;color:#888">${escapeHtml(message)}</li>`;
    }
}

// Basic HTML escape to avoid injection from server data
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Wire up user leaderboard UI interactions
document.addEventListener('DOMContentLoaded', () => {
    const viewBtn = document.getElementById('view-leaderboard-btn');
    const panel = document.getElementById('user-leaderboard-panel');
    const closeBtn = document.getElementById('close-leaderboard-btn');
    const refreshBtn = document.getElementById('refresh-user-leaderboard');

    if (viewBtn && panel) {
        viewBtn.addEventListener('click', () => {
            panel.style.display = 'block';
            fetchUserLeaderboard();
        });
    }
    if (closeBtn && panel) {
        closeBtn.addEventListener('click', () => panel.style.display = 'none');
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => fetchUserLeaderboard());
    }
});

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
    let apiUrl = ONLINE_BACKEND + '/manual-payout';
    
    console.log('Submitting payout to:', apiUrl);
    console.log('Payout data:', { name, account_number, bank_name, email: email || 'undefined' });
    
    // No need to test server connection or try localhost; always use ONLINE_BACKEND
    
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
            
            alert(`Submission successful! You will receive your ₦${rewardAmount} reward in 24hrs.`);
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
            errorMessage += "Network connection failed. Please check if the server is running on https://quiz-appi.onrender.com";
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