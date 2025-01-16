#! /usr/bin/env bash

set -e
set -x

HOST=${HOST:-0.0.0.0}
PORT=${BACKEND_PORT:-8022}
LOG_LEVEL=${LOG_LEVEL:-info}

bash prestart.sh

fastapi run --workers 4 --host 0.0.0.0 --port $BACKEND_PORT