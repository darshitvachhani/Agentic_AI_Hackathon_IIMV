#!/usr/bin/env bash
# Academic Business Strategy Simulation Platform Runner
PORT=${1:-3000}
echo "Starting Academic Business Strategy Simulation on http://localhost:${PORT} ..."
python3 server.py "${PORT}"
