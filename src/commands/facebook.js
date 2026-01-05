const { MessageMedia } = require('whatsapp-web.js');
const { downloadFacebook, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    description: 'Download Facebook video',
    usage: '/facebook <url>',
    category: 'downloader',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /facebook <url>\n\nContoh:\n/facebook https://www.facebook.com/xxx/videos/xxx');
        }

        const url = args[0];

        if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
            return msg.reply('❌ URL harus dari Facebook!');
        }

        await msg.reply('⏳ Mengunduh dari Facebook...');

        try {
            const result = await downloadFacebook(url);

            if (!result.success) {
                return msg.reply(`❌ Gagal mengunduh: ${result.error}`);
            }

            const { title, video } = result.data;
            
            let caption = `✅ *Facebook Video*\n\n`;
            caption += `📝 ${title || 'No title'}\n`;
            caption += `🔗 ${url}`;

            // Prefer HD quality
            const videoUrl = video?.hd || video?.sd;
            if (videoUrl) {
                const videoBuffer = await downloadMediaBuffer(videoUrl);
                const media = new MessageMedia('video/mp4', videoBuffer.toString('base64'), 'facebook.mp4');
                await msg.reply(media, undefined, { caption });
            } else {
                msg.reply('❌ Video tidak tersedia');
            }
        } catch (error) {
            console.error('Error facebook command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengunduh dari Facebook');
        }
    }
};
