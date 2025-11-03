const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const commandHandler = require('./src/handlers/commandHandler');
const { initReminderScheduler } = require('./src/schedulers/reminderScheduler');
const os = require('os');

// Simpan waktu bot mulai (untuk filter pesan lama)
let botStartTime = null;
let skippedMessagesCount = 0;
let skippedMessagesTimer = null;

// Detect platform
const isTermux = os.platform() === 'android' || process.env.TERMUX_VERSION !== undefined;

// Konfigurasi Puppeteer berdasarkan platform
const puppeteerConfig = isTermux ? {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
    ],
    // Gunakan Chrome/Chromium yang sudah terinstall di Termux
    executablePath: process.env.CHROME_PATH || '/data/data/com.termux/files/usr/bin/chromium-browser'
} : {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

console.log('Platform:', os.platform());
console.log('Is Termux:', isTermux);
if (isTermux) {
    console.log('Chrome Path:', puppeteerConfig.executablePath);
}

// Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerConfig
});

// Event: QR Code untuk login
client.on('qr', (qr) => {
    console.log('Scan QR code di bawah ini untuk login:');
    qrcode.generate(qr, { small: true });
});

// Event: Client siap
client.on('ready', () => {
    console.log('✅ Bot WhatsApp siap digunakan!');
    console.log('Bot aktif pada:', new Date().toLocaleString('id-ID'));
    
    // Set waktu bot ready (untuk filter pesan lama)
    botStartTime = Date.now();
    console.log('🕐 Bot start timestamp:', botStartTime);
    
    // Inisialisasi reminder scheduler
    initReminderScheduler(client);
});

// Event: Autentikasi berhasil
client.on('authenticated', () => {
    console.log('✅ Autentikasi berhasil!');
});

// Event: Autentikasi gagal
client.on('auth_failure', (msg) => {
    console.error('❌ Autentikasi gagal:', msg);
});

// Event: Terputus dari WhatsApp
client.on('disconnected', (reason) => {
    console.log('⚠️ Bot terputus:', reason);
});

// Event: Menerima pesan
client.on('message', async (message) => {
    try {
        // Abaikan pesan dari bot sendiri
        if (message.fromMe) {
            return;
        }
        
        // Abaikan pesan dari status/broadcast
        if (message.from === 'status@broadcast') {
            return;
        }
        
        // Filter pesan lama (hanya proses pesan yang dikirim setelah bot ready)
        // Tambahkan buffer 5 detik untuk toleransi sinkronisasi
        const messageTimestamp = message.timestamp * 1000; // Convert ke milliseconds
        const bufferTime = 5000; // 5 detik buffer
        
        if (botStartTime && messageTimestamp < (botStartTime - bufferTime)) {
            skippedMessagesCount++;
            
            // Clear timer sebelumnya jika ada
            if (skippedMessagesTimer) {
                clearTimeout(skippedMessagesTimer);
            }
            
            // Set timer baru untuk menampilkan summary setelah 2 detik tidak ada pesan lama lagi
            skippedMessagesTimer = setTimeout(() => {
                if (skippedMessagesCount > 0) {
                    console.log(`\n✅ Successfully skipped ${skippedMessagesCount} old message(s)\n`);
                    skippedMessagesCount = 0;
                }
            }, 2000);
            
            return;
        }
        
        await commandHandler(client, message);
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Inisialisasi client
client.initialize();

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️ Menutup bot...');
    await client.destroy();
    process.exit(0);
});
