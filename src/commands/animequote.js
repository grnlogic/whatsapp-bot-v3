const { getAnimeQuotes } = require('../services/lolhumanService');

module.exports = {
    name: 'animequote',
    aliases: ['quoteanime', 'aq'],
    description: 'Dapatkan quote anime random',
    usage: '/animequote',
    category: 'anime',
    async execute(msg, args) {
        await msg.reply('⏳ Mengambil quote anime...');

        try {
            const result = await getAnimeQuotes();

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan quote: ${result.error}`);
            }

            const { quote, character, anime } = result.data;
            
            let response = `💬 *Anime Quote*\n\n`;
            response += `"${quote}"\n\n`;
            response += `👤 Character: ${character}\n`;
            response += `🎬 Anime: ${anime}`;

            msg.reply(response);
        } catch (error) {
            console.error('Error animequote command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil quote');
        }
    }
};
