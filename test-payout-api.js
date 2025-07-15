(async () => {
  try {
    const response = await fetch('https://quiz-appi.onrender.com/manual-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        account_number: "1234567890",
        bank_name: "Test Bank",
        email: "test@example.com",
        reward_amount: 1000,
        score: 10,
        total_questions: 10,
        score_percentage: 100
      })
    });
    const data = await response.json();
    console.log('API response:', data);
    alert('Check console for API response');
  } catch (error) {
    console.error('API request error:', error);
    alert('API request error: ' + error.message);
  }
})();
