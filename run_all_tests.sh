#!/bin/bash
export SECRET_KEY=test-secret
export DATABASE_URL=sqlite+aiosqlite:///test.db

cd backend
export PYTHONPATH=.
echo "==> Initializing DB..."
../.venv/bin/python ../scripts/init_db.py
if [ $? -ne 0 ]; then echo "DB init failed"; exit 1; fi

echo "==> Running Pytest..."
../.venv/bin/pytest tests/ -v
if [ $? -ne 0 ]; then echo "Pytest failed"; exit 1; fi

echo "==> Starting Server for Security Regression..."
../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
PID=$!
sleep 2

cd ..
echo "==> Running Security Regression Script..."
.venv/bin/python scripts/security_regression.py
RESULT=$?

echo "==> Killing Server..."
kill $PID

exit $RESULT
