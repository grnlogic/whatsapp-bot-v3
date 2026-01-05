const { getAllBannedUsers, getBanStats } = require('../services/banService');
const { isDeveloper } = require('./nsfw/nsfwConfig');

module.exports = {
    name: 'banlist',
    aliases: ['listban', 'bannedusers'],
    description: 'List all banned users (developer only)',
    usage: '!banlist',
    category: 'admin',
    execute: async (msg, args) => {
        try {
            // Check if executor is developer
            const executorId = msg.author || msg.from;
            if (!isDeveloper(executorId)) {
                return msg.reply('❌ Command ini hanya untuk developer!');
            }

            const stats = await getBanStats();

            if (stats.total === 0) {
                return msg.reply('✅ Tidak ada user yang di-ban.');
            }

            let response = `🚫 *Banned Users* (${stats.total})\n\n`;

            stats.list.forEach((ban, index) => {
                response += `${index + 1}. ${ban.userName}\n`;
                response += `   🆔 \`${ban.userId}\`\n`;
                response += `   📝 Reason: ${ban.reason}\n`;
                response += `   📅 Banned: ${new Date(ban.bannedAt).toLocaleString('id-ID')}\n\n`;
            });

            response += `💡 Gunakan \`!unban @user\` untuk unban user`;

            msg.reply(response);

        } catch (error) {
            console.error('Error in banlist command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil ban list.');
        }
    }
};
