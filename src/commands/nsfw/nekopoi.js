const axios = require('axios');
const { checkNSFWAccess, getNSFWDeniedMessage } = require('./nsfwConfig');

module.exports = {
    name: 'nekopoi',
    aliases: ['neko18', 'hentai'],
    description: '[18+] Download dari Nekopoi',
    usage: '/nekopoi <url>',
    category: 'nsfw',
    async execute(msg, args) {
        // Check NSFW access
        const hasAccess = await checkNSFWAccess(msg);
        if (!hasAccess) {
            return msg.reply(getNSFWDeniedMessage());
        }

        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /nekopoi <url>\n\n🔞 *WARNING: Konten 18+*\n\nContoh:\n/nekopoi https://nekopoi.care/xxx');
        }

        const url = args[0];

        if (!url.includes('nekopoi')) {
            return msg.reply('❌ URL harus dari Nekopoi!');
        }

        await msg.reply('⏳ Mengambil data... 🔞');

        try {
            const response = await axios.get('https://api.lolhuman.xyz/api/nekopoi', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    url: url
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mengambil data: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `🔞 *Nekopoi Content*\n\n`;
            text += `📝 Title: ${data.title || 'N/A'}\n`;
            text += `📅 Posted: ${data.posted || 'N/A'}\n`;
            text += `🏷️ Genres: ${data.genre?.join(', ') || 'N/A'}\n`;
            text += `⏱️ Duration: ${data.duration || 'N/A'}\n\n`;
            
            if (data.link && data.link.length > 0) {
                text += `📥 *Download Links:*\n\n`;
                data.link.forEach((link, index) => {
                    text += `${index + 1}. ${link.quality || 'Unknown'}\n`;
                    text += `   Size: ${link.size || 'N/A'}\n`;
                    text += `   Link: ${link.url || 'N/A'}\n\n`;
                });
            }
            
            text += `⚠️ *WARNING: Konten 18+ - Hanya untuk dewasa*`;

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
            console.error('Error nekopoi command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil data');
        }
    }
};
