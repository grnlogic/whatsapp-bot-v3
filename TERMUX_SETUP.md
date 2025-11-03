# 📱 Setup WhatsApp Bot di Termux

Panduan lengkap untuk menjalankan WhatsApp Bot di Termux (Android).

## 📋 Prerequisites

### 1. Install Termux dari F-Droid
Download Termux dari [F-Droid](https://f-droid.org/packages/com.termux/), **JANGAN** dari Google Play Store (versi Play Store sudah deprecated).

### 2. Update & Upgrade Termux
```bash
pkg update && pkg upgrade -y
```

### 3. Install Dependencies
```bash
# Install Node.js
pkg install nodejs -y

# Install Git
pkg install git -y

# Install Chromium (Required untuk whatsapp-web.js)
pkg install chromium -y

# Install build tools (untuk native modules)
pkg install build-essential python -y
```

## 🚀 Installation

### 1. Clone Repository
```bash
cd ~
git clone https://github.com/grnlogic/whatsapp-bot-v3.git
cd whatsapp-bot-v3
```

### 2. Set Environment Variables
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_SKIP_DOWNLOAD=true
export CHROME_PATH=/data/data/com.termux/files/usr/bin/chromium-browser
```

**💡 Tip:** Tambahkan ke `~/.bashrc` agar persisten:
```bash
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
echo 'export PUPPETEER_SKIP_DOWNLOAD=true' >> ~/.bashrc
echo 'export CHROME_PATH=/data/data/com.termux/files/usr/bin/chromium-browser' >> ~/.bashrc
source ~/.bashrc
```

### 3. Install NPM Packages
```bash
npm install --ignore-scripts
```

Jika masih error, coba:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --ignore-scripts
```

## ▶️ Running the Bot

### Start Bot
```bash
npm start
```

### Keep Bot Running in Background
Gunakan `screen` atau `tmux`:

**Menggunakan screen:**
```bash
# Install screen
pkg install screen -y

# Jalankan bot di screen
screen -S whatsapp-bot
npm start

# Detach: Ctrl+A, lalu D
# Reattach: screen -r whatsapp-bot
```

**Menggunakan tmux:**
```bash
# Install tmux
pkg install tmux -y

# Jalankan bot di tmux
tmux new -s whatsapp-bot
npm start

# Detach: Ctrl+B, lalu D
# Reattach: tmux attach -t whatsapp-bot
```

## 🔧 Troubleshooting

### Error: "Unsupported platform: android"
✅ Sudah diperbaiki! Bot sekarang otomatis detect Termux dan menggunakan Chromium yang terinstall.

### Error: "Chrome executable not found"
```bash
# Install Chromium
pkg install chromium -y

# Set Chrome path
export CHROME_PATH=/data/data/com.termux/files/usr/bin/chromium-browser
```

### Error: "ENOSPC: System limit for number of file watchers reached"
```bash
# Tidak perlu di Termux, tapi jika terjadi di Linux:
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Bot Crash saat Idle
Termux bisa kill process saat idle. Solusi:
1. Gunakan **Termux:Boot** untuk auto-start
2. Aktifkan **Wakelock** di Termux dengan `termux-wake-lock`
3. Nonaktifkan battery optimization untuk Termux

### Memory Issues
Jika bot crash karena memory:
```bash
# Kurangi memory usage dengan menonaktifkan features yang tidak perlu
# Edit index.js dan kurangi cache
```

## 📊 Monitoring

### Check Bot Status
```bash
# Lihat process
ps aux | grep node

# Lihat logs
tail -f ~/.npm/_logs/*.log
```

### Stop Bot
```bash
# Jika running di foreground: Ctrl+C

# Jika running di screen/tmux:
pkill -f "node index.js"
```

## 🔄 Auto-Restart on Crash

Buat script auto-restart:

```bash
# Buat file start.sh
cat > start.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
while true; do
    npm start
    echo "Bot crashed. Restarting in 5 seconds..."
    sleep 5
done
EOF

# Beri permission
chmod +x start.sh

# Jalankan
./start.sh
```

## 🎯 Features yang Bekerja di Termux

✅ QR Code Login  
✅ Command Handler  
✅ Image Sticker (menggunakan Jimp)  
✅ Text Sticker (menggunakan Jimp)  
✅ Video Sticker  
✅ Todo List  
✅ Reminders  
✅ Roast Generator  
✅ Neko Images  
✅ Ping/Uptime/Info  

❌ Image Sticker dengan Sharp (tidak support Android, otomatis fallback ke Jimp)

## 📝 Notes

- **Battery:** Bot memerlukan daya battery yang cukup. Hubungkan charger saat running 24/7
- **Internet:** Pastikan koneksi internet stabil
- **Storage:** Minimal 500MB free storage untuk dependencies dan cache
- **RAM:** Minimal 2GB RAM recommended

## 🆘 Support

Jika ada masalah:
1. Check logs di `~/.npm/_logs/`
2. Restart Termux
3. Reinstall dependencies: `rm -rf node_modules && npm install --ignore-scripts`
4. Buka issue di GitHub

## 📚 Resources

- [Termux Wiki](https://wiki.termux.com/)
- [whatsapp-web.js Docs](https://wwebjs.dev/)
- [Node.js Docs](https://nodejs.org/docs/)

---

**Made with ❤️ for Termux Users**
