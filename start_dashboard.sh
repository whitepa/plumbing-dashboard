#!/bin/bash
# Taken from https://die-antwort.eu/techblog/2017-12-setup-raspberry-pi-for-kiosk-mode/

# Disable any form of screen saver / screen blanking / power management
xset s off
xset s noblank
xset -dpms

# Allow quitting the X server with CTRL-ALT-Backspace
setxkbmap -option terminate:ctrl_alt_bksp

# Start Chromium in kiosk mode
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
chromium-browser --noerrdialogs --disable-infobars --check-for-update-interval=31536000 --kiosk /usr/local/plumbing-dashboard/index.html
