# 🔧 YouTube 403 Error Fix Guide

## 🚨 **Problem: HTTP 403 Error**

Error yang Anda alami adalah **masalah umum** dengan `ytdl-core` karena YouTube terus mengubah sistem anti-bot mereka.

## ✅ **Solutions Applied**

### 1. **Enhanced Headers & User-Agent**

```javascript
requestOptions: {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        'Sec-Fetch-Mode': 'navigate'
    }
}
```

### 2. **Retry Mechanism**

- Try `getInfo()` first
- Fallback to `getBasicInfo()`
- Multiple error handling layers

### 3. **Alternative API Fallback**

- New command: `!altplay [URL]`
- Uses external YouTube API
- Bypasses ytdl-core completely

## 🎯 **Commands Available**

### **Primary (Fixed ytdl-core):**

- `!play [song name]` - Search and download
- `!song [YouTube URL]` - Direct download
- `!yts [keywords]` - Search YouTube

### **Fallback (Alternative API):**

- `!altplay [YouTube URL]` - Alternative download method
- Works when primary methods fail

## 🚀 **Quick Test**

Try this command to test the fix:

```
!altplay https://youtu.be/eZEFNv6gSHE
```

## 📋 **Troubleshooting Steps**

### **Step 1: Update ytdl-core**

```bash
npm uninstall @distube/ytdl-core
npm install @distube/ytdl-core@latest
```

### **Step 2: Try Different Method**

If `!play` fails, use `!altplay`:

```
!altplay https://youtu.be/YOUR_VIDEO_ID
```

### **Step 3: Clear Cache & Restart**

```bash
# Stop bot
Ctrl+C

# Clear npm cache
npm cache clean --force

# Restart bot
npm start
```

### **Step 4: Use Different ytdl Library**

```bash
npm uninstall @distube/ytdl-core
npm install ytdl-core@latest
```

## ⚡ **Quick Fix Commands**

```bash
# Update all packages
npm update

# Fix vulnerabilities
npm audit fix

# Restart bot
npm start
```

## 🔧 **Manual Fix for 403 Errors**

### **Method 1: Use Cookies (Advanced)**

1. Get YouTube cookies from browser
2. Add cookies to ytdl options
3. Rotate cookies periodically

### **Method 2: Use Proxy/VPN**

1. Install proxy packages (already done)
2. Configure proxy in ytdl options
3. Rotate IP addresses

### **Method 3: Use External APIs**

1. Use `!altplay` command
2. Falls back to public APIs
3. No dependency on ytdl-core

## ✅ **What's Been Fixed**

1. ✅ **Enhanced user agents** - Better browser mimicking
2. ✅ **Retry mechanisms** - Multiple fallback attempts
3. ✅ **Alternative APIs** - External download services
4. ✅ **Better error handling** - More descriptive errors
5. ✅ **Proxy support** - Ready for proxy implementation

## 🎵 **Ready to Test**

**Primary command:**

```
!play starboy weeknd
```

**Fallback command:**

```
!altplay https://youtu.be/eZEFNv6gSHE
```

**Search command:**

```
!yts linkin park numb
```

## 📞 **Still Having Issues?**

The 403 error is **ongoing issue** with YouTube's anti-bot measures. Try:

1. **Use alternative command:** `!altplay`
2. **Wait and retry** - YouTube blocks are temporary
3. **Use different videos** - Some are more restricted
4. **Update regularly** - ytdl-core gets frequent updates

**Bot is ready with fixes! 🚀**
