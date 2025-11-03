/**
 * Command Help
 * Fungsi untuk menampilkan bantuan lengkap
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function helpCommand(client, message) {
    try {
        const helpText = `
📖 *PANDUAN LENGKAP BOT*

━━━━━━━━━━━━━━━━━━━━

🎯 *CARA MENGGUNAKAN:*

1️⃣ Semua command dimulai dengan !
2️⃣ Ketik !menu untuk melihat menu utama
3️⃣ Gunakan !ping untuk cek status bot

━━━━━━━━━━━━━━━━━━━━

📋 *TUTORIAL TODO LIST:*

*Step 1: Tambah Task*
!todo add Belajar Coding | 2025-11-01 | high | Belajar JavaScript

*Step 2: Lihat Task*
!todo list

*Step 3: Tandai Selesai*
!todo done 1

━━━━━━━━━━━━━━━━━━━━

🔧 *FORMAT COMMAND:*

*Todo Add:*
!todo add [judul] | [tanggal] | [prioritas] | [deskripsi]

• Judul: Wajib diisi
• Tanggal: Format YYYY-MM-DD (wajib)
• Prioritas: low/medium/high/urgent (opsional)
• Deskripsi: Keterangan tambahan (opsional)

*Todo Edit:*
!todo edit [id] | [field] | [value]

Field yang bisa diedit:
• title - Ubah judul
• deadline - Ubah tanggal (YYYY-MM-DD)
• priority - Ubah prioritas
• description - Ubah deskripsi

━━━━━━━━━━━━━━━━━━━━

🔔 *REMINDER OTOMATIS:*

Bot akan otomatis mengirim reminder:
• H-1 (1 hari sebelum deadline)
• H-0 (hari deadline)

Waktu pengiriman:
• 08:00 - Pagi
• 12:00 - Siang
• 18:00 - Sore

━━━━━━━━━━━━━━━━━━━━

❓ *FAQ (Pertanyaan Umum):*

Q: Bagaimana cara menambah task?
A: Gunakan !todo add [judul] | [tanggal] | [prioritas] | [deskripsi]

Q: Apakah data akan hilang jika bot restart?
A: Tidak, semua data tersimpan di file JSON

Q: Bagaimana cara melihat task yang terlambat?
A: Gunakan !todo overdue

Q: Bisa edit task yang sudah dibuat?
A: Bisa! Gunakan !todo edit [id] | [field] | [value]

━━━━━━━━━━━━━━━━━━━━

💡 *TIPS & TRIK:*

✅ Gunakan prioritas untuk mengatur task
✅ Set reminder H-1 akan membantu Anda
✅ Check !todo pending untuk fokus kerja
✅ Gunakan !reminder untuk cek cepat

━━━━━━━━━━━━━━━━━━━━

🆘 *BUTUH BANTUAN?*

• !menu - Lihat menu utama
• !ping - Cek status bot
• !uptime - Info sistem bot
• !todo help - Panduan todo detail

━━━━━━━━━━━━━━━━━━━━

Semoga membantu! 🎉
`;

        await message.reply(helpText);
        
        console.log(`✅ Help berhasil ditampilkan untuk ${message.from}`);
    } catch (error) {
        console.error('Error executing help command:', error);
        await message.reply('❌ Terjadi kesalahan saat menampilkan help.');
    }
}

module.exports = helpCommand;
