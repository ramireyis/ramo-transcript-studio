#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/python -m pip install -U 'yt-dlp[default]'
open http://127.0.0.1:8765
.venv/bin/python local_server.py
