const { getLyrics } = require('../services/lolhumanService');

module.exports = {
    name: 'lyrics',
    aliases: ['lirik'],
    description: 'Cari lirik lagu',
    usage: '/lyrics <judul lagu>',
    category: 'search',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /lyrics <judul lagu>\n\nContoh:\n/lyrics perfect ed sheeran');
        }

        const query = args.join(' ');
        await msg.reply('🎵 Mencari lirik lagu...');

        try {
            const result = await getLyrics(query);

            if (!result.success) {
                return msg.reply(`❌ Lirik tidak ditemukan: ${result.error}`);
            }

            const { title, artist, lyrics, image } = result.data;
            
            let response = `🎵 *Lyrics*\n\n`;
            response += `🎤 ${title}\n`;
            response += `👤 ${artist}\n\n`;
            response += `${lyrics}`;

            // Split if too long
            if (response.length > 4000) {
                const parts = response.match(/[\s\S]{1,4000}/g) || [];
                for (const part of parts) {
                    await msg.reply(part);
                }
            } else {
                msg.reply(response);
            }
        } catch (error) {
            console.error('Error lyrics command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari lirik');
        }
    }
};
