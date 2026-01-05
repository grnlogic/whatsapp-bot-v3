const axios = require('axios');

module.exports = {
    name: 'chord',
    aliases: ['chordgitar', 'kuncigitar'],
    description: 'Cari chord gitar lagu',
    usage: '/chord <judul lagu>',
    category: 'search',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /chord <judul lagu>\n\nContoh:\n/chord pergilah kasih');
        }

        const query = args.join(' ');
        await msg.reply('🎸 Mencari chord gitar...');

        try {
            const response = await axios.get('https://api.lolhuman.xyz/api/chord', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    query: query
                },
                timeout: 30000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Chord tidak ditemukan: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `🎸 *Chord Gitar*\n\n`;
            text += `🎵 ${data.title || 'No title'}\n`;
            text += `👤 ${data.artist || 'Unknown'}\n\n`;
            text += data.chord || 'Chord not available';

            // Split if too long
            if (text.length > 4000) {
                const parts = text.match(/[\s\S]{1,4000}/g) || [];
                for (const part of parts) {
                    await msg.reply(part);
                }
            } else {
                msg.reply(text);
            }
        } catch (error) {
            console.error('Error chord command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari chord');
        }
    }
};
