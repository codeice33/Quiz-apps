// Prevent cheating: Restart or end quiz if user leaves the browser tab, but not during payout claim
let quizEndedForCheating = false;
let claimingReward = false;

function handleCheating() {
    // Only trigger anti-cheat if not claiming reward
    if (!quizEndedForCheating && !claimingReward) {
        quizEndedForCheating = true;
        resetState();
        questionElement.innerHTML = 'Quiz ended: You left the browser tab.';
        nextButton.style.display = 'none';
        claimRewardButton.style.display = 'none';
        payoutForm.style.display = 'none';
    }
}

window.addEventListener('blur', handleCheating);
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        handleCheating();
    }
});
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

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const claimRewardButton = document.getElementById("claim-reward-btn");

// Timer elements
let timerInterval = null;
let timerTimeout = null;
let timerElement = document.getElementById('timer');
if (!timerElement) {
    timerElement = document.createElement('div');
    timerElement.id = 'timer';
    timerElement.style.cssText = 'font-size:18px;font-weight:600;margin-bottom:10px;color:#d9534f;';
    questionElement.parentNode.insertBefore(timerElement, questionElement);
}

let currentQuestionIndex = 0;
let score = 0;

function startQuiz(){
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    // Shuffle questions and answers
    questions = shuffleArray(questions);
    questions.forEach(q => {
        q.answers = shuffleArray(q.answers);
    });
    showQuestion();
}

function showQuestion(){
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    // Timer logic: 5 seconds per question
    let timeLeft = 7;
    timerElement.textContent = `Time left: ${timeLeft}s`;
    clearInterval(timerInterval);
    clearTimeout(timerTimeout);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
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
    }, 5000);

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
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
    if(score === 50 && questions.length === 50){
        claimRewardButton.style.display = "block";
    } else {
        claimRewardButton.style.display = "none";
    }
}

function handelNextButton(){
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        showscore();
    }
}




nextButton.addEventListener("click" , ()=>{
    if(currentQuestionIndex < questions.length){
        handelNextButton();
    }else{
        payoutForm.style.display = "none";
        claimingReward = false;
        startQuiz();
    }
});




const payoutForm = document.getElementById("payout-form");
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

submitPayoutBtn.addEventListener("click", () => {
    const name = payoutName.value.trim();
    const account_number = payoutAccount.value.trim();
    const bank_name = payoutBank.value.trim() || payoutBank.options[payoutBank.selectedIndex].text;
    const email = payoutEmail.value.trim();
    if(!name || !account_number || !bank_name || !email) {
        alert("Please fill in all payout details.");
        return;
    }
    // IMPORTANT: Set this to your backend's deployed URL (not your frontend domain)
    const ONLINE_BACKEND = 'https://quiz-appi.onrender.com'; // <-- Backend deployed on Render
    let apiUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://192.168.1.10:4000/manual-payout';
    } else {
        apiUrl = ONLINE_BACKEND + '/manual-payout';
    }
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, account_number, bank_name, email })
    })
    .then((res) => {
        if (res.ok) {
            alert("Submission successful! You will receive your payment in 20-40 minutes.");
            payoutForm.style.display = "none";
            claimingReward = false;
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch(() => {
        alert("There was an error submitting your payout request. Please try again.");
    });
});

startQuiz();