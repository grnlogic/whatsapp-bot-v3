const { getApprovedUsers, getPendingUsers, getRejectedUsers, getStats } = require('../../services/nsfwDatabaseService');
const { isDeveloper } = require('./nsfwConfig');

module.exports = {
    name: 'nsfwlist',
    description: 'Lihat daftar user NSFW (developer only)',
    usage: '!nsfwlist [approved|pending|rejected|stats]',
    category: 'NSFW Admin',
    execute: async (msg, args) => {
        try {
            // Cek apakah yang execute adalah developer
            const executorId = msg.author || msg.from;
            if (!isDeveloper(executorId)) {
                return msg.reply('❌ Command ini hanya untuk developer!');
            }

            const listType = args[0]?.toLowerCase() || 'stats';

            switch (listType) {
                case 'approved': {
                    const users = await getApprovedUsers();
                    
                    if (users.length === 0) {
                        return msg.reply('📭 Belum ada user yang diapprove.');
                    }

                    let response = `✅ *Approved Users* (${users.length})\n\n`;
                    
                    users.forEach((user, index) => {
                        response += `${index + 1}. ${user.name}\n`;
                        response += `   🆔 \`${user.id}\`\n`;
                        response += `   📅 Approved: ${new Date(user.approvedAt).toLocaleString('id-ID')}\n`;
                        response += `   📍 Registered from: ${user.registeredFrom}\n\n`;
                    });

                    return msg.reply(response);
                }

                case 'pending': {
                    const users = await getPendingUsers();
                    
                    if (users.length === 0) {
                        return msg.reply('📭 Tidak ada pending verifikasi.');
                    }

                    let response = `⏳ *Pending Verifikasi* (${users.length})\n\n`;
                    
                    users.forEach((user, index) => {
                        response += `${index + 1}. ${user.name}\n`;
                        response += `   🆔 \`${user.id}\`\n`;
                        response += `   📅 Registered: ${new Date(user.registeredAt).toLocaleString('id-ID')}\n`;
                        response += `   📍 From: ${user.registeredFrom}\n\n`;
                    });

                    response += '\n💡 Gunakan `!verify approve @user` untuk approve';

                    return msg.reply(response);
                }

                case 'rejected': {
                    const users = await getRejectedUsers();
                    
                    if (users.length === 0) {
                        return msg.reply('📭 Tidak ada user yang direject.');
                    }

                    let response = `❌ *Rejected Users* (${users.length})\n\n`;
                    
                    users.forEach((user, index) => {
                        response += `${index + 1}. ${user.name}\n`;
                        response += `   🆔 \`${user.id}\`\n`;
                        response += `   📅 Rejected: ${new Date(user.rejectedAt).toLocaleString('id-ID')}\n`;
                        response += `   📄 Reason: ${user.reason}\n\n`;
                    });

                    return msg.reply(response);
                }

                case 'stats': {
                    const stats = await getStats();
                    
                    return msg.reply(
                        '📊 *NSFW User Statistics*\n\n' +
                        `✅ Approved: ${stats.approved}\n` +
                        `⏳ Pending: ${stats.pending}\n` +
                        `❌ Rejected: ${stats.rejected}\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `📈 Total: ${stats.total}\n\n` +
                        '💡 Commands:\n' +
                        '• `!nsfwlist approved` - Lihat approved users\n' +
                        '• `!nsfwlist pending` - Lihat pending users\n' +
                        '• `!nsfwlist rejected` - Lihat rejected users'
                    );
                }

                default:
                    msg.reply(
                        '❌ *Invalid list type!*\n\n' +
                        'Gunakan:\n' +
                        '• `!nsfwlist stats` - Statistik (default)\n' +
                        '• `!nsfwlist approved` - User yang diapprove\n' +
                        '• `!nsfwlist pending` - User yang menunggu\n' +
                        '• `!nsfwlist rejected` - User yang ditolak'
                    );
            }

        } catch (error) {
            console.error('Error in nsfwlist command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil daftar user.');
        }
    }
};
