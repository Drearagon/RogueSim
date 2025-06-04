# 🔧 Cloudflare Troubleshooting Guide

## Common Issue: "Internet Connection Error" on Login

### 🔍 **Root Cause**
When using Cloudflare, API calls need special configuration to work properly. The issue is usually:
- CORS (Cross-Origin Resource Sharing) headers
- SSL/TLS encryption mode mismatch
- DNS proxy settings

### 🚀 **Quick Fix**

**On your server, run this:**
```bash
# Copy the fix script to your server
scp fix-cloudflare-api.sh root@49.13.197.91:/opt/roguesim/

# SSH to server and run fix
ssh root@49.13.197.91
cd /opt/roguesim
chmod +x fix-cloudflare-api.sh
./fix-cloudflare-api.sh
```

### ⚙️ **Cloudflare Dashboard Settings**

**1. SSL/TLS Settings:**
- Go to SSL/TLS → Overview
- Set **Encryption mode** to **"Flexible"**
- Turn ON "Always Use HTTPS"

**2. DNS Settings:**
- Go to DNS → Records
- Ensure both A records are **PROXIED** (orange cloud ☁️):
  ```
  Type: A  | Name: @   | Content: 49.13.197.91 | Status: Proxied
  Type: A  | Name: www | Content: 49.13.197.91 | Status: Proxied
  ```

**3. Security Settings:**
- Go to Security → Settings
- Set Security Level to **"Medium"**
- Turn ON "Browser Integrity Check"

### 🔍 **Manual Verification Steps**

**1. Check if site loads:**
```bash
curl -I https://roguesim.com
# Should return: HTTP/2 200
```

**2. Check if API responds:**
```bash
curl https://roguesim.com/api/health
# Should return: {"status":"ok"}
```

**3. Browser Console Check:**
- Open https://roguesim.com
- Press F12 → Console tab
- Look for any red error messages
- Common errors:
  - `CORS policy` - Need to run fix script
  - `net::ERR_CONNECTION_REFUSED` - DNS not propagated yet
  - `Mixed Content` - Wrong SSL/TLS mode

### 🐛 **Common Issues & Solutions**

**Issue: "CORS policy error"**
```
Solution: Run the fix-cloudflare-api.sh script
```

**Issue: "Mixed Content" warnings**
```
Solution: In Cloudflare, go to SSL/TLS → Edge Certificates
Turn ON "Automatic HTTPS Rewrites"
```

**Issue: Site loads but login fails**
```
Solution: Clear browser cache and cookies for roguesim.com
```

**Issue: DNS not resolving**
```
Solution: Wait up to 48 hours for DNS propagation
Check: nslookup roguesim.com
Should show Cloudflare IPs (104.x.x.x or 172.x.x.x)
```

### 📊 **Cloudflare Page Rules (Optional)**

For better performance, add these page rules:

1. **Cache Everything:**
   - URL: `roguesim.com/static/*`
   - Setting: Cache Level = Cache Everything

2. **Always HTTPS:**
   - URL: `roguesim.com/*`
   - Setting: Always Use HTTPS = On

### 🎯 **Expected Results After Fix**

- ✅ https://roguesim.com loads with green lock
- ✅ Login form accepts credentials  
- ✅ No CORS errors in browser console
- ✅ Game functions normally
- ✅ Real-time features work

### 🔄 **If Problems Persist**

1. **Wait for DNS propagation** (up to 48 hours)
2. **Try incognito/private browsing mode**
3. **Check from different device/network**
4. **Temporarily pause Cloudflare** (in Overview → Advanced Actions)

### 📱 **Testing from Different Networks**

- Test from mobile data (different IP)
- Test from different WiFi network
- Ask friend to test from their location

This helps identify if it's a local network/DNS issue.

### 🆘 **Emergency: Bypass Cloudflare Temporarily**

If urgent, you can temporarily bypass Cloudflare:

**Option 1: DNS Only (Gray Cloud)**
- In Cloudflare DNS, click orange cloud to make it gray
- This removes proxy, keeps DNS only

**Option 2: Direct IP Access**
- Use: http://49.13.197.91:3000
- Temporary solution only

Remember to re-enable Cloudflare proxy for SSL and protection! 