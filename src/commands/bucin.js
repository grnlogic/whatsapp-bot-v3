const axios = require('axios');

module.exports = {
    name: 'bucin',
    aliases: ['katacinta', 'romantis'],
    description: 'Random kata-kata bucin/romantis',
    usage: '!bucin',
    category: 'fun',
    execute: async (msg, args) => {
        try {
            await msg.reply('💕 Mencari kata-kata bucin...');

            const response = await axios.get('https://api.lolhuman.xyz/api/random/bucin', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
                },
                timeout: 15000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mengambil kata-kata bucin: ${response.data.message}`);
            }

            const bucin = response.data.result;

            const message = 
                `💕 *Kata-Kata Bucin*\n\n` +
                `_"${bucin}"_\n\n` +
                `🔄 Ketik !bucin untuk kata lainnya`;

            await msg.reply(message);

        } catch (error) {
            console.error('Error in bucin command:', error);

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
