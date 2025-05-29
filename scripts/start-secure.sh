#!/bin/bash

echo ""
echo "========================================"
echo "   🔒 RogueSim Secure Access Setup"
echo "========================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Installing..."
    npm install -g ngrok
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install ngrok. Please install manually."
        echo "Visit: https://ngrok.com/download"
        exit 1
    fi
fi

echo "✅ ngrok is available"
echo ""

# Get user choice
echo "Choose your secure access method:"
echo ""
echo "1. 🚀 Quick Demo (ngrok with basic auth)"
echo "2. 🔒 Secure Access (ngrok with password)"
echo "3. 🎮 Development Mode (local network access)"
echo "4. 🏭 Production Build (optimized)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting Quick Demo Mode..."
        echo "✅ Password: demo123"
        echo "✅ Username: player"
        echo ""
        
        # Start RogueSim in background
        gnome-terminal --title="RogueSim" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "npm run dev; exec bash" 2>/dev/null || \
        nohup npm run dev > /dev/null 2>&1 &
        
        sleep 5
        
        # Start ngrok tunnel
        gnome-terminal --title="Ngrok Tunnel" -- bash -c "ngrok http 3000 --auth=player:demo123; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "ngrok http 3000 --auth=player:demo123; exec bash" 2>/dev/null || \
        ngrok http 3000 --auth=player:demo123 &
        
        echo ""
        echo "🎯 Share the HTTPS URL that appears in the ngrok window!"
        echo "🔑 Login credentials: player / demo123"
        ;;
        
    2)
        echo ""
        read -p "Enter username for access: " username
        read -s -p "Enter password for access: " password
        echo ""
        echo ""
        echo "🔒 Starting Secure Mode..."
        echo "✅ Username: $username"
        echo "✅ Password: [hidden]"
        echo ""
        
        # Start RogueSim in background
        gnome-terminal --title="RogueSim" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "npm run dev; exec bash" 2>/dev/null || \
        nohup npm run dev > /dev/null 2>&1 &
        
        sleep 5
        
        # Start secure tunnel
        gnome-terminal --title="Secure Tunnel" -- bash -c "ngrok http 3000 --auth=$username:$password; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "ngrok http 3000 --auth=$username:$password; exec bash" 2>/dev/null || \
        ngrok http 3000 --auth=$username:$password &
        
        echo ""
        echo "🎯 Share the HTTPS URL that appears in the ngrok window!"
        echo "🔑 Login credentials: $username / [your password]"
        ;;
        
    3)
        echo ""
        echo "🎮 Starting Development Mode (Local Network)..."
        echo "⚠️  WARNING: No password protection!"
        echo "ℹ️  Only use on trusted networks"
        echo ""
        
        # Start dev server with host binding
        gnome-terminal --title="RogueSim Dev" -- bash -c "npm run dev -- --host 0.0.0.0; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "npm run dev -- --host 0.0.0.0; exec bash" 2>/dev/null || \
        npm run dev -- --host 0.0.0.0 &
        
        echo ""
        echo "🌐 Access via your local IP address:"
        
        # Get local IP addresses
        if command -v ip &> /dev/null; then
            ip route get 1.1.1.1 | grep -oP 'src \K\S+' | head -1 | sed 's/^/    http:\/\//' | sed 's/$/:3000/'
        elif command -v ifconfig &> /dev/null; then
            ifconfig | grep -oE 'inet ([0-9]{1,3}\.){3}[0-9]{1,3}' | grep -v '127.0.0.1' | sed 's/inet /    http:\/\//' | sed 's/$/:3000/'
        else
            echo "    Check your network settings for local IP"
        fi
        ;;
        
    4)
        echo ""
        echo "🏭 Building Production Version..."
        npm run build
        if [ $? -ne 0 ]; then
            echo "❌ Build failed!"
            exit 1
        fi
        echo "✅ Build complete!"
        echo ""
        
        read -p "Enter username for production access: " username
        read -s -p "Enter password for production access: " password
        echo ""
        echo ""
        
        # Start production server
        gnome-terminal --title="RogueSim Production" -- bash -c "npm start; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "npm start; exec bash" 2>/dev/null || \
        nohup npm start > /dev/null 2>&1 &
        
        sleep 3
        
        # Start production tunnel
        gnome-terminal --title="Production Tunnel" -- bash -c "ngrok http 5000 --auth=$username:$password; exec bash" 2>/dev/null || \
        open -a Terminal -n --args bash -c "ngrok http 5000 --auth=$username:$password; exec bash" 2>/dev/null || \
        ngrok http 5000 --auth=$username:$password &
        
        echo ""
        echo "🎯 Share the HTTPS URL from the ngrok window!"
        echo "🔑 Login credentials: $username / [your password]"
        ;;
        
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "   ✅ Secure Access Setup Complete!"
echo "========================================"
echo ""
echo "📋 What to do next:"
echo "   1. Wait for ngrok to show the HTTPS URL"
echo "   2. Share the HTTPS URL (never the HTTP one)"
echo "   3. Provide login credentials to users"
echo "   4. Monitor access in the terminal windows"
echo ""
echo "⚠️  Important Security Notes:"
echo "   • Always use HTTPS URLs only"
echo "   • Keep login credentials private"
echo "   • Monitor terminal for suspicious activity"
echo "   • Close tunnels when done (Ctrl+C)"
echo ""

read -p "Press Enter to continue..." 