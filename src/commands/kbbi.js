const { getKBBI } = require('../services/lolhumanService');

module.exports = {
    name: 'kbbi',
    description: 'Cari arti kata di KBBI (Kamus Besar Bahasa Indonesia)',
    usage: '/kbbi <kata>',
    category: 'search',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /kbbi <kata>\n\nContoh:\n/kbbi komputer');
        }

        const word = args.join(' ');
        await msg.reply('🔍 Mencari di KBBI...');

        try {
            const result = await getKBBI(word);

            if (!result.success) {
                return msg.reply(`❌ Kata tidak ditemukan: ${result.error}`);
            }

            const data = Array.isArray(result.data) ? result.data : [result.data];
            
            let response = `📚 *KBBI - ${word}*\n\n`;
            
            data.forEach((item, index) => {
                if (index < 5) { // Limit to 5 definitions
                    response += `${index + 1}. ${item.arti || item}\n\n`;
                }
            });

            msg.reply(response);
        } catch (error) {
            console.error('Error kbbi command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari di KBBI');
        }
    }
};
