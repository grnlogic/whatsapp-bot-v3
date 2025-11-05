const moment = require('moment-timezone');

// Database AFK untuk menyimpan status
const afkDatabase = new Map();

// Fungsi untuk format durasi waktu
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = [];
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (secs > 0) result.push(`${secs} detik`);
    
    return result.length > 0 ? result.join(', ') : '0 detik';
}

// Fungsi untuk mendapatkan waktu sekarang
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}

module.exports = {
    name: 'afk',
    aliases: ['away'],
    category: 'utility',
    description: 'Set status AFK (Away From Keyboard) dengan alasan',
    usage: '.afk [alasan]\n.afk off - untuk menonaktifkan AFK',
    
    async execute(client, message, args) {
        try {
            const sender = message.author || message.from;
            const senderNumber = sender.split('@')[0];
            
            // Cek apakah user ingin menonaktifkan AFK
            if (args[0]?.toLowerCase() === 'off' || args[0]?.toLowerCase() === 'disable') {
                if (!afkDatabase.has(senderNumber)) {
                    return await message.reply('❌ Kamu tidak sedang AFK!');
                }
                
                const afkData = afkDatabase.get(senderNumber);
                const duration = getCurrentTimestamp() - afkData.timestamp;
                const formattedDuration = formatDuration(duration);
                
                afkDatabase.delete(senderNumber);
                
                return await message.reply(
                    `✅ *AFK Mode Dinonaktifkan*\n\n` +
                    `⏱️ Kamu sudah AFK selama: *${formattedDuration}*\n` +
                    `🕒 Sejak: ${afkData.timeString}`
                );
            }
            
            // Set AFK
            const reason = args.join(' ') || 'Tidak ada alasan';
            const timestamp = getCurrentTimestamp();
            const timeString = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss');
            
            afkDatabase.set(senderNumber, {
                reason: reason,
                timestamp: timestamp,
                timeString: timeString
            });
            
            await message.reply(
                `🌙 *AFK Mode Diaktifkan*\n\n` +
                `📝 Alasan: ${reason}\n` +
                `🕒 Waktu: ${timeString}\n\n` +
                `💡 Bot akan membalas otomatis jika kamu di-tag atau dipanggil.\n` +
                `Kirim pesan apa saja untuk menonaktifkan AFK.`
            );
        } catch (error) {
            console.error('Error in AFK execute:', error);
            await message.reply('❌ Terjadi kesalahan saat mengatur AFK.');
        }
    },
    
    // Handler untuk cek mention/tag
    async handleMention(client, message) {
        try {
            const chat = await message.getChat();
            
            // Hanya proses di group chat
            if (!chat.isGroup) {
                return;
            }
            
            // Cek mention dari pesan
            const mentionedIds = await message.getMentions();
            
            if (mentionedIds && mentionedIds.length > 0) {
                for (const contact of mentionedIds) {
                    const mentionedNumber = contact.id.user;
                    
                    if (afkDatabase.has(mentionedNumber)) {
                        const afkData = afkDatabase.get(mentionedNumber);
                        const duration = getCurrentTimestamp() - afkData.timestamp;
                        const formattedDuration = formatDuration(duration);
                        
                        await chat.sendMessage(
                            `💤 *User sedang AFK*\n\n` +
                            `👤 User: @${mentionedNumber}\n` +
                            `📝 Alasan: ${afkData.reason}\n` +
                            `⏱️ Sudah AFK selama: ${formattedDuration}\n` +
                            `🕒 Sejak: ${afkData.timeString}`,
                            {
                                mentions: [contact]
                            }
                        );
                    }
                }
            }
            
            // Cek quoted message (reply)
            if (message.hasQuotedMsg) {
                const quotedMsg = await message.getQuotedMessage();
                const quotedSender = quotedMsg.author || quotedMsg.from;
                const quotedNumber = quotedSender.split('@')[0];
                
                if (afkDatabase.has(quotedNumber)) {
                    const afkData = afkDatabase.get(quotedNumber);
                    const duration = getCurrentTimestamp() - afkData.timestamp;
                    const formattedDuration = formatDuration(duration);
                    
                    await chat.sendMessage(
                        `💤 *User sedang AFK*\n\n` +
                        `👤 User: @${quotedNumber}\n` +
                        `📝 Alasan: ${afkData.reason}\n` +
                        `⏱️ Sudah AFK selama: ${formattedDuration}\n` +
                        `🕒 Sejak: ${afkData.timeString}`
                    );
                }
            }
        } catch (error) {
            console.error('Error handling mention:', error);
        }
    },
    
    // Handler untuk cek apakah user yang AFK mengirim pesan
    async handleUserMessage(client, message) {
        try {
            const sender = message.author || message.from;
            const senderNumber = sender.split('@')[0];
            
            // Jangan proses jika pesan dari bot sendiri
            if (message.fromMe) return;
            
            // Jangan proses jika ini adalah command AFK
            const body = message.body?.trim() || '';
            if (body.toLowerCase().startsWith('!afk')) {
                return;
            }
            
            // Cek apakah pengirim sedang AFK
            if (afkDatabase.has(senderNumber)) {
                const afkData = afkDatabase.get(senderNumber);
                const duration = getCurrentTimestamp() - afkData.timestamp;
                const formattedDuration = formatDuration(duration);
                
                // Hapus status AFK
                afkDatabase.delete(senderNumber);
                
                // Kirim notifikasi
                const chat = await message.getChat();
                
                await chat.sendMessage(
                    `👋 *Welcome Back!*\n\n` +
                    `Kamu sudah tidak AFK lagi!\n\n` +
                    `⏱️ Durasi AFK: ${formattedDuration}\n` +
                    `🕒 Sejak: ${afkData.timeString}\n` +
                    `📝 Alasan sebelumnya: ${afkData.reason}`
                );
            }
        } catch (error) {
            console.error('Error handling user message:', error);
        }
    },
    
    // Fungsi untuk mendapatkan database (untuk debugging)
    getAfkDatabase() {
        return afkDatabase;
    }
};
