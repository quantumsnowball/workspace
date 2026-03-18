#!/bin/bash

ENV_FILE='/etc/environment'

# Define the lines to add
LINES=(
    "MANGOHUD=1"
    # "MANGOHUD_CONFIG=no_display"
)

for LINE in "${LINES[@]}"; do
    if grep -Fxq "$LINE" "$ENV_FILE"; then
        echo "Already exists: $LINE"
    else
        echo "Adding to $ENV_FILE: $LINE"
        echo "$LINE" | sudo tee -a "$ENV_FILE" > /dev/null
    fi
done

echo "Done! Please reboot or log out for changes to apply."

