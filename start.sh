#!/bin/sh
source /app/venv/bin/activate
exec uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 &  
nginx -g 'daemon off;'