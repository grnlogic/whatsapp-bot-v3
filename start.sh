#!/bin/bash

echo "Starting WhatsApp Bot..."

while true; do
    node index.js
    EXIT_CODE=$?
    
    echo "Bot stopped with exit code $EXIT_CODE"
    
    # If exit code is not 0 (error), wait 5 seconds before restart
    if [ $EXIT_CODE -ne 0 ]; then
        echo "Error detected. Restarting in 5 seconds..."
        sleep 5
    else
        # Clean exit (code 0), restart immediately
        echo "Clean exit. Restarting in 3 seconds..."
        sleep 3
    fi
done
