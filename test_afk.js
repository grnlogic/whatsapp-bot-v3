/**
 * Test File untuk Fitur AFK
 * File ini menjelaskan cara penggunaan fitur AFK
 */

// ============================================
// CONTOH PENGGUNAAN FITUR AFK
// ============================================

/**
 * SCENARIO 1: User mengaktifkan AFK
 * -----------------------------------
 * User mengirim: !afk Sedang makan siang
 * 
 * Bot membalas:
 * 🌙 *AFK Mode Diaktifkan*
 * 
 * 📝 Alasan: Sedang makan siang
 * 🕒 Waktu: 05/11/2025 14:30:00
 * 
 * 💡 Bot akan membalas otomatis jika kamu di-tag atau dipanggil.
 * Kirim pesan apa saja untuk menonaktifkan AFK.
 */

/**
 * SCENARIO 2: Seseorang mention user yang AFK di grup
 * ----------------------------------------------------
 * User A (yang AFK): sudah set !afk Sedang meeting
 * User B: @UserA halo, ada info?
 * 
 * Bot otomatis membalas:
 * 💤 *User sedang AFK*
 * 
 * 👤 User: @628xxx
 * 📝 Alasan: Sedang meeting
 * ⏱️ Sudah AFK selama: 15 menit, 30 detik
 * 🕒 Sejak: 05/11/2025 14:15:00
 */

/**
 * SCENARIO 3: Seseorang reply pesan user yang AFK
 * ------------------------------------------------
 * User A (yang AFK): sudah set !afk Istirahat sebentar
 * User B: [membalas pesan User A] Halo kak
 * 
 * Bot otomatis membalas:
 * 💤 *User sedang AFK*
 * 
 * 👤 User: @628xxx
 * 📝 Alasan: Istirahat sebentar
 * ⏱️ Sudah AFK selama: 5 menit, 10 detik
 * 🕒 Sejak: 05/11/2025 14:25:00
 */

/**
 * SCENARIO 4: User AFK kembali aktif (mengirim pesan)
 * ----------------------------------------------------
 * User A (yang AFK): [mengirim pesan apa saja]
 * 
 * Bot otomatis membalas:
 * 👋 *Welcome Back!*
 * 
 * @628xxx sudah tidak AFK lagi!
 * 
 * ⏱️ Durasi AFK: 1 jam, 25 menit, 15 detik
 * 🕒 Sejak: 05/11/2025 13:05:00
 * 📝 Alasan sebelumnya: Sedang meeting
 */

/**
 * SCENARIO 5: User menonaktifkan AFK secara manual
 * -------------------------------------------------
 * User mengirim: !afk off
 * 
 * Bot membalas:
 * ✅ *AFK Mode Dinonaktifkan*
 * 
 * ⏱️ Kamu sudah AFK selama: 30 menit, 45 detik
 * 🕒 Sejak: 05/11/2025 14:00:00
 */

/**
 * SCENARIO 6: User mencoba nonaktifkan AFK padahal tidak AFK
 * -----------------------------------------------------------
 * User mengirim: !afk off
 * (tapi user tidak sedang AFK)
 * 
 * Bot membalas:
 * ❌ Kamu tidak sedang AFK!
 */

/**
 * SCENARIO 7: AFK tanpa alasan
 * ----------------------------
 * User mengirim: !afk
 * 
 * Bot membalas:
 * 🌙 *AFK Mode Diaktifkan*
 * 
 * 📝 Alasan: Tidak ada alasan
 * 🕒 Waktu: 05/11/2025 14:30:00
 * 
 * 💡 Bot akan membalas otomatis jika kamu di-tag atau dipanggil.
 * Kirim pesan apa saja untuk menonaktifkan AFK.
 */

// ============================================
// COMMAND VARIATIONS
// ============================================

// Mengaktifkan AFK:
// !afk [alasan]
// !away [alasan]

// Menonaktifkan AFK:
// !afk off
// !afk disable
// !away off
// !away disable

// Atau otomatis dengan mengirim pesan apa saja

// ============================================
// FITUR UTAMA
// ============================================

/**
 * 1. AUTO-REPLY saat di-tag/mention di grup
 *    - Bot akan otomatis memberitahu bahwa user sedang AFK
 *    - Menampilkan alasan dan durasi AFK
 * 
 * 2. AUTO-REPLY saat pesan di-reply
 *    - Bot akan otomatis memberitahu bahwa user sedang AFK
 *    - Menampilkan alasan dan durasi AFK
 * 
 * 3. AUTO-DETECT aktif kembali
 *    - Saat user AFK mengirim pesan, bot otomatis menonaktifkan AFK
 *    - Menampilkan notifikasi welcome back dengan durasi total AFK
 * 
 * 4. FORMAT WAKTU INDONESIA
 *    - Timezone: Asia/Jakarta (WIB)
 *    - Format: DD/MM/YYYY HH:mm:ss
 * 
 * 5. FORMAT DURASI
 *    - Jam, menit, detik
 *    - Otomatis menyesuaikan (tidak menampilkan 0 jam)
 */

// ============================================
// TECHNICAL NOTES
// ============================================

/**
 * Storage: In-memory (Map)
 * - Data akan hilang saat bot restart
 * - Setiap user hanya bisa memiliki 1 status AFK
 * 
 * Dependencies:
 * - moment-timezone: untuk format waktu
 * - whatsapp-web.js: untuk WhatsApp API
 * 
 * Database Structure:
 * Map<userNumber, {
 *   reason: string,
 *   timestamp: number,
 *   timeString: string
 * }>
 */

console.log('📖 Test file untuk fitur AFK');
console.log('Lihat kode di atas untuk contoh penggunaan lengkap');
