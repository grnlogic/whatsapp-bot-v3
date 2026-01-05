const axios = require('axios');

module.exports = {
    name: 'faktaunik',
    aliases: ['fakta', 'fact'],
    description: 'Random fakta unik',
    usage: '!faktaunik',
    category: 'fun',
    execute: async (msg, args) => {
        try {
            await msg.reply('🔍 Mencari fakta unik...');

            const response = await axios.get('https://api.lolhuman.xyz/api/random/faktaunik', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
                },
                timeout: 15000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mengambil fakta: ${response.data.message}`);
            }

            const fakta = response.data.result;

            const message = 
                `💡 *Fakta Unik*\n\n` +
                `${fakta}\n\n` +
                `🔄 Ketik !faktaunik untuk fakta lainnya`;

            await msg.reply(message);

        } catch (error) {
            console.error('Error in faktaunik command:', error);

            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return msg.reply('❌ Request timeout. Coba lagi.');
            }

            if (error.response) {
                return msg.reply(`❌ API Error: ${error.response.status}`);
            }

            msg.reply('❌ Terjadi kesalahan. Coba lagi nanti.');
        }
    }
};
