#!/bin/sh
source /app/venv/bin/activate
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
nginx -g 'daemon off;'