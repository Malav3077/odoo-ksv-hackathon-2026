#!/bin/bash
echo "Starting RentEase..."

# Start Django backend
cd /home/solufy/Desktop/rental-management/backend
python3 manage.py runserver 8000 &
BACKEND_PID=$!
echo "Backend started on http://localhost:8000 (PID: $BACKEND_PID)"

# Start Next.js frontend
cd /home/solufy/Desktop/rental-management/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "Both servers running!"
echo "Open: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both"

# Stop both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
