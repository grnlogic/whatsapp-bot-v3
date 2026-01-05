const axios = require('axios');
const { checkNSFWAccess, getNSFWDeniedMessage } = require('./nsfwConfig');

module.exports = {
    name: 'nhsearch',
    aliases: ['nhs', 'searchnh', 'nhcari'],
    description: '[18+] Search nhentai doujin by keyword',
    usage: '!nhsearch <keyword>',
    category: 'nsfw',
    async execute(msg, args) {
        // Check NSFW access
        const hasAccess = await checkNSFWAccess(msg);
        if (!hasAccess) {
            return msg.reply(getNSFWDeniedMessage());
        }

        if (args.length === 0) {
            return msg.reply('❌ Gunakan: !nhsearch <keyword>\n\n🔞 *WARNING: Konten 18+*\n🔎 Search doujin berdasarkan kata kunci\n\nContoh:\n!nhsearch miku\n!nhsearch gotoubun no hanayome');
        }

        const query = args.join(' ');
        await msg.reply(`🔎 Mencari: "${query}"... 🔞`);

        try {
            const response = await axios.get('https://api.lolhuman.xyz/api/nhentaisearch', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    query: query
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mencari: ${response.data.message}`);
            }

            const results = response.data.result;
            
            if (!results || results.length === 0) {
                return msg.reply(`❌ Tidak ditemukan hasil untuk: "${query}"\n\n💡 Coba kata kunci lain`);
            }

            // Tampilkan max 10 hasil
            const displayCount = Math.min(10, results.length);
            let text = `🔎 *nhentai Search Results*\n`;
            text += `📝 Query: "${query}"\n`;
            text += `📊 Found: ${results.length} results\n`;
            text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            for (let i = 0; i < displayCount; i++) {
                const item = results[i];
                text += `${i + 1}. 💣 *${item.id}*\n`;
                
                // Title (prioritas: native > english > japanese)
                const title = item.title_native || item.title_english || item.title_japanese || 'No Title';
                const truncatedTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
                text += `   📖 ${truncatedTitle}\n`;
                
                // Pages
                if (item.page) {
                    text += `   📄 ${item.page} pages\n`;
                }
                
                text += `\n`;
            }

            if (results.length > displayCount) {
                text += `... dan ${results.length - displayCount} hasil lainnya\n\n`;
            }

            text += `━━━━━━━━━━━━━━━━━━━━\n`;
            text += `💡 Gunakan kode nuklir untuk detail:\n`;
            text += `!nhentai <kode>\n\n`;
            text += `⚠️ *WARNING: Konten 18+ - Hanya untuk dewasa*`;

            await msg.reply(text);

        } catch (error) {
            console.error('Error in nhsearch command:', error);
            
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return msg.reply('❌ Request timeout. API sedang lambat, coba lagi.');
            }
            
            if (error.response) {
                return msg.reply(`❌ API Error: ${error.response.status}\n${error.response.data?.message || 'Unknown error'}`);
            }
            
            msg.reply('❌ Terjadi kesalahan saat mencari. Coba lagi nanti.');
        }
    }
};
