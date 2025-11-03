/**
 * Command Menu
 * Fungsi untuk menampilkan daftar semua command yang tersedia
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function menuCommand(client, message) {
    try {
        const menuText = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃  🤖 *WHATSAPP BOT*  ┃
┃     *MENU UTAMA*     ┃
┗━━━━━━━━━━━━━━━━━━━━┛

👋 Halo! Saya adalah bot WhatsApp yang siap membantu Anda.

╔═══════════════════════
║ 📌 *BASIC COMMANDS*
╚═══════════════════════

🏓 *!ping*
   Cek latency & status bot

⏱️ *!uptime*
   Lihat waktu hidup bot & info sistem

� *!info*
   Informasi lengkap sistem & bot

�📋 *!menu*
   Tampilkan menu ini

❓ *!help*
   Bantuan lengkap

╔═══════════════════════
║ ✅ *TODO & TASK MANAGER*
╚═══════════════════════

📝 *Menambah Task:*
!todo add [judul] | [tanggal] | [prioritas] | [deskripsi]

Contoh:
!todo add Meeting | 2025-11-01 | high | Presentasi

📋 *Melihat Task:*
!todo list        - Semua task
!todo pending     - Task belum selesai
!todo overdue     - Task terlambat
!todo detail [id] - Detail task

✏️ *Mengelola Task:*
!todo done [id]   - Tandai selesai
!todo delete [id] - Hapus task
!todo edit [id] | [field] | [value] - Edit task

📚 *Info Todo:*
!todo help - Panduan lengkap todo

╔═══════════════════════
║ 🔔 *REMINDER*
╚═══════════════════════

🔔 *!reminder*
   Cek task mendatang (3 hari ke depan)

⏰ *Auto Reminder:*
   Bot akan otomatis mengirim reminder:
   • Jam 08:00 - Reminder pagi
   • Jam 12:00 - Reminder siang
   • Jam 18:00 - Reminder sore

╔═══════════════════════
║ 🔥 *MAKI-MAKI (FUN)*
╚═══════════════════════

🤣 *!maki [nama]*
   Maki-maki/ejek teman dengan lucu
   Contoh: !maki Nabil
   
🏷️ *!maki @mention*
   Tag orang dan bot akan tag balik!
   Contoh: !maki @Nabil

📊 *!maki stats*
   Lihat statistik makian

🔄 *!maki reset*
   Reset history makian

*Fitur:*
• 70+ variasi makian lucu
• Support mention/tag otomatis 🏷️
• Anti-duplicate (tidak keluar berturut-turut)
• Random system
• Progress tracking

╔═══════════════════════
║ 🐱 *NEKO (ANIME)*
╚═══════════════════════

🐱 *!neko*
   Kirim neko random
   
🎬 *!neko [kategori]*
   Kirim gambar/GIF dari kategori
   Contoh: !neko hug, !neko pat, !neko waifu
   
📋 *!neko list*
   Lihat semua kategori (46 kategori!)
   
💡 *!neko help*
   Bantuan lengkap

*Fitur:*
• 4 kategori gambar (PNG) 🖼️
• 42 kategori GIF animasi 🎬
• Kualitas tinggi & lucu
• Info artist/anime name
• Random selection

*Kategori Populer:*
hug, pat, kiss, cuddle, happy, smile, 
wink, cry, angry, sleep, dance, waifu

╔═══════════════════════
║ 👥 *HIDETAG (ADMIN)*
╚═══════════════════════

📢 *!hidetag [pesan]*
   Tag semua member (hidden)
   Contoh: !hidetag Halo semua!
   
🔁 *Reply + !hidetag*
   Bot kirim ulang pesan yang di-reply
   + tag semua member (hidden)
   
🏷️ *!tagall [pesan]*
   Alias untuk hidetag
   
*Fitur:*
• Tag semua member grup 👥
• Mention tersembunyi 🔇
• Support reply message 🔁
• Khusus admin grup 👑
• Untuk pengumuman penting 📢

*Cara Pakai:*
1. !hidetag Pesan anda
2. Reply pesan + !hidetag (kirim ulang)

*Catatan:*
⚠️ Hanya admin yang bisa pakai
⚠️ Hanya bisa di grup

╔═══════════════════════
║ � *STICKER MAKER*
╚═══════════════════════

🖼️ *!sticker [gambar]*
   Kirim gambar dengan caption !sticker
   atau reply gambar dengan !sticker
   
🎬 *!sticker [video]*
   Kirim video (max 10 detik) dengan !sticker
   atau reply video dengan !sticker
   
✍️ *!sticker [text]*
   Buat sticker dari text
   Contoh: !sticker Halo Dunia!
   
🔤 *Alias:*
   !s, !stiker, !stik
   
*Fitur:*
• Image to sticker 🖼️
• Video to animated sticker 🎬
• Text to sticker ✍️
• Auto resize & optimize
• Support reply message
• High quality output

*Cara Pakai:*
1. Kirim gambar + caption !sticker
2. Reply gambar/video + !sticker
3. !sticker <text anda>

╔═══════════════════════
║ �🎯 *PRIORITAS TASK*
╚═══════════════════════

🟢 *low* - Prioritas rendah
🟡 *medium* - Prioritas sedang
🟠 *high* - Prioritas tinggi
🔴 *urgent* - Sangat mendesak

╔═══════════════════════
║ ℹ️ *INFO*
╚═══════════════════════

📅 Format Tanggal: YYYY-MM-DD
   Contoh: 2025-11-01

⚙️ Prefix: !
   Semua command dimulai dengan tanda !

━━━━━━━━━━━━━━━━━━━━

💡 *Tips:*
• Gunakan !todo help untuk panduan detail
• Bot akan reminder otomatis H-1 & H-0
• Data tersimpan otomatis, tidak hilang

🔗 *Bantuan:*
Ketik !help untuk bantuan lebih lanjut

━━━━━━━━━━━━━━━━━━━━
Bot WhatsApp v1.0 🤖
`;

        await message.reply(menuText);
        
        console.log(`✅ Menu berhasil ditampilkan untuk ${message.from}`);
    } catch (error) {
        console.error('Error executing menu command:', error);
        await message.reply('❌ Terjadi kesalahan saat menampilkan menu.');
    }
}

module.exports = menuCommand;
