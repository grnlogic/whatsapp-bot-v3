const axios = require('axios');

module.exports = {
    name: 'quote',
    aliases: ['quotes', 'randomquote'],
    description: 'Random quote inspiratif',
    usage: '!quote',
    category: 'fun',
    async execute(msg, args) {
        await msg.reply('⏳ Mengambil quote...');

        try {
            const response = await axios.get('https://api.lolhuman.xyz/api/random/quotes', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
                },
                timeout: 30000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mendapatkan quote: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `💬 *Random Quote*\n\n`;
            text += `_"${data.quote}"_\n\n`;
            text += `— *${data.by}*\n\n`;
            text += `🔄 Ketik !quote untuk quote lainnya`;

            msg.reply(text);
        } catch (error) {
            console.error('Error quote command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil quote');
        }
    }
};
