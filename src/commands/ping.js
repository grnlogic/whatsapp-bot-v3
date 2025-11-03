/**
 * Command Ping
 * Fungsi untuk mengecek apakah bot masih aktif
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function pingCommand(client, message) {
    const startTime = Date.now();
    
    try {
        // Kirim pesan "Pong!"
        const reply = await message.reply('🏓 Pong!');
        
        // Hitung latency
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        // Edit pesan dengan informasi latency
        await reply.edit(`🏓 Pong!\n⏱️ Latency: ${latency}ms`);
        
        console.log(`✅ Ping command berhasil dieksekusi (${latency}ms)`);
    } catch (error) {
        console.error('Error executing ping command:', error);
        await message.reply('❌ Terjadi kesalahan saat menjalankan command.');
    }
}

module.exports = pingCommand;
