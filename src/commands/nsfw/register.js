const { registerUser, isUserRegistered } = require('../../services/nsfwDatabaseService');
const { isDeveloper } = require('./nsfwConfig');

module.exports = {
    name: 'daftar',
    description: 'Daftar untuk akses NSFW content (memerlukan approval admin)',
    usage: '!daftar <nama>',
    category: 'NSFW Registration',
    execute: async (msg, args) => {
        try {
            // Developer otomatis punya akses, tidak perlu daftar
            const senderId = msg.author || msg.from;
            if (isDeveloper(senderId)) {
                return msg.reply('✅ Anda adalah developer, sudah memiliki akses penuh ke NSFW content tanpa perlu registrasi.');
            }

            // Validasi input nama
            if (!args || args.length === 0) {
                return msg.reply('❌ *Format salah!*\n\nGunakan: `!daftar <nama>`\nContoh: `!daftar Fajar`');
            }

            const name = args.join(' ');
            
            // Validasi panjang nama
            if (name.length < 2) {
                return msg.reply('❌ Nama minimal 2 karakter!');
            }
            
            if (name.length > 50) {
                return msg.reply('❌ Nama maksimal 50 karakter!');
            }

            // Get chat info untuk tracking
            const chat = await msg.getChat();
            const registeredFrom = chat.isGroup 
                ? `Group: ${chat.name}` 
                : 'Personal Chat';

            // Cek apakah sudah terdaftar
            const existing = await isUserRegistered(senderId);
            if (existing) {
                if (existing.status === 'pending') {
                    return msg.reply(
                        '⏳ *Registrasi Pending*\n\n' +
                        `📝 Nama: ${existing.name}\n` +
                        `📅 Tanggal: ${new Date(existing.registeredAt).toLocaleString('id-ID')}\n` +
                        `📍 Dari: ${existing.registeredFrom}\n\n` +
                        '⌛ Menunggu verifikasi dari admin...'
                    );
                } else if (existing.status === 'approved') {
                    return msg.reply(
                        '✅ *Sudah Terverifikasi!*\n\n' +
                        `Anda sudah memiliki akses NSFW content.\n` +
                        `Silakan gunakan command NSFW yang tersedia.`
                    );
                } else if (existing.status === 'rejected') {
                    return msg.reply(
                        '❌ *Registrasi Ditolak*\n\n' +
                        `Alasan: ${existing.reason || 'Tidak disebutkan'}\n\n` +
                        'Hubungi admin untuk informasi lebih lanjut.'
                    );
                }
            }

            // Register user baru
            const result = await registerUser(senderId, name, registeredFrom);
            
            if (result.success) {
                msg.reply(
                    '✅ *Registrasi Berhasil!*\n\n' +
                    `📝 Nama: ${name}\n` +
                    `🆔 ID: \`${senderId}\`\n` +
                    `📍 Lokasi: ${registeredFrom}\n` +
                    `📅 Tanggal: ${new Date().toLocaleString('id-ID')}\n\n` +
                    '⏳ *Status: PENDING*\n\n' +
                    '⌛ Tunggu admin untuk verifikasi akun Anda.\n' +
                    '📢 Anda akan diberitahu setelah akun disetujui.'
                );
            } else {
                msg.reply(`❌ Registrasi gagal: ${result.message}`);
            }

        } catch (error) {
            console.error('Error in daftar command:', error);
            msg.reply('❌ Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
        }
    }
};
