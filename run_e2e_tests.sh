#!/bin/bash
export SECRET_KEY=test-secret
export E2E_TEST_ADMIN_EMAIL=test@admin.edu
export E2E_TEST_ADMIN_PASSWORD=Password123!
export PYTHONPATH=backend
export USE_CLOUD_STORAGE=false
export TESTING=true

# Re-initialize the test DB to ensure clean state
.venv/bin/python scripts/init_db.py
if [ $? -ne 0 ]; then echo "DB init failed"; exit 1; fi

echo "==> Starting Backend Server..."
PYTHONPATH=backend .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "==> Starting Frontend Server..."
cd frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo "==> Waiting for servers to initialize..."
sleep 5

echo "==> Running Playwright Tests..."
npx playwright test
RESULT=$?

echo "==> Killing Servers..."
kill $BACKEND_PID
kill $FRONTEND_PID

exit $RESULT
