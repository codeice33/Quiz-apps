@echo off
echo Starting Quiz App Server...
echo.
echo Server will be available at: http://localhost:4000
echo Health check: http://localhost:4000/health
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js
pause