const { getRandomFact } = require('../services/lolhumanService');

module.exports = {
    name: 'fact',
    aliases: ['randomfact', 'fakta'],
    description: 'Dapatkan fakta random',
    usage: '/fact',
    category: 'fun',
    async execute(msg, args) {
        await msg.reply('⏳ Mengambil fakta random...');

        try {
            const result = await getRandomFact();

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan fakta: ${result.error}`);
            }

            let response = `💡 *Random Fact*\n\n`;
            response += result.data;

            msg.reply(response);
        } catch (error) {
            console.error('Error fact command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil fakta');
        }
    }
};
