/**
 * Command Ping
 * Fungsi untuk mengecek status bot dengan detail lengkap
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function pingCommand(client, message) {
    try {
        // Validasi message.from
        if (!message.from || typeof message.from !== 'string') {
            console.error('❌ Invalid message.from in ping:', message.from);
            return;
        }

        // Hitung waktu respons (latency)
        const start = Date.now();
        const chat = await message.getChat();
        await chat.sendMessage('🔄 *Mengecek status bot...*');
        const latency = Date.now() - start;

        // Status yang lebih detail
        let status = '🟢 Stabil';
        let statusDesc = 'Bot berjalan dengan baik';

        if (latency > 3000) {
            status = '🔴 Lambat';
            statusDesc = 'Bot mengalami gangguan';
        } else if (latency > 1500) {
            status = '🟡 Kurang Stabil';
            statusDesc = 'Bot sedikit lambat';
        } else if (latency > 500) {
            status = '🟢 Stabil';
            statusDesc = 'Bot berjalan normal';
        } else {
            status = '🟢 Sangat Stabil';
            statusDesc = 'Bot berjalan sangat cepat';
        }

        // Format uptime yang lebih baik
        const uptimeSec = process.uptime();
        const uptimeMin = Math.floor(uptimeSec / 60);
        const uptimeHour = Math.floor(uptimeMin / 60);
        const uptimeDay = Math.floor(uptimeHour / 24);

        let uptimeStr = '';
        if (uptimeDay > 0) {
            uptimeStr = `${uptimeDay} hari ${uptimeHour % 24} jam ${uptimeMin % 60} menit`;
        } else if (uptimeHour > 0) {
            uptimeStr = `${uptimeHour} jam ${uptimeMin % 60} menit`;
        } else {
            uptimeStr = `${uptimeMin} menit`;
        }

        // Informasi memory yang lebih detail
        const memUsage = process.memoryUsage();
        const memRSS = (memUsage.rss / 1024 / 1024).toFixed(1);
        const memHeap = (memUsage.heapUsed / 1024 / 1024).toFixed(1);
        const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(1);

        // Informasi sistem yang lebih lengkap
        const platform = process.platform;
        const arch = process.arch;
        const nodeVersion = process.version;
        const pid = process.pid;

        // Format pesan yang lebih menarik
        const info =
            `╭─ *🤖 BOT STATUS*\n` +
            `├─ ${status}\n` +
            `├─ *${statusDesc}*\n` +
            `├─\n` +
            `├─ 📊 *PERFORMANCE*\n` +
            `├─ • Response Time: *${latency} ms*\n` +
            `├─ • Uptime: *${uptimeStr}*\n` +
            `├─\n` +
            `├─ 💾 *MEMORY USAGE*\n` +
            `├─ • RSS: *${memRSS} MB*\n` +
            `├─ • Heap Used: *${memHeap} MB*\n` +
            `├─ • Heap Total: *${memTotal} MB*\n` +
            `├─\n` +
            `├─ ⚙️ *SYSTEM INFO*\n` +
            `├─ • Node.js: *${nodeVersion}*\n` +
            `├─ • Platform: *${platform}*\n` +
            `├─ • Architecture: *${arch}*\n` +
            `├─ • Process ID: *${pid}*\n` +
            `╰─\n` +
            `\n*🕐 ${new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })}*`;

        // Kirim info lengkap
        await chat.sendMessage(info);

        // Log yang lebih informatif
        console.log(
            `✅ Ping replied to ${message.from} | ${latency}ms | ${status.replace(/[🟢🟡🔴]/g, '')} | Memory: ${memRSS}MB`
        );
    } catch (error) {
        console.error('❌ Error pada fitur ping:', error);
        try {
            await message.reply(
                '❌ *Gagal mengecek status bot*\n\nSilakan coba lagi nanti.'
            );
        } catch (sendError) {
            console.error('❌ Gagal mengirim pesan error:', sendError);
        }
    }
}

module.exports = pingCommand;
