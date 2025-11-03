const reminderScheduler = require('../schedulers/reminderScheduler');

/**
 * Command Reminder - Untuk cek reminder manual
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function reminderCommand(client, message) {
    try {
        const userId = message.from;
        
        // Kirim reminder manual
        const sent = await reminderScheduler.sendManualReminder(client, userId);
        
        if (!sent) {
            await message.reply('✨ Tidak ada task mendatang dalam 3 hari ke depan!');
        }
        
        console.log(`✅ Reminder manual berhasil untuk ${userId}`);
    } catch (error) {
        console.error('Error executing reminder command:', error);
        await message.reply('❌ Terjadi kesalahan saat menjalankan command.');
    }
}

module.exports = reminderCommand;
