const os = require('os');
const { version } = require('../../package.json');

async function info(client, message) {
    try {
        // Informasi sistem operasi
        const platform = os.platform();
        const osType = os.type();
        const osRelease = os.release();
        const arch = os.arch();
        
        // Informasi CPU
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuCores = cpus.length;
        const cpuSpeed = cpus[0].speed;
        
        // Informasi Memory
        const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2); // GB
        const freeMemory = (os.freemem() / (1024 ** 3)).toFixed(2); // GB
        const usedMemory = (totalMemory - freeMemory).toFixed(2);
        const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(1);
        
        // Informasi Node.js dan Process
        const nodeVersion = process.version;
        const processUptime = process.uptime();
        const uptimeHours = Math.floor(processUptime / 3600);
        const uptimeMinutes = Math.floor((processUptime % 3600) / 60);
        const uptimeSeconds = Math.floor(processUptime % 60);
        
        // Informasi Jaringan
        const networkInterfaces = os.networkInterfaces();
        let networkInfo = '';
        
        for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            const ipv4 = interfaces.find(iface => iface.family === 'IPv4' && !iface.internal);
            if (ipv4) {
                networkInfo += `\n  • ${name}: ${ipv4.address}`;
            }
        }
        
        if (!networkInfo) {
            networkInfo = '\n  • Tidak ada interface jaringan aktif';
        }
        
        // Hostname
        const hostname = os.hostname();
        
        // Informasi WhatsApp Client
        const clientInfo = client.info;
        const botNumber = clientInfo ? clientInfo.wid.user : 'Loading...';
        const botPlatform = clientInfo ? clientInfo.platform : 'Loading...';
        
        // Format pesan
        const infoMessage = `
╭━━━━━━━━━━━━━━━━━━━━━╮
│   📊 *INFORMASI BOT*   │
╰━━━━━━━━━━━━━━━━━━━━━╯

┌─ 🤖 *Bot Info*
│ • Versi: ${version}
│ • Nomor: ${botNumber}
│ • Platform: ${botPlatform}
│ • Uptime: ${uptimeHours}j ${uptimeMinutes}m ${uptimeSeconds}s
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
│ • Speed: ${cpuSpeed} MHz
└─────────────────────

┌─ 🧠 *Memory*
│ • Total: ${totalMemory} GB
│ • Digunakan: ${usedMemory} GB
│ • Free: ${freeMemory} GB
│ • Usage: ${memoryUsage}%
└─────────────────────

┌─ 🌐 *Jaringan*${networkInfo}
└─────────────────────

┌─ 📦 *Runtime*
│ • Node.js: ${nodeVersion}
│ • Process ID: ${process.pid}
└─────────────────────

_Bot berjalan dengan baik! ✅_
        `.trim();
        
        await message.reply(infoMessage);
        
    } catch (error) {
        console.error('Error pada command info:', error);
        await message.reply('❌ Terjadi kesalahan saat mengambil informasi sistem.');
    }
}

module.exports = info;
