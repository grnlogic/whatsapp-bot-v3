const { unbanUser } = require('../services/banService');
const { isDeveloper } = require('./nsfw/nsfwConfig');

module.exports = {
    name: 'unban',
    aliases: ['unbanuser', 'unblock'],
    description: 'Unban user from using bot (developer only)',
    usage: '!unban @user or !unban <user_id>',
    category: 'admin',
    execute: async (msg, args) => {
        try {
            // Check if executor is developer
            const executorId = msg.author || msg.from;
            if (!isDeveloper(executorId)) {
                return msg.reply('❌ Command ini hanya untuk developer!');
            }

            // Validation
            if (!msg.mentionedIds || msg.mentionedIds.length === 0) {
                if (args.length === 0) {
                    return msg.reply(
                        '❌ *Format salah!*\n\n' +
                        'Gunakan:\n' +
                        '• `!unban @user` - Unban dengan mention\n' +
                        '• `!unban <user_id>` - Unban dengan ID\n\n' +
                        'Contoh:\n' +
                        '`!unban @user`\n' +
                        '`!unban 628xxx@c.us`'
                    );
                }
            }

            // Get target user ID
            let targetUserId;
            
            if (msg.mentionedIds && msg.mentionedIds.length > 0) {
                // From mention
                targetUserId = msg.mentionedIds[0];
            } else {
                // From args (user_id manual)
                targetUserId = args[0];
            }

            // Unban user
            const result = await unbanUser(targetUserId, executorId);

            if (result.success) {
                msg.reply(
                    '✅ *User Unbanned!*\n\n' +
                    `👤 User: ${result.user.userName}\n` +
                    `🆔 ID: \`${result.user.userId}\`\n` +
                    `📝 Was banned for: ${result.user.reason}\n` +
                    `👨‍💼 Unbanned by: Developer\n` +
                    `📅 Date: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `✅ User sekarang bisa menggunakan bot kembali.`
                );
            } else {
                msg.reply(`❌ ${result.message}`);
            }

        } catch (error) {
            console.error('Error in unban command:', error);
            msg.reply('❌ Terjadi kesalahan saat unban user.');
        }
    }
};
