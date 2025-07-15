# Quiz App Troubleshooting Guide

## Common Issues and Solutions

### 1. "There was an error submitting your payout request. Please check your internet connection and try again."

**Possible Causes:**
- Server is not running
- Wrong server URL
- Network connectivity issues
- CORS issues

**Solutions:**

#### Step 1: Check if server is running
```bash
# Open command prompt and run:
node server.js
```
You should see: `Backend server running on http://localhost:4000`

#### Step 2: Test server health
Open browser and go to: `http://localhost:4000/health`
You should see: `{"status":"healthy","timestamp":"...","server":"Quiz App Backend"}`

#### Step 3: Test payout endpoint directly
```bash
node test-complete.js
```
This will run comprehensive tests on all endpoints.

#### Step 4: Check browser console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages when submitting payout
4. Common errors and solutions:

**Error: "Cannot connect to server"**
- Solution: Make sure server is running on port 4000

**Error: "CORS policy"**
- Solution: Server has been configured to handle CORS, restart server

**Error: "Account number must be exactly 10 digits"**
- Solution: Enter a valid 10-digit account number

### 2. Server Won't Start

**Check for:**
- Node.js is installed: `node --version`
- Dependencies are installed: `npm install`
- Port 4000 is not in use by another application

**Solution:**
```bash
# Kill any existing node processes
taskkill /f /im node.exe
# Start server
node server.js
```

### 3. Frontend Can't Connect to Server

**Check:**
1. Server is running on http://localhost:4000
2. Frontend is accessing the correct URL
3. No firewall blocking the connection

**Test Connection:**
Use the test page: Open `test-payout.html` in browser and try submitting a test payout.

### 4. Validation Errors

**Account Number Issues:**
- Must be exactly 10 digits
- Only numbers allowed
- No spaces or special characters

**Bank Selection Issues:**
- Make sure a bank is selected from the dropdown
- Don't leave bank field empty

### 5. Quick Fixes

#### Reset Everything:
```bash
# Stop all node processes
taskkill /f /im node.exe

# Reinstall dependencies
npm install

# Start server
node server.js
```

#### Test Server Health:
```bash
# Run comprehensive tests
node test-complete.js
```

#### Start Server Easily:
Double-click `start-server.bat` file

## Debug Mode

To enable detailed logging, add this to the beginning of your server.js:
```javascript
process.env.DEBUG = 'true';
```

## Contact Information

If issues persist:
1. Check the server console for error messages
2. Check browser console for frontend errors
3. Run the test scripts to isolate the problem
4. Ensure all dependencies are properly installed

## Files for Testing

- `test-complete.js` - Tests all server endpoints
- `test-payout.html` - Simple frontend test page
- `start-server.bat` - Easy server startup script