const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

/**
 * Command Help
 * Fungsi untuk menampilkan bantuan lengkap
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function helpCommand(client, message) {
    try {
        // URL gambar tersembunyi - sama dengan menu
        const imageUrl = 'https://i.pinimg.com/736x/62/71/21/627121c616927469a5afe87589f779bf.jpg';
        
        const helpText = `
╔══════════════════════╗
║  📖 *HELP & GUIDE*  ║
╚══════════════════════╝

⚠️ *BOT DALAM PENGEMBANGAN*
Beberapa fitur mungkin mengalami bug atau belum berfungsi sempurna. Terima kasih atas pengertiannya! 🙏

*🎯 CARA MENGGUNAKAN*
• Semua command dimulai dengan \`!\`
• Ketik \`!menu\` untuk lihat semua command
• Ketik \`!ping\` untuk cek status bot

━━━━━━━━━━━━━━━━━━━━

*📋 TODO TUTORIAL*

*1️⃣ Tambah Task:*
\`!todo add Belajar | 2025-11-10 | high | Deskripsi\`

*2️⃣ Lihat Task:*
\`!todo list\` - Semua task
\`!todo pending\` - Task belum selesai
\`!todo overdue\` - Task terlambat

*3️⃣ Edit Task:*
\`!todo edit [id] | [field] | [value]\`

*4️⃣ Selesaikan Task:*
\`!todo done [id]\`

━━━━━━━━━━━━━━━━━━━━

*🔔 REMINDER*
Bot otomatis kirim reminder:
• H-1 & H-0 sebelum deadline
• Jam 08:00, 12:00, 18:00

━━━━━━━━━━━━━━━━━━━━

*🎨 STICKER MAKER*
1. Kirim gambar + \`!sticker\`
2. Kirim video + \`!sticker\`
3. \`!sticker <text>\` - Text to sticker

*Alias:* \`!s\`, \`!stiker\`, \`!stik\`

━━━━━━━━━━━━━━━━━━━━

*📥 DOWNLOAD MEDIA*

*TikTok/Instagram/YouTube:*
\`!download [url]\`
\`!dl [url]\`

*YouTube MP3:*
\`!ytmp3 [url]\`
\`!mp3 [url]\`

*Platform:* TikTok, Instagram, YouTube
*Fitur:* No watermark, HD quality

━━━━━━━━━━━━━━━━━━━━

*🐱 NEKO (ANIME)*
\`!neko\` - Random neko
\`!neko [kategori]\` - Kategori tertentu
\`!neko list\` - Lihat semua kategori

*Populer:* hug, pat, kiss, waifu, smile

━━━━━━━━━━━━━━━━━━━━

*🔥 MAKI-MAKI (FUN)*
\`!maki [nama]\` - Maki teman
\`!maki @mention\` - Maki dengan tag
\`!maki stats\` - Statistik
\`!maki reset\` - Reset history

━━━━━━━━━━━━━━━━━━━━

*👥 HIDETAG (ADMIN)*
\`!hidetag [pesan]\` - Tag semua member
\`!tagall [pesan]\` - Alias hidetag

⚠️ Khusus admin grup
⚠️ Mention tersembunyi

━━━━━━━━━━━━━━━━━━━━

*❓ FAQ*

Q: Data hilang saat restart?
A: Tidak, semua tersimpan di JSON

Q: Cara edit task?
A: \`!todo edit [id] | field | value\`

Q: Lihat task terlambat?
A: \`!todo overdue\`

━━━━━━━━━━━━━━━━━━━━

*💡 TIPS*
✅ Pakai \`!todo help\` untuk detail todo
✅ Auto reminder H-1 & H-0
✅ Data tersimpan otomatis
✅ \`!menu\` untuk lihat semua command

━━━━━━━━━━━━━━━━━━━━

*🆘 DAFTAR COMMAND*
\`!menu\` \`!help\` \`!ping\` \`!uptime\` \`!info\`
\`!todo\` \`!reminder\` \`!maki\` \`!neko\`
\`!hidetag\` \`!sticker\` \`!download\` \`!ytmp3\`

━━━━━━━━━━━━━━━━━━━━
🤖 *WhatsApp Bot v1.0*
⚠️ *Beta - Dalam Pengembangan*
`;

        // Try to send with image first
        try {
            console.log('📥 Downloading help image...');
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const imageBuffer = Buffer.from(response.data, 'binary');
            const base64Image = imageBuffer.toString('base64');
            const media = new MessageMedia('image/jpeg', base64Image, 'help.jpg');
            
            // Kirim gambar dengan caption (HANYA INI)
            await message.reply(media, undefined, { caption: helpText });
            console.log(`✅ Help dengan gambar berhasil ditampilkan untuk ${message.from}`);
        } catch (imageError) {
            // Jika gagal download/kirim gambar, fallback ke text saja
            console.warn('⚠️ Gagal kirim dengan gambar, fallback ke text:', imageError.message);
            await message.reply(helpText);
            console.log(`✅ Help (text only) berhasil ditampilkan untuk ${message.from}`);
        }
        
    } catch (error) {
        console.error('Error executing help command:', error);
        await message.reply('❌ Terjadi kesalahan saat menampilkan help.\n\n💡 Coba lagi dengan !menu');
    }
}

module.exports = helpCommand;
