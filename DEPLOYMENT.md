# Quiz App - Setup & Deployment Guide

## Current Status

✅ Frontend: `index.html`, `admin.html`, `script.js`, `admin.js` - All configured correctly  
✅ Backend: `server.js` - Updated with leaderboard endpoints  
✅ Endpoints: `/leaderboard`, `/record-score`, `/manual-payout` - Fully implemented  

## Leaderboard Features

The leaderboard now works with:
- **GET /leaderboard** - Returns top scorers and biggest winners
- **POST /record-score** - Records quiz scores with name, score, percentage, total questions
- **POST /manual-payout** - Submits payout requests from winners
- **POST /manual-payouts/mark-paid** - Admin marks payouts as paid and updates winner paidAmount

## Local Testing (If Firewall Allows)

```powershell
# Start the server
npm install
npm start

# Test health check
Invoke-WebRequest http://localhost:4000/health -UseBasicParsing

# Test leaderboard  
Invoke-WebRequest http://localhost:4000/leaderboard -UseBasicParsing
```

Note: Local HTTP may be blocked by Windows Firewall. Use the online deployment instead.

## Deployment to Render

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update leaderboard endpoints"
   git push origin main
   ```

2. **Redeploy on Render**:
   - Go to https://render.com
   - Select your Quiz App service
   - Click "Manual Deploy" or push to GitHub to trigger auto-deploy
   - Wait for deployment to complete

3. **Verify Online**:
   ```powershell
   Invoke-WebRequest https://quiz-appi.onrender.com/health -UseBasicParsing
   Invoke-WebRequest https://quiz-appi.onrender.com/leaderboard -UseBasicParsing
   ```

## Frontend Configuration

All frontend files are already configured to use:
- **Backend URL**: `https://quiz-appi.onrender.com`
- **Scripts**: `script.js` sends scores to `/record-score`
- **Admin**: `admin.js` fetches and displays leaderboard
- **User**: Leaderboard modal shows top scorers and winners

## Files Updated

- `server.js` - Complete backend with all endpoints
- `script.js` - Removed testing overrides, uses fixed backend URL
- `admin.js` - Uses fixed backend URL for fetching data
- `index.html` - Removed testing override UI
- `admin.html` - Displays leaderboard data
- `package.json` - Has `start` script for npm start

## Next Steps

1. Deploy the updated `server.js` to Render
2. Verify `/leaderboard` endpoint returns data
3. Test score recording by completing a quiz
4. Check admin page to see leaderboard data
