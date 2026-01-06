const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const { isOwner } = require('./exec');

/**
 * Command Menu
 * Fungsi untuk menampilkan daftar semua command yang tersedia
 * Berbeda untuk owner dan user biasa
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function menuCommand(client, message) {
    try {
        const sender = message.author || message.from;
        const isUserOwner = isOwner(sender);
        
        // URL gambar tersembunyi - akan ditampilkan sebagai thumbnail menu
        const imageUrl = 'https://i.pinimg.com/736x/62/71/21/627121c616927469a5afe87589f779bf.jpg';
        
        // Menu untuk USER BIASA
        const userMenuText = `
🤖 *WHATSAPP BOT v1.0*
━━━━━━━━━━━━━━━━━━━━
⚠️ *Bot dalam tahap pengembangan*
⚠️ *Beberapa fitur masih tidak bekerja sepenuhnya*
━━━━━━━━━━━━━━━━━━━━

*BASIC*
\`!ping\` \`!uptime\` \`!info\` \`!help\` \`!myid\` \`!developer\`

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
\`!quote\` - 💬 Random quote inspiratif
\`!quotesimage\` - 🎨 Quote dalam bentuk image
\`!faktaunik\` - 💡 Random fakta unik
\`!bucin\` - 💕 Kata-kata bucin/romantis

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

*LOLHUMAN API* ✨
\`!qrcode [text]\` - Generate QR Code
\`!pinterest [query]\` - Cari gambar Pinterest
\`!pixiv [tag]\` - 🎨 Cari gambar Pixiv (⚠️ bisa NSFW)
\`!wallpaper [keyword]\` - 🖼️ Search wallpaper HD
\`!texteffect [style] [text]\` - 🎨 Text to image effect
\`!stalkig [username]\` - Stalk profil Instagram
\`!quote\` - Random quote inspiratif
\`!chord [judul]\` - Cari chord gitar
\`!character [nama]\` - Cari anime character
\`!wait [url_gambar]\` - Cari anime dari gambar
\`!asmaulhusna [nomor]\` - 99 Nama Allah

*NSFW CONTENT* 🔞
⚠️ *PERINGATAN: Konten Dewasa 18+*
⚠️ *Wajib verifikasi oleh developer*

📝 *Cara Akses NSFW:*
1. Daftar: \`!daftar [nama lengkap]\`
2. Tunggu approval dari developer
3. Setelah diapprove, akses semua fitur NSFW

🔞 *NSFW Commands:*
\`!nhsearch [keyword]\` - 🔎 Search nhentai doujin
\`!nhentai [kode]\` - 💣 Info detail kode nuklir
\`!danbooru [tag]\` - 🎨 Random anime image
\`!nekopoi [url]\` - 🎬 Nekopoi downloader

⚠️ *Disclaimer:*
Bot tidak bertanggung jawab atas penyalahgunaan fitur NSFW.
Pengguna wajib berusia 18+ dan bertanggung jawab penuh.

━━━━━━━━━━━━━━━━━━━━
💡 \`!help\` untuk detail lengkap
🙏 Terima kasih telah menggunakan bot
`;

        // Menu untuk OWNER/DEVELOPER
        const ownerMenuText = `
🤖 *WHATSAPP BOT v1.0*
━━━━━━━━━━━━━━━━━━━━
👑 *DEVELOPER MODE*
━━━━━━━━━━━━━━━━━━━━

*BASIC*
\`!ping\` \`!uptime\` \`!info\` \`!help\` \`!myid\` \`!developer\`

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
\`!quote\` - 💬 Random quote inspiratif
\`!quotesimage\` - 🎨 Quote dalam bentuk image
\`!faktaunik\` - 💡 Random fakta unik
\`!bucin\` - 💕 Kata-kata bucin/romantis

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

*LOLHUMAN API* ✨
\`!qrcode [text]\` - Generate QR Code
\`!pinterest [query]\` - Cari gambar Pinterest
\`!pixiv [tag]\` - 🎨 Cari gambar Pixiv (⚠️ bisa NSFW)
\`!wallpaper [keyword]\` - 🖼️ Search wallpaper HD
\`!texteffect [style] [text]\` - 🎨 Text to image effect
\`!stalkig [username]\` - Stalk profil Instagram
\`!quote\` - Random quote inspiratif
\`!chord [judul]\` - Cari chord gitar
\`!character [nama]\` - Cari anime character
\`!wait [url_gambar]\` - Cari anime dari gambar
\`!asmaulhusna [nomor]\` - 99 Nama Allah

*NSFW CONTENT* 🔞
\`!nhsearch [keyword]\` - Search nhentai doujin
\`!nhentai [kode]\` - Info detail kode nuklir
\`!danbooru [tag]\` - Random anime image
\`!nekopoi [url]\` - Nekopoi downloader

👤 *NSFW User Management:*
\`!daftar [nama]\` - Registrasi akses NSFW
\`!verify approve @user\` - Approve user
\`!verify reject @user [reason]\` - Reject user
\`!verify pending\` - Lihat pending list
\`!verify remove @user\` - Hapus dari approved
\`!nsfwlist stats\` - Statistik users
\`!nsfwlist approved\` - List approved users
\`!nsfwlist pending\` - List pending users
\`!nsfwlist rejected\` - List rejected users

━━━━━━━━━━━━━━━━━━━━

*BAN MANAGEMENT* 🚫
👨‍💼 *Developer Only - User Control*

\`!ban @user [reason]\` - Ban user dari bot
\`!ban <user_id> [reason]\` - Ban dengan ID
\`!unban @user\` - Unban user
\`!unban <user_id>\` - Unban dengan ID
\`!banlist\` - Lihat semua banned users

⚠️ User yang di-ban tidak bisa akses *SEMUA* fitur bot!

━━━━━━━━━━━━━━━━━━━━

*TERMINAL & SYSTEM CONTROL* 💻
👑 *Owner Only - Advanced Features*

*Terminal Execution:*
\`!exec [command]\` - Execute terminal command
\`!exec ls -la\` - List files
\`!exec npm install\` - Install packages
\`!exec pwd\` - Current directory

*Git Operations:*
\`!git pull\` - Smart pull (auto-handle conflicts)
\`!git status\` - Check repository status
\`!git log [count]\` - View commit history (default 5)

*Bot Control:*
\`!bot stop\` - Put bot in sleep mode
\`!bot start\` - Wake up bot from sleep
\`!bot status\` - Check bot status & uptime

*Process Control:*
\`!restart\` - Quick restart (auto-detect PM2/local)
\`!pm2 status\` - Check all PM2 processes
\`!pm2 restart [name]\` - Restart specific process
\`!pm2 stop [name]\` - Stop process
\`!pm2 start [name]\` - Start process

*Local Development:*
Run with: \`start.bat\` (Windows) or \`bash start.sh\` (Linux)
This enables auto-restart on \`!restart\` command

⚠️ *Sleep Mode:*
• Bot akan ignore semua command dari user biasa
• Hanya owner yang bisa menggunakan bot
• Gunakan untuk maintenance atau update

💡 *Workflow Update & Restart:*
1. \`!git pull\` - Pull latest code
2. \`!exec npm install\` - Install dependencies
3. \`!restart\` - Restart bot

⚠️ *Warning:*
Be careful with terminal commands!
Commands are executed with bot's permissions.

━━━━━━━━━━━━━━━━━━━━
💡 \`!help\` untuk detail lengkap
👑 Developer Mode Active
`;

        // Pilih menu berdasarkan role
        const menuText = isUserOwner ? ownerMenuText : userMenuText;

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
            
            if (isUserOwner) {
                console.log(`✅ Menu OWNER dengan gambar berhasil ditampilkan untuk ${message.from}`);
            } else {
                console.log(`✅ Menu USER dengan gambar berhasil ditampilkan untuk ${message.from}`);
            }
        } catch (imageError) {
            // Jika gagal download/kirim gambar, fallback ke text saja
            console.warn('⚠️ Gagal kirim dengan gambar, fallback ke text:', imageError.message);
            await message.reply(menuText);
            
            if (isUserOwner) {
                console.log(`✅ Menu OWNER (text only) berhasil ditampilkan untuk ${message.from}`);
            } else {
                console.log(`✅ Menu USER (text only) berhasil ditampilkan untuk ${message.from}`);
            }
        }
            
    } catch (error) {
        console.error('Error executing menu command:', error);
        await message.reply('❌ Terjadi kesalahan saat menampilkan menu.\n\n💡 Coba lagi dengan !help');
    }
}

module.exports = menuCommand;
