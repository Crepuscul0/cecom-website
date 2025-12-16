#!/bin/bash
# Simple startup script for cPanel deployment
# Upload this to ~/cecom-website/ on the server

export NODE_ENV=production
export NEXT_SHARP_PATH=$(npm root)/sharp/lib

# Start the standalone server
node server.js
