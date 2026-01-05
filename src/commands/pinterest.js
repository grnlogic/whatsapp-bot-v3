const { MessageMedia } = require('whatsapp-web.js');
const { callLoLHumanAPI, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'pinterest',
    aliases: ['pin', 'pint'],
    description: 'Cari dan download gambar dari Pinterest',
    usage: '/pinterest <query>',
    category: 'image',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /pinterest <query>\n\nContoh:\n/pinterest anime girl\n/pinterest nature wallpaper');
        }

        const query = args.join(' ');
        await msg.reply('🔍 Mencari gambar di Pinterest...');

        try {
            const result = await callLoLHumanAPI('/api/pinterest', { query });

            if (!result.success) {
                return msg.reply(`❌ Gagal mencari gambar: ${result.error}`);
            }

            // Result.data is the image URL
            const imageUrl = result.data;
            const imageBuffer = await downloadMediaBuffer(imageUrl);
            const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'pinterest.jpg');
            
            await msg.reply(media, undefined, { 
                caption: `📌 *Pinterest*\n\n🔍 Query: ${query}\n🔗 ${imageUrl}` 
            });
        } catch (error) {
            console.error('Error pinterest command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari gambar di Pinterest');
        }
    }
};
