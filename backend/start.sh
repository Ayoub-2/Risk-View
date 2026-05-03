#!/bin/bash
pkill -f 'uvicorn'
sleep 1

uvicorn app.main:app --host 0.0.0.0 --port 10000 &
