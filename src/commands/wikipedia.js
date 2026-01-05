const { getWikipedia } = require('../services/lolhumanService');

module.exports = {
    name: 'wikipedia',
    aliases: ['wiki'],
    description: 'Cari informasi dari Wikipedia',
    usage: '/wikipedia <query>',
    category: 'search',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /wikipedia <query>\n\nContoh:\n/wikipedia Indonesia');
        }

        const query = args.join(' ');
        await msg.reply('🔍 Mencari di Wikipedia...');

        try {
            const result = await getWikipedia(query);

            if (!result.success) {
                return msg.reply(`❌ Gagal mencari: ${result.error}`);
            }

            const { title, extract, url, image } = result.data;
            
            let response = `📖 *Wikipedia*\n\n`;
            response += `*${title}*\n\n`;
            response += `${extract}\n\n`;
            response += `🔗 Baca selengkapnya: ${url}`;

            msg.reply(response);
        } catch (error) {
            console.error('Error wikipedia command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari di Wikipedia');
        }
    }
};
