// Waktu start bot
const startTime = Date.now();

/**
 * Command Uptime
 * Fungsi untuk mengecek berapa lama bot sudah berjalan
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function uptimeCommand(client, message) {
    try {
        const uptime = Date.now() - startTime;
        
        // Convert ke format yang mudah dibaca
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        const displayDays = days;
        const displayHours = hours % 24;
        const displayMinutes = minutes % 60;
        const displaySeconds = seconds % 60;
        
        // Info sistem
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        const memoryTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
        
        // Platform info
        const platform = process.platform;
        const nodeVersion = process.version;
        const pid = process.pid;
        
        let response = `⏱️ *BOT UPTIME & STATUS*\n\n`;
        
        // Uptime
        response += `🕐 *Waktu Hidup Bot:*\n`;
        if (days > 0) {
            response += `   ${displayDays} hari, ${displayHours} jam, ${displayMinutes} menit, ${displaySeconds} detik\n\n`;
        } else if (hours > 0) {
            response += `   ${displayHours} jam, ${displayMinutes} menit, ${displaySeconds} detik\n\n`;
        } else if (minutes > 0) {
            response += `   ${displayMinutes} menit, ${displaySeconds} detik\n\n`;
        } else {
            response += `   ${displaySeconds} detik\n\n`;
        }
        
        // Start time
        const startDate = new Date(startTime);
        response += `🚀 *Mulai Aktif:*\n`;
        response += `   ${startDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        response += `   Pukul ${startDate.toLocaleTimeString('id-ID')}\n\n`;
        
        // Current time
        const now = new Date();
        response += `📅 *Waktu Sekarang:*\n`;
        response += `   ${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        response += `   Pukul ${now.toLocaleTimeString('id-ID')}\n\n`;
        
        // Memory
        response += `💾 *Penggunaan Memori:*\n`;
        response += `   ${memoryUsedMB} MB / ${memoryTotalMB} MB\n\n`;
        
        // System info
        response += `🖥️ *Info Sistem:*\n`;
        response += `   Platform: ${getPlatformName(platform)}\n`;
        response += `   Node.js: ${nodeVersion}\n`;
        response += `   Process ID: ${pid}\n\n`;
        
        // Status
        response += `✅ *Status:* Bot Aktif & Berjalan Normal`;
        
        await message.reply(response);
        
        console.log(`✅ Uptime command berhasil dieksekusi`);
    } catch (error) {
        console.error('Error executing uptime command:', error);
        await message.reply('❌ Terjadi kesalahan saat menjalankan command.');
    }
}

/**
 * Helper function untuk mendapatkan nama platform
 */
function getPlatformName(platform) {
    const platforms = {
        'win32': 'Windows',
        'darwin': 'macOS',
        'linux': 'Linux',
        'freebsd': 'FreeBSD',
        'openbsd': 'OpenBSD',
        'aix': 'AIX',
        'sunos': 'SunOS'
    };
    return platforms[platform] || platform;
}

/**
 * Get uptime dalam milliseconds
 */
function getUptime() {
    return Date.now() - startTime;
}

/**
 * Get start time
 */
function getStartTime() {
    return startTime;
}

module.exports = uptimeCommand;
module.exports.getUptime = getUptime;
module.exports.getStartTime = getStartTime;
