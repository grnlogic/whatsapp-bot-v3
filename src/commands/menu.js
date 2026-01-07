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
        
        // Menu untuk USER BIASA
        const userMenuText = `
*╔═══「 USER INFORMATION 」*
*║* Nama     : ${message._data.notifyName || 'User'}
*║* Status   : Regular User
*║* Access   : Public Commands
*╚════════════════════*

🤖 *WHATSAPP BOT v1.0*
⚠️ *Bot dalam tahap pengembangan*

*╔═══「 BASIC COMMANDS 」*
*║* ➸ !ping
*║* ➸ !uptime
*║* ➸ !info
*║* ➸ !help
*║* ➸ !myid
*║* ➸ !developer
*║*
*╠═══「 UTILITY TOOLS 」*
*║* ➸ !afk [alasan]
*║* ➸ !afk off
*║*
*╠═══「 TODO & REMINDER 」*
*║* ➸ !todo add [judul|tanggal|prioritas|desc]
*║* ➸ !todo list
*║* ➸ !todo done [id]
*║* ➸ !todo delete [id]
*║* ➸ !reminder
*║*
*╠═══「 FUN & ENTERTAINMENT 」*
*║* ➸ !maki [nama]
*║* ➸ !neko
*║* ➸ !neko list
*║* ➸ !quote
*║* ➸ !quotesimage
*║* ➸ !faktaunik
*║* ➸ !bucin
*║*
*╠═══「 STICKER MAKER 」*
*║* ➸ !sticker (reply gambar/video)
*║* ➸ !sticker [text]
*║*
*╠═══「 DOWNLOAD CENTER 」*
*║* ➸ !download [url]
*║* ➸ !ytmp3 [url]
*║* ➸ !facebook [url]
*║* ➸ !instagram [url]
*║* ➸ !tiktok [url]
*║* ➸ !twitter [url]
*║*
*╠═══「 YOUTUBE TOOLS 」*
*║* ➸ !play [nama lagu]
*║* ➸ !song [url]
*║* ➸ !yts [kata kunci]
*║* ➸ !altplay [url]
*║*
*╠═══「 FILE MANAGER 」*
*║* ➸ !filemgr status
*║* ➸ !filemgr keep
*║* ➸ !filemgr nokeep
*║* ➸ !filemgr list
*║*
*╠═══「 ANIME & MANGA 」*
*║* ➸ !animesearch [judul]
*║* ➸ !animedetail [id]
*║* ➸ !animequote
*║* ➸ !randomanime
*║* ➸ !character [nama]
*║* ➸ !wait [url_gambar]
*║*
*╠═══「 LOLHUMAN API 」*
*║* ➸ !qrcode [text]
*║* ➸ !pinterest [query]
*║* ➸ !pixiv [tag]
*║* ➸ !wallpaper [keyword]
*║* ➸ !texteffect [style] [text]
*║* ➸ !stalkig [username]
*║* ➸ !chord [judul]
*║* ➸ !lyrics [judul]
*║*
*╠═══「 INFORMASI 」*
*║* ➸ !jadwalsholat [kota]
*║* ➸ !asmaulhusna [nomor]
*║* ➸ !listsurah
*║* ➸ !quran [surah]:[ayat]
*║* ➸ !jadwaltv [channel]
*║* ➸ !kbbi [kata]
*║* ➸ !weather [kota]
*║* ➸ !wikipedia [query]
*║*
*╠═══「 IMAGE TOOLS 」*
*║* ➸ !avatar [text]
*║* ➸ !logo [style] [text]
*║* ➸ !meme
*║* ➸ !shortlink [url]
*║*
*╠═══「 ADMIN GROUP 」*
*║* ➸ !hidetag [pesan]
*║* ➸ !delete (reply pesan bot)
*║*
*╠═══「 NSFW CONTENT 」* 🔞
*║* ⚠️ *PERINGATAN: Konten Dewasa 18+*
*║* ⚠️ *Wajib verifikasi oleh developer*
*║*
*║* 📝 *Cara Akses NSFW:*
*║* 1️⃣ Daftar: !daftar [nama lengkap]
*║* 2️⃣ Tunggu approval dari developer
*║* 3️⃣ Akses semua fitur NSFW
*║*
*║* 🔞 *NSFW Commands:*
*║* ➸ !nhsearch [keyword]
*║* ➸ !nhentai [kode]
*║* ➸ !danbooru [tag]
*║* ➸ !nekopoi [url]
*║*
*╚═══▼△▼△▼△▼△▼*

💡 Gunakan !help untuk detail lengkap
🙏 Terima kasih telah menggunakan bot
`;

        // Menu untuk OWNER/DEVELOPER
        const ownerMenuText = `
*╔═══「 USER INFORMATION 」*
*║* Nama     : ${message._data.notifyName || 'Developer'}
*║* Status   : 👑 *DEVELOPER*
*║* Access   : Full Access + Admin Tools
*╚════════════════════*

🤖 *WHATSAPP BOT v1.0*
👑 *DEVELOPER MODE ACTIVE*

*╔═══「 BASIC COMMANDS 」*
*║* ➸ !ping
*║* ➸ !uptime
*║* ➸ !info
*║* ➸ !help
*║* ➸ !myid
*║* ➸ !developer
*║*
*╠═══「 UTILITY TOOLS 」*
*║* ➸ !afk [alasan]
*║* ➸ !afk off
*║*
*╠═══「 TODO & REMINDER 」*
*║* ➸ !todo add [judul|tanggal|prioritas|desc]
*║* ➸ !todo list
*║* ➸ !todo done [id]
*║* ➸ !todo delete [id]
*║* ➸ !reminder
*║*
*╠═══「 FUN & ENTERTAINMENT 」*
*║* ➸ !maki [nama]
*║* ➸ !neko
*║* ➸ !neko list
*║* ➸ !quote
*║* ➸ !quotesimage
*║* ➸ !faktaunik
*║* ➸ !bucin
*║*
*╠═══「 STICKER MAKER 」*
*║* ➸ !sticker (reply gambar/video)
*║* ➸ !sticker [text]
*║*
*╠═══「 DOWNLOAD CENTER 」*
*║* ➸ !download [url]
*║* ➸ !ytmp3 [url]
*║* ➸ !facebook [url]
*║* ➸ !instagram [url]
*║* ➸ !tiktok [url]
*║* ➸ !twitter [url]
*║*
*╠═══「 YOUTUBE TOOLS 」*
*║* ➸ !play [nama lagu]
*║* ➸ !song [url]
*║* ➸ !yts [kata kunci]
*║* ➸ !altplay [url]
*║*
*╠═══「 FILE MANAGER 」*
*║* ➸ !filemgr status
*║* ➸ !filemgr keep
*║* ➸ !filemgr nokeep
*║* ➸ !filemgr list
*║*
*╠═══「 ANIME & MANGA 」*
*║* ➸ !animesearch [judul]
*║* ➸ !animedetail [id]
*║* ➸ !animequote
*║* ➸ !randomanime
*║* ➸ !character [nama]
*║* ➸ !wait [url_gambar]
*║*
*╠═══「 LOLHUMAN API 」*
*║* ➸ !qrcode [text]
*║* ➸ !pinterest [query]
*║* ➸ !pixiv [tag]
*║* ➸ !wallpaper [keyword]
*║* ➸ !texteffect [style] [text]
*║* ➸ !stalkig [username]
*║* ➸ !chord [judul]
*║* ➸ !lyrics [judul]
*║*
*╠═══「 INFORMASI 」*
*║* ➸ !jadwalsholat [kota]
*║* ➸ !asmaulhusna [nomor]
*║* ➸ !listsurah
*║* ➸ !quran [surah]:[ayat]
*║* ➸ !jadwaltv [channel]
*║* ➸ !kbbi [kata]
*║* ➸ !weather [kota]
*║* ➸ !wikipedia [query]
*║*
*╠═══「 IMAGE TOOLS 」*
*║* ➸ !avatar [text]
*║* ➸ !logo [style] [text]
*║* ➸ !meme
*║* ➸ !shortlink [url]
*║*
*╠═══「 ADMIN GROUP 」*
*║* ➸ !hidetag [pesan]
*║* ➸ !delete (reply pesan bot)
*║*
*╠═══「 NSFW CONTENT 」* 🔞
*║* ➸ !nhsearch [keyword]
*║* ➸ !nhentai [kode]
*║* ➸ !danbooru [tag]
*║* ➸ !nekopoi [url]
*║*
*╠═══「 NSFW USER MANAGEMENT 」*
*║* ➸ !daftar [nama]
*║* ➸ !verify approve @user
*║* ➸ !verify reject @user [reason]
*║* ➸ !verify pending
*║* ➸ !verify remove @user
*║* ➸ !nsfwlist stats
*║* ➸ !nsfwlist approved
*║* ➸ !nsfwlist pending
*║* ➸ !nsfwlist rejected
*║*
*╠═══「 BAN MANAGEMENT 」* 🚫
*║* ➸ !ban @user [reason]
*║* ➸ !ban <user_id> [reason]
*║* ➸ !unban @user
*║* ➸ !unban <user_id>
*║* ➸ !banlist
*║*
*╠═══「 TERMINAL CONTROL 」* 💻
*║* ➸ !exec [command]
*║* ➸ !exec ls -la
*║* ➸ !exec npm install
*║* ➸ !exec pwd
*║*
*╠═══「 GIT OPERATIONS 」*
*║* ➸ !git pull
*║* ➸ !git status
*║* ➸ !git log [count]
*║*
*╠═══「 BOT CONTROL 」*
*║* ➸ !bot stop
*║* ➸ !bot start
*║* ➸ !bot status
*║*
*╠═══「 PROCESS CONTROL 」*
*║* ➸ !restart
*║* ➸ !pm2 status
*║* ➸ !pm2 restart [name]
*║* ➸ !pm2 stop [name]
*║* ➸ !pm2 start [name]
*║*
*╚═══▼△▼△▼△▼△▼*

💡 *Workflow Update & Restart:*
1️⃣ !git pull - Pull latest code
2️⃣ !exec npm install - Install dependencies
3️⃣ !restart - Restart bot

⚠️ *Warning:*
Be careful with terminal commands!
Commands are executed with bot's permissions.

👑 Full Developer Access Active
`;

        // Pilih menu berdasarkan role
        const menuText = isUserOwner ? ownerMenuText : userMenuText;

        // Try to send with bot's profile picture
        try {
            console.log('📸 Getting bot profile picture...');
            
            // Get bot's own profile picture
            const botNumber = client.info.wid._serialized;
            const profilePicUrl = await client.getProfilePicUrl(botNumber);
            
            if (profilePicUrl) {
                const response = await axios.get(profilePicUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const imageBuffer = Buffer.from(response.data, 'binary');
                const base64Image = imageBuffer.toString('base64');
                const media = new MessageMedia('image/jpeg', base64Image, 'profile.jpg');
                
                // Kirim gambar dengan caption
                await message.reply(media, undefined, { caption: menuText });
                
                if (isUserOwner) {
                    console.log(`✅ Menu OWNER dengan PP bot berhasil ditampilkan untuk ${message.from}`);
                } else {
                    console.log(`✅ Menu USER dengan PP bot berhasil ditampilkan untuk ${message.from}`);
                }
            } else {
                throw new Error('No profile picture found');
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
