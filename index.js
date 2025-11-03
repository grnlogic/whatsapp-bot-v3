const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const commandHandler = require('./src/handlers/commandHandler');
const { initReminderScheduler } = require('./src/schedulers/reminderScheduler');

// Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
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
