const { searchAnime } = require('../services/lolhumanService');

module.exports = {
    name: 'animesearch',
    aliases: ['searchanime', 'animes'],
    description: 'Cari anime berdasarkan judul',
    usage: '/animesearch <judul>',
    category: 'anime',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /animesearch <judul>\n\nContoh:\n/animesearch naruto');
        }

        const query = args.join(' ');
        await msg.reply('🔍 Mencari anime...');

        try {
            const result = await searchAnime(query);

            if (!result.success) {
                return msg.reply(`❌ Anime tidak ditemukan: ${result.error}`);
            }

            const animes = Array.isArray(result.data) ? result.data : [result.data];
            
            let response = `🔍 *Hasil Pencarian Anime*\n\n`;
            
            animes.slice(0, 5).forEach((anime, index) => {
                response += `${index + 1}. *${anime.title}*\n`;
                response += `   ID: ${anime.id}\n`;
                response += `   Type: ${anime.type || 'N/A'}\n`;
                response += `   Episodes: ${anime.episodes || 'N/A'}\n`;
                response += `   Score: ${anime.score || 'N/A'}\n\n`;
            });

            response += `💡 Gunakan /animedetail <id> untuk info lengkap`;

            msg.reply(response);
        } catch (error) {
            console.error('Error animesearch command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari anime');
        }
    }
};
