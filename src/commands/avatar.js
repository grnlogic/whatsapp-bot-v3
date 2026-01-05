const { MessageMedia } = require('whatsapp-web.js');
const { getAvatar, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'avatar',
    aliases: ['pp', 'profilepic'],
    description: 'Dapatkan avatar/profile picture dari username',
    usage: '/avatar <username>',
    category: 'image',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /avatar <username>\n\nContoh:\n/avatar discord/user123\n/avatar github/torvalds');
        }

        const username = args.join(' ');
        await msg.reply('⏳ Mengambil avatar...');

        try {
            const result = await getAvatar(username);

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan avatar: ${result.error}`);
            }

            const avatarBuffer = await downloadMediaBuffer(result.data);
            const media = new MessageMedia('image/png', avatarBuffer.toString('base64'), 'avatar.png');
            
            await msg.reply(media, undefined, { 
                caption: `👤 Avatar untuk: ${username}` 
            });
        } catch (error) {
            console.error('Error avatar command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil avatar');
        }
    }
};
