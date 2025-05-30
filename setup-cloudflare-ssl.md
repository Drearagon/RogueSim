# 🔒 Easy SSL Setup with Cloudflare (Recommended)

## Why Cloudflare?
- ✅ **Free SSL certificates**
- ✅ **No server configuration needed**
- ✅ **Built-in DDoS protection**
- ✅ **Global CDN for faster loading**
- ✅ **Easy setup through web interface**

## Step-by-Step Setup

### 1. Sign up for Cloudflare
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Click "Add a Site" and enter: `roguesim.com`

### 2. Change Nameservers (at IONOS)
Cloudflare will give you 2 nameservers like:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**In your IONOS control panel:**
1. Go to Domain settings for `roguesim.com`
2. Find "Nameserver" settings
3. Change from IONOS nameservers to Cloudflare's
4. Wait 24-48 hours for propagation

### 3. Configure DNS in Cloudflare
Once nameservers are changed:

1. In Cloudflare dashboard, go to DNS tab
2. Add these records:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | 49.13.197.91 | Proxied (orange cloud) |
| A | www | 49.13.197.91 | Proxied (orange cloud) |

### 4. Enable SSL in Cloudflare
1. Go to SSL/TLS tab in Cloudflare
2. Set encryption mode to **"Flexible"** (easiest)
3. Turn on "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### 5. Optional: Security Settings
In Security tab:
- Enable "Browser Integrity Check"
- Set Security Level to "Medium"
- Enable "Bot Fight Mode"

## That's It! 🎉

After nameserver propagation (24-48 hours), your site will have:
- ✅ Free SSL certificate
- ✅ Automatic HTTP to HTTPS redirect
- ✅ DDoS protection
- ✅ Global CDN

## Alternative: Quick Let's Encrypt Setup

If you prefer to keep DNS with IONOS and just add SSL to your server:

```bash
# Copy the setup-ssl.sh script to your server
scp setup-ssl.sh root@49.13.197.91:/opt/roguesim/

# SSH to your server
ssh root@49.13.197.91

# Run the SSL setup
cd /opt/roguesim
chmod +x setup-ssl.sh
./setup-ssl.sh
```

## Recommendation

**For beginners**: Use Cloudflare (easier, more features)
**For advanced users**: Use Let's Encrypt (more control, no third-party)

Both provide trusted SSL certificates that work in all browsers! 