const { banUser } = require('../services/banService');
const { isDeveloper } = require('./nsfw/nsfwConfig');

module.exports = {
    name: 'ban',
    aliases: ['banuser', 'block'],
    description: 'Ban user from using bot (developer only)',
    usage: '!ban @user [reason]',
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
                        '• `!ban @user [reason]` - Ban dengan mention\n' +
                        '• `!ban <user_id> [reason]` - Ban dengan ID\n\n' +
                        'Contoh:\n' +
                        '`!ban @user spam bot`\n' +
                        '`!ban 628xxx@c.us toxic behavior`'
                    );
                }
            }

            // Get target user ID
            let targetUserId;
            let userName = 'Unknown';
            
            if (msg.mentionedIds && msg.mentionedIds.length > 0) {
                // From mention
                targetUserId = msg.mentionedIds[0];
                try {
                    const contact = await msg.getContact();
                    userName = contact.pushname || contact.name || targetUserId.split('@')[0];
                } catch (e) {
                    userName = targetUserId.split('@')[0];
                }
            } else {
                // From args (user_id manual)
                targetUserId = args[0];
            }

            // Check if trying to ban developer
            if (isDeveloper(targetUserId)) {
                return msg.reply('❌ Tidak bisa ban developer!');
            }

            // Get reason (skip first arg if it's user_id)
            const reasonStartIndex = msg.mentionedIds && msg.mentionedIds.length > 0 ? 0 : 1;
            const reason = args.slice(reasonStartIndex).join(' ') || 'No reason provided';

            // Ban user
            const result = await banUser(targetUserId, executorId, reason, userName);

            if (result.success) {
                msg.reply(
                    '🚫 *User Banned!*\n\n' +
                    `👤 User: ${result.ban.userName}\n` +
                    `🆔 ID: \`${result.ban.userId}\`\n` +
                    `📝 Reason: ${result.ban.reason}\n` +
                    `👨‍💼 Banned by: Developer\n` +
                    `📅 Date: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `⛔ User ini tidak bisa menggunakan bot sampai di-unban.`
                );
            } else {
                msg.reply(`❌ ${result.message}`);
            }

        } catch (error) {
            console.error('Error in ban command:', error);
            msg.reply('❌ Terjadi kesalahan saat ban user.');
        }
    }
};
