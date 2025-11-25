const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Test data
const winners = [
    { name: 'Player 1', score: 95, total_questions: 100, score_percentage: 95, email: 'test1@example.com', timestamp: Date.now(), paidAmount: 0 },
    { name: 'Player 2', score: 85, total_questions: 100, score_percentage: 85, email: 'test2@example.com', timestamp: Date.now(), paidAmount: 5000 }
];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Leaderboard
app.get('/leaderboard', (req, res) => {
    const topScorers = [...winners].sort((a,b) => b.score - a.score).slice(0, 20);
    const biggestWinners = [...winners].filter(w => w.paidAmount && w.paidAmount > 0).sort((a,b) => b.paidAmount - a.paidAmount).slice(0, 20);
    res.json({ topScorers, biggestWinners });
});

// Record score
app.post('/record-score', (req, res) => {
    const { name, score, total_questions, email, score_percentage } = req.body;
    if (typeof score !== 'number') return res.status(400).json({ success: false, message: 'Score required' });
    const entry = { 
        name: name || 'Anonymous', 
        score, 
        total_questions: total_questions || 0,
        score_percentage: score_percentage || 0,
        email: email || '', 
        timestamp: Date.now(), 
        paidAmount: 0 
    };
    winners.push(entry);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
