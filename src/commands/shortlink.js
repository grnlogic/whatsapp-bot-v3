const { createShortLink } = require('../services/lolhumanService');

module.exports = {
    name: 'shortlink',
    aliases: ['short', 'tinyurl'],
    description: 'Persingkat URL panjang',
    usage: '/shortlink <url>',
    category: 'utility',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /shortlink <url>\n\nContoh:\n/shortlink https://www.example.com/very/long/url');
        }

        const url = args[0];

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return msg.reply('❌ URL harus dimulai dengan http:// atau https://');
        }

        await msg.reply('🔗 Mempersingkat URL...');

        try {
            const result = await createShortLink(url);

            if (!result.success) {
                return msg.reply(`❌ Gagal mempersingkat: ${result.error}`);
            }

            let response = `✅ *URL Dipersingkat*\n\n`;
            response += `🔗 Original: ${url}\n\n`;
            response += `✂️ Short: ${result.data}`;

            msg.reply(response);
        } catch (error) {
            console.error('Error shortlink command:', error);
            msg.reply('❌ Terjadi kesalahan saat mempersingkat URL');
        }
    }
};
