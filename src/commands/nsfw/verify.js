const { approveUser, rejectUser, removeUser, getPendingUsers } = require('../../services/nsfwDatabaseService');
const { isDeveloper } = require('./nsfwConfig');

module.exports = {
    name: 'verify',
    description: 'Verifikasi user untuk akses NSFW (developer only)',
    usage: '!verify <action> [@mention | user_id | all]\nActions: approve, reject, remove, pending',
    category: 'NSFW Admin',
    execute: async (msg, args) => {
        try {
            // Cek apakah yang execute adalah developer
            const executorId = msg.author || msg.from;
            if (!isDeveloper(executorId)) {
                return msg.reply('❌ Command ini hanya untuk developer!');
            }

            // Validasi args
            if (!args || args.length === 0) {
                return msg.reply(
                    '📋 *NSFW Verify Commands*\n\n' +
                    '✅ Approve:\n' +
                    '• `!verify approve @user` - Approve dengan mention\n' +
                    '• `!verify approve <user_id>` - Approve dengan ID\n' +
                    '• `!verify approve all` - Approve semua pending\n\n' +
                    '❌ Reject:\n' +
                    '• `!verify reject @user [reason]` - Reject dengan mention\n' +
                    '• `!verify reject <user_id> [reason]` - Reject dengan ID\n\n' +
                    '🗑️ Remove:\n' +
                    '• `!verify remove @user` - Hapus dari approved list\n' +
                    '• `!verify remove <user_id>` - Hapus dengan ID\n\n' +
                    '📋 List:\n' +
                    '• `!verify pending` - Lihat pending users'
                );
            }

            const action = args[0].toLowerCase();

            // Handle "pending" list
            if (action === 'pending') {
                const pendingUsers = await getPendingUsers();
                
                if (pendingUsers.length === 0) {
                    return msg.reply('✅ Tidak ada user yang menunggu verifikasi.');
                }

                let response = `⏳ *Pending Verifikasi* (${pendingUsers.length})\n\n`;
                
                pendingUsers.forEach((user, index) => {
                    response += `${index + 1}. ${user.name}\n`;
                    response += `   🆔 \`${user.id}\`\n`;
                    response += `   📅 ${new Date(user.registeredAt).toLocaleString('id-ID')}\n`;
                    response += `   📍 ${user.registeredFrom}\n\n`;
                });

                response += '\n💡 Gunakan `!verify approve @user` atau `!verify approve <user_id>` untuk approve';

                return msg.reply(response);
            }

            // Untuk approve/reject/remove, butuh target
            if (args.length < 2) {
                return msg.reply('❌ Sebutkan user yang ingin di-' + action + '!\n\nContoh:\n• `!verify ' + action + ' @user`\n• `!verify ' + action + ' <user_id>`');
            }

            // Handle "approve all"
            if (action === 'approve' && args[1].toLowerCase() === 'all') {
                const pendingUsers = await getPendingUsers();
                
                if (pendingUsers.length === 0) {
                    return msg.reply('✅ Tidak ada user yang menunggu verifikasi.');
                }

                let approved = 0;
                let failed = 0;

                for (const user of pendingUsers) {
                    const result = await approveUser(user.id, executorId);
                    if (result.success) {
                        approved++;
                    } else {
                        failed++;
                    }
                }

                return msg.reply(
                    `✅ *Bulk Approval Selesai!*\n\n` +
                    `✔️ Approved: ${approved}\n` +
                    `❌ Failed: ${failed}\n` +
                    `📊 Total: ${pendingUsers.length}`
                );
            }

            // Get target user ID (dari mention atau langsung ID)
            let targetUserId;
            
            if (msg.mentionedIds && msg.mentionedIds.length > 0) {
                // Dari mention
                targetUserId = msg.mentionedIds[0];
            } else {
                // Dari args (user_id manual)
                targetUserId = args[1];
            }

            // Execute action
            switch (action) {
                case 'approve': {
                    const result = await approveUser(targetUserId, executorId);
                    
                    if (result.success) {
                        msg.reply(
                            '✅ *User Approved!*\n\n' +
                            `📝 Nama: ${result.user.name}\n` +
                            `🆔 ID: \`${result.user.id}\`\n` +
                            `✅ Status: APPROVED\n` +
                            `👤 Approved by: Developer\n` +
                            `📅 Tanggal: ${new Date().toLocaleString('id-ID')}\n\n` +
                            '🎉 User sekarang bisa akses NSFW content!'
                        );
                        
                        // Notify user (jika di grup yang sama)
                        // Note: Ini akan bekerja jika bot bisa DM user, atau bisa kirim notif di grup
                    } else {
                        msg.reply(`❌ ${result.message}`);
                    }
                    break;
                }

                case 'reject': {
                    const reason = args.slice(2).join(' ') || 'Tidak memenuhi syarat';
                    const result = await rejectUser(targetUserId, executorId, reason);
                    
                    if (result.success) {
                        msg.reply(
                            '❌ *User Rejected!*\n\n' +
                            `📝 Nama: ${result.user.name}\n` +
                            `🆔 ID: \`${result.user.id}\`\n` +
                            `❌ Status: REJECTED\n` +
                            `📄 Alasan: ${reason}\n` +
                            `👤 Rejected by: Developer\n` +
                            `📅 Tanggal: ${new Date().toLocaleString('id-ID')}`
                        );
                    } else {
                        msg.reply(`❌ ${result.message}`);
                    }
                    break;
                }

                case 'remove': {
                    const result = await removeUser(targetUserId, executorId);
                    
                    if (result.success) {
                        msg.reply(
                            '🗑️ *User Removed!*\n\n' +
                            `📝 Nama: ${result.user.name}\n` +
                            `🆔 ID: \`${result.user.id}\`\n` +
                            `🚫 Akses NSFW dicabut\n` +
                            `👤 Removed by: Developer\n` +
                            `📅 Tanggal: ${new Date().toLocaleString('id-ID')}`
                        );
                    } else {
                        msg.reply(`❌ ${result.message}`);
                    }
                    break;
                }

                default:
                    msg.reply(`❌ Action tidak valid: ${action}\n\nGunakan: approve, reject, remove, atau pending`);
            }

        } catch (error) {
            console.error('Error in verify command:', error);
            msg.reply('❌ Terjadi kesalahan saat memverifikasi user.');
        }
    }
};
