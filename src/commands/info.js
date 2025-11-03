const os = require('os');
const { version } = require('../../package.json');

// Helper function untuk safe get value
function safeGet(fn, fallback = 'N/A') {
    try {
        const result = fn();
        return result !== undefined && result !== null ? result : fallback;
    } catch (error) {
        console.log('Error getting value:', error.message);
        return fallback;
    }
}

async function info(client, message) {
    try {
        console.log('🔍 Command info dipanggil...');
        
        // Informasi sistem operasi dengan fallback
        const platform = safeGet(() => os.platform(), 'Unknown');
        const osType = safeGet(() => os.type(), 'Unknown');
        const osRelease = safeGet(() => os.release(), 'Unknown');
        const arch = safeGet(() => os.arch(), 'Unknown');
        const hostname = safeGet(() => os.hostname(), 'Unknown');
        
        // Informasi CPU dengan fallback untuk Termux
        let cpuModel = 'N/A';
        let cpuCores = 0;
        let cpuSpeed = 'N/A';
        
        try {
            const cpus = os.cpus();
            if (cpus && cpus.length > 0) {
                cpuModel = cpus[0].model || 'Unknown CPU';
                cpuCores = cpus.length;
                cpuSpeed = cpus[0].speed ? `${cpus[0].speed} MHz` : 'N/A';
            }
        } catch (err) {
            console.log('CPU info not available:', err.message);
            cpuModel = 'Termux CPU';
            cpuCores = safeGet(() => os.cpus().length, 1);
        }
        
        // Informasi Memory dengan fallback
        let totalMemory = 'N/A';
        let freeMemory = 'N/A';
        let usedMemory = 'N/A';
        let memoryUsage = 'N/A';
        
        try {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            
            if (totalMem && freeMem) {
                totalMemory = (totalMem / (1024 ** 3)).toFixed(2) + ' GB';
                freeMemory = (freeMem / (1024 ** 3)).toFixed(2) + ' GB';
                const used = (totalMem - freeMem) / (1024 ** 3);
                usedMemory = used.toFixed(2) + ' GB';
                memoryUsage = ((used / (totalMem / (1024 ** 3))) * 100).toFixed(1) + '%';
            }
        } catch (err) {
            console.log('Memory info not available:', err.message);
        }
        
        // Informasi Node.js dan Process
        const nodeVersion = process.version || 'Unknown';
        const processUptime = process.uptime();
        const uptimeHours = Math.floor(processUptime / 3600);
        const uptimeMinutes = Math.floor((processUptime % 3600) / 60);
        const uptimeSeconds = Math.floor(processUptime % 60);
        
        // Informasi Jaringan dengan fallback untuk Termux
        let networkInfo = '';
        try {
            const networkInterfaces = os.networkInterfaces();
            
            if (networkInterfaces && Object.keys(networkInterfaces).length > 0) {
                for (const [name, interfaces] of Object.entries(networkInterfaces)) {
                    if (!interfaces) continue;
                    
                    // Support both string 'IPv4' and number 4, and handle Termux
                    const ipv4 = interfaces.find(iface => {
                        if (!iface) return false;
                        const isIPv4 = iface.family === 'IPv4' || iface.family === 4;
                        const notInternal = !iface.internal;
                        return isIPv4 && notInternal;
                    });
                    
                    if (ipv4 && ipv4.address) {
                        networkInfo += `\n  • ${name}: ${ipv4.address}`;
                    }
                }
            }
        } catch (err) {
            console.log('Network info not available:', err.message);
        }
        
        if (!networkInfo) {
            networkInfo = '\n  • Localhost (127.0.0.1)';
        }
        
        // Informasi WhatsApp Client
        let botNumber = 'Loading...';
        let botPlatform = 'Loading...';
        
        try {
            const clientInfo = client.info;
            if (clientInfo && clientInfo.wid) {
                botNumber = clientInfo.wid.user;
            }
            if (clientInfo && clientInfo.platform) {
                botPlatform = clientInfo.platform;
            }
        } catch (err) {
            console.log('Client info not available yet:', err.message);
        }
        
        // Deteksi environment (Termux atau tidak)
        const isTermux = platform === 'android' || process.env.PREFIX?.includes('com.termux');
        const envType = isTermux ? '📱 Termux (Android)' : '🖥️ Server/PC';
        
        // Format pesan dengan info yang tersedia
        const infoMessage = `
╭━━━━━━━━━━━━━━━━━━━━━╮
│   📊 *INFORMASI BOT*   │
╰━━━━━━━━━━━━━━━━━━━━━╯

┌─ 🤖 *Bot Info*
│ • Versi: ${version}
│ • Nomor: ${botNumber}
│ • Platform: ${botPlatform}
│ • Uptime: ${uptimeHours}j ${uptimeMinutes}m ${uptimeSeconds}s
│ • Environment: ${envType}
└─────────────────────

┌─ 💻 *Sistem Operasi*
│ • OS: ${osType} ${osRelease}
│ • Platform: ${platform}
│ • Arsitektur: ${arch}
│ • Hostname: ${hostname}
└─────────────────────

┌─ ⚙️ *CPU*
│ • Model: ${cpuModel}
│ • Cores: ${cpuCores}
│ • Speed: ${cpuSpeed}
└─────────────────────

┌─ 🧠 *Memory*
│ • Total: ${totalMemory}
│ • Digunakan: ${usedMemory}
│ • Free: ${freeMemory}
│ • Usage: ${memoryUsage}
└─────────────────────

┌─ 🌐 *Jaringan*${networkInfo}
└─────────────────────

┌─ 📦 *Runtime*
│ • Node.js: ${nodeVersion}
│ • Process ID: ${process.pid}
└─────────────────────

_Bot berjalan dengan baik! ✅_
        `.trim();
        
        console.log('✅ Mengirim info message...');
        await message.reply(infoMessage);
        console.log('✅ Info message terkirim!');
        
    } catch (error) {
        console.error('❌ Error pada command info:', error);
        console.error('Stack trace:', error.stack);
        
        // Fallback message jika terjadi error
        const fallbackMessage = `
📊 *INFORMASI BOT* (Mode Minimal)

Bot sedang berjalan dengan baik! ✅

⚠️ Beberapa informasi sistem tidak dapat diambil.
Kemungkinan berjalan di lingkungan Termux dengan akses terbatas.

• Node.js: ${process.version}
• Uptime: ${Math.floor(process.uptime() / 60)} menit
• Process ID: ${process.pid}

Error detail: ${error.message}
        `.trim();
        
        await message.reply(fallbackMessage);
    }
}

module.exports = info;
