const { MessageMedia } = require('whatsapp-web.js');
const { getAnimeDetail, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'animedetail',
    aliases: ['animeinfo', 'ad'],
    description: 'Dapatkan detail lengkap anime berdasarkan ID',
    usage: '/animedetail <id>',
    category: 'anime',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /animedetail <id>\n\nContoh:\n/animedetail 21');
        }

        const id = args[0];
        await msg.reply('⏳ Mengambil detail anime...');

        try {
            const result = await getAnimeDetail(id);

            if (!result.success) {
                return msg.reply(`❌ Anime tidak ditemukan: ${result.error}`);
            }

            const anime = result.data;
            
            let response = `🎬 *${anime.title}*\n\n`;
            response += `📺 Type: ${anime.type || 'N/A'}\n`;
            response += `📊 Episodes: ${anime.episodes || 'N/A'}\n`;
            response += `📅 Status: ${anime.status || 'N/A'}\n`;
            response += `⭐ Score: ${anime.score || 'N/A'}\n`;
            response += `🎭 Genres: ${anime.genres?.join(', ') || 'N/A'}\n\n`;
            response += `📝 Synopsis:\n${anime.synopsis || 'No synopsis available'}`;

            // Send image if available
            if (anime.image) {
                try {
                    const imageBuffer = await downloadMediaBuffer(anime.image);
                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'anime.jpg');
                    await msg.reply(media, undefined, { caption: response });
                } catch (err) {
                    msg.reply(response);
                }
            } else {
                msg.reply(response);
            }
        } catch (error) {
            console.error('Error animedetail command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil detail anime');
        }
    }
};
