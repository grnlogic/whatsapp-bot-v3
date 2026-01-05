const { MessageMedia } = require('whatsapp-web.js');
const { downloadTwitter, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'twitter',
    aliases: ['twt', 'x'],
    description: 'Download Twitter/X video',
    usage: '/twitter <url>',
    category: 'downloader',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /twitter <url>\n\nContoh:\n/twitter https://twitter.com/xxx/status/xxx');
        }

        const url = args[0];

        if (!url.includes('twitter.com') && !url.includes('x.com')) {
            return msg.reply('❌ URL harus dari Twitter/X!');
        }

        await msg.reply('⏳ Mengunduh dari Twitter...');

        try {
            const result = await downloadTwitter(url);

            if (!result.success) {
                return msg.reply(`❌ Gagal mengunduh: ${result.error}`);
            }

            const { description, video } = result.data;
            
            let caption = `✅ *Twitter Video*\n\n`;
            caption += `📝 ${description || 'No description'}\n`;
            caption += `🔗 ${url}`;

            if (video && video.length > 0) {
                const videoUrl = video[0]; // Get highest quality
                const videoBuffer = await downloadMediaBuffer(videoUrl);
                const media = new MessageMedia('video/mp4', videoBuffer.toString('base64'), 'twitter.mp4');
                await msg.reply(media, undefined, { caption });
            } else {
                msg.reply('❌ Video tidak ditemukan');
            }
        } catch (error) {
            console.error('Error twitter command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengunduh dari Twitter');
        }
    }
};
