# 🚀 Quick Remote Access Guide

## ⚡ **FASTEST METHOD** (Windows)

1. **Double-click**: `scripts/start-secure.bat`
2. **Choose option 1** (Quick Demo)
3. **Share the HTTPS URL** from the ngrok window
4. **Login**: `player` / `demo123`

---

## 🔒 **SECURE METHOD** (Any Platform)

### Windows:
```cmd
scripts\start-secure.bat
```

### Mac/Linux:
```bash
./scripts/start-secure.sh
```

**Then**:
- Choose option 2 (Secure Access)
- Set your own username/password
- Share only the **HTTPS** URL

---

## 🎯 **Manual Setup** (If scripts don't work)

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start RogueSim**:
   ```bash
   npm run dev
   ```

3. **Create secure tunnel** (new terminal):
   ```bash
   ngrok http 3000 --auth="username:password"
   ```

4. **Share the HTTPS URL** (not HTTP!)

---

## 📱 **Mobile-Friendly**

All remote access methods work perfectly on:
- 📱 iPhone/Android browsers
- 💻 Tablets
- 🖥️ Any device with internet

The terminal interface is fully responsive!

---

## ⚠️ **Security Checklist**

✅ **Always use HTTPS URLs** (https://abc123.ngrok.io)  
✅ **Set strong passwords** (not "123" or "password")  
✅ **Share credentials privately** (don't post publicly)  
✅ **Monitor terminal output** for suspicious activity  
✅ **Close tunnels when done** (Ctrl+C in terminal)  

❌ **Never share HTTP URLs** (http://abc123.ngrok.io)  
❌ **Don't use weak passwords**  
❌ **Don't leave tunnels open indefinitely**  

---

## 🆘 **Troubleshooting**

**Problem**: Ngrok not found
**Solution**: Install with `npm install -g ngrok`

**Problem**: Port already in use
**Solution**: Stop other servers, or change port in vite.config.ts

**Problem**: Can't connect remotely
**Solution**: Make sure you're sharing the HTTPS URL, not HTTP

**Problem**: "Auth required" error
**Solution**: Provide the username/password you set when creating the tunnel

---

## 🎮 **Ready to Share!**

Your RogueSim instance is now securely accessible from anywhere in the world. Perfect for:

- 👥 **Multiplayer sessions**
- 🎓 **Teaching/demonstrating**
- 🧪 **Testing on different devices**
- 🌍 **Remote collaboration**

**Example shareable message**:
```
🎮 Join my RogueSim server!
🔗 URL: https://abc123.ngrok.io
🔑 Login: username / password
🎯 It's a hacker terminal game - try "help" to start!
``` 