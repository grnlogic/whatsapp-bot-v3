const { MessageMedia } = require('whatsapp-web.js');
const { getRandomAnime, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'randomanime',
    aliases: ['animerandom', 'ranime'],
    description: 'Dapatkan gambar anime random',
    usage: '/randomanime',
    category: 'anime',
    async execute(msg, args) {
        await msg.reply('⏳ Mengambil gambar anime random...');

        try {
            const result = await getRandomAnime();

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan gambar: ${result.error}`);
            }

            const imageBuffer = await downloadMediaBuffer(result.data);
            const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'anime.jpg');
            
            await msg.reply(media, undefined, { 
                caption: '🎨 Random Anime Image' 
            });
        } catch (error) {
            console.error('Error randomanime command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil gambar anime');
        }
    }
};
