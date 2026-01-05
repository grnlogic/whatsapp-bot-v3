const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

module.exports = {
    name: 'character',
    aliases: ['char', 'animechar', 'searchchar'],
    description: 'Cari informasi anime character',
    usage: '/character <nama>',
    category: 'anime',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /character <nama>\n\nContoh:\n/character miku nakano\n/character naruto uzumaki');
        }

        const query = args.join(' ');
        await msg.reply('🔍 Mencari character anime...');

        try {
            const response = await axios.get('https://api.lolhuman.xyz/api/character', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    query: query
                },
                timeout: 30000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Character tidak ditemukan: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `🎭 *Anime Character*\n\n`;
            text += `👤 Name: ${data.name || 'N/A'}\n`;
            text += `📺 Anime: ${data.anime || 'N/A'}\n`;
            text += `🎂 Age: ${data.age || 'N/A'}\n`;
            text += `📏 Height: ${data.height || 'N/A'}\n`;
            text += `⚖️ Weight: ${data.weight || 'N/A'}\n`;
            text += `🎨 Hair Color: ${data.hair_color || 'N/A'}\n`;
            text += `👁️ Eye Color: ${data.eye_color || 'N/A'}\n\n`;
            text += `📝 Description:\n${data.description || 'No description available'}`;

            // Send image if available
            if (data.image) {
                try {
                    const imageResponse = await axios.get(data.image, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    const imageBuffer = Buffer.from(imageResponse.data);
                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'character.jpg');
                    await msg.reply(media, undefined, { caption: text });
                } catch (err) {
                    msg.reply(text);
                }
            } else {
                msg.reply(text);
            }
        } catch (error) {
            console.error('Error character command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari character anime');
        }
    }
};
