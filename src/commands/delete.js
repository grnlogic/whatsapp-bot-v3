const { isDeveloper } = require('./nsfw/nsfwConfig');

/**
 * Delete Command
 * Menghapus pesan dari siapa saja (bot atau user)
 * Hanya bisa digunakan oleh admin grup atau developer
 * 
 * Cara pakai:
 * Reply pesan yang ingin dihapus + ketik !delete
 * 
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function deleteCommand(message, args) {
    try {
        // Cek apakah ada pesan yang di-reply
        if (!message.hasQuotedMsg) {
            await message.reply(
                '❌ *Format salah!*\n\n' +
                'Cara pakai:\n' +
                '1. Reply pesan yang ingin dihapus\n' +
                '2. Ketik `!delete`\n\n' +
                '💡 Bot akan menghapus pesan dari siapa saja'
            );
            return;
        }

        const sender = message.author || message.from;
        const chat = await message.getChat();

        // Cek permission: Developer bisa di mana saja, Non-developer harus admin di grup
        let hasPermission = false;

        // Cek apakah developer
        if (isDeveloper(sender)) {
            hasPermission = true;
        } 
        // Cek apakah di grup dan apakah admin
        else if (chat.isGroup) {
            const senderNumber = sender.split('@')[0];
            const participant = chat.participants.find(p => {
                const participantNumber = p.id._serialized.split('@')[0];
                return participantNumber === senderNumber;
            });

            if (participant && participant.isAdmin) {
                hasPermission = true;
            }
        }

        if (!hasPermission) {
            await message.reply('❌ Command ini hanya bisa digunakan oleh admin grup atau developer!');
            return;
        }

        // Ambil pesan yang di-reply
        const quotedMsg = await message.getQuotedMessage();

        // Hapus pesan (dari bot atau dari user lain)
        await quotedMsg.delete(true);
        
        // Kirim konfirmasi dan hapus setelah beberapa detik
        const confirmMsg = await message.reply('✅ Pesan berhasil dihapus!');
        
        // Hapus pesan konfirmasi setelah 3 detik
        setTimeout(async () => {
            try {
                await confirmMsg.delete(true);
            } catch (error) {
                console.log('Gagal menghapus pesan konfirmasi:', error.message);
            }
        }, 3000);

        // Hapus pesan command setelah 3 detik
        setTimeout(async () => {
            try {
                await message.delete(true);
            } catch (error) {
                console.log('Gagal menghapus pesan command:', error.message);
            }
        }, 3000);

    } catch (error) {
        console.error('Error dalam delete command:', error);
        await message.reply(
            '❌ Gagal menghapus pesan!\n\n' +
            `Error: ${error.message}`
        );
    }
}

module.exports = {
    name: 'delete',
    aliases: ['del', 'hapus'],
    description: 'Hapus pesan dari siapa saja (admin/developer only)',
    usage: 'Reply pesan + ketik !delete',
    category: 'admin',
    execute: deleteCommand
};
