@echo off
echo 🌐 Starting RogueSim tunnel...
echo 🎯 Trying to get: https://roguesim.loca.lt

REM Try custom subdomains in order of preference
lt --port 3000 --subdomain roguesim || (
    echo ⚠️  roguesim taken, trying roguesim-game...
    lt --port 3000 --subdomain roguesim-game || (
        echo ⚠️  roguesim-game taken, trying rogue-sim...
        lt --port 3000 --subdomain rogue-sim || (
            echo ⚠️  rogue-sim taken, trying roguesim2025...
            lt --port 3000 --subdomain roguesim2025 || (
                echo ⚠️  All custom names taken, using random URL...
                lt --port 3000
            )
        )
    )
)

echo.
echo 🔐 When prompted for IP: 108.160.22.137
pause 