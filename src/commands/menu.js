const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

/**
 * Command Menu
 * Fungsi untuk menampilkan daftar semua command yang tersedia
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function menuCommand(client, message) {
    try {
        // URL gambar tersembunyi - akan ditampilkan sebagai thumbnail menu
        const imageUrl = 'https://i.pinimg.com/736x/62/71/21/627121c616927469a5afe87589f779bf.jpg';
        
        const menuText = `
🤖 *WHATSAPP BOT v1.0*
━━━━━━━━━━━━━━━━━━━━
⚠️ *Bot dalam tahap pengembangan*
⚠️ *Beberapa fitur masih tidak bekerja sepenuhnya*
━━━━━━━━━━━━━━━━━━━━

*BASIC*
\`!ping\` \`!uptime\` \`!info\` \`!help\`

*UTILITY*
\`!afk [alasan]\` - Set AFK
\`!afk off\` - Nonaktifkan

*TODO*
\`!todo add [judul|tanggal|prioritas|desc]\`
\`!todo list\` \`!todo done [id]\` \`!todo delete [id]\`
\`!reminder\` - Cek reminder

*FUN*
\`!maki [nama]\` - Maki-maki
\`!neko\` - Random neko
\`!neko list\` - List kategori

*ADMIN (GRUP)*
\`!hidetag [pesan]\` - Tag all

*STICKER*
Kirim gambar/video + \`!sticker\`
\`!sticker <text>\` - Text to sticker

*DOWNLOAD*
\`!download [url]\` - TikTok/IG/YT
\`!ytmp3 [url]\` - YT to MP3

*YOUTUBE* 🎵
\`!play [nama lagu]\` - Cari & download
\`!song [url]\` - Download dari link
\`!yts [kata kunci]\` - Search YouTube
\`!altplay [url]\` - Alternative downloader

*FILE MANAGER* 📁
\`!filemgr status\` - Cek mode penyimpanan
\`!filemgr keep\` - Simpan file download
\`!filemgr nokeep\` - Hapus otomatis (default)
\`!filemgr list\` - Lihat file tersimpan

*AI CHATBOT* 🤖
\`!nekobot [pesan]\` - Chat dengan AI
\`!ai [pesan]\` - Alias untuk nekobot
\`!nekobot mood\` - Lihat mood bot
\`!nekobot reset\` - Reset percakapan
\`!nekobot stats\` - Lihat statistik

━━━━━━━━━━━━━━━━━━━━
💡 \`!help\` untuk detail lengkap
🙏 Terima kasih atas pengertiannya
`;

        // Try to send with image first
        try {
            console.log('📥 Downloading menu image...');
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const imageBuffer = Buffer.from(response.data, 'binary');
            const base64Image = imageBuffer.toString('base64');
            const media = new MessageMedia('image/jpeg', base64Image, 'menu.jpg');
            
            // Kirim gambar dengan caption (HANYA INI)
            await message.reply(media, undefined, { caption: menuText });
            console.log(`✅ Menu dengan gambar berhasil ditampilkan untuk ${message.from}`);
        } catch (imageError) {
            // Jika gagal download/kirim gambar, fallback ke text saja
            console.warn('⚠️ Gagal kirim dengan gambar, fallback ke text:', imageError.message);
            await message.reply(menuText);
            console.log(`✅ Menu (text only) berhasil ditampilkan untuk ${message.from}`);
        }
            
    } catch (error) {
        console.error('Error executing menu command:', error);
        await message.reply('❌ Terjadi kesalahan saat menampilkan menu.\n\n💡 Coba lagi dengan !help');
    }
}

module.exports = menuCommand;
