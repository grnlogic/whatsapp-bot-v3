const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

module.exports = {
    name: 'stalkig',
    aliases: ['igstalk', 'igprofile'],
    description: 'Stalk profil Instagram',
    usage: '/stalkig <username>',
    category: 'stalk',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /stalkig <username>\n\nContoh:\n/stalkig cristiano');
        }

        const username = args[0].replace('@', '');
        await msg.reply('🔍 Mengambil data profil Instagram...');

        try {
            const response = await axios.get('https://api.lolhuman.xyz/api/stalkig/' + username, {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
                },
                timeout: 30000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mengambil data: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `📸 *Instagram Profile*\n\n`;
            text += `👤 Username: @${data.username}\n`;
            text += `📝 Fullname: ${data.fullname || 'N/A'}\n`;
            text += `📊 Posts: ${data.posts || 0}\n`;
            text += `👥 Followers: ${data.followers || 0}\n`;
            text += `👣 Following: ${data.following || 0}\n`;
            text += `✅ Verified: ${data.is_verified ? 'Yes' : 'No'}\n`;
            text += `🔒 Private: ${data.is_private ? 'Yes' : 'No'}\n\n`;
            text += `📄 Bio:\n${data.biography || 'No bio'}`;

            if (data.photo_profile) {
                try {
                    const imageResponse = await axios.get(data.photo_profile, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    const imageBuffer = Buffer.from(imageResponse.data);
                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'profile.jpg');
                    await msg.reply(media, undefined, { caption: text });
                } catch (err) {
                    msg.reply(text);
                }
            } else {
                msg.reply(text);
            }
        } catch (error) {
            console.error('Error stalkig command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil data profil Instagram');
        }
    }
};
