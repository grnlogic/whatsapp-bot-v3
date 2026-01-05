const { MessageMedia } = require('whatsapp-web.js');
const { downloadTikTok, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'tiktok',
    description: 'Download video TikTok tanpa watermark',
    usage: '/tiktok <url>',
    category: 'downloader',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /tiktok <url>\n\nContoh:\n/tiktok https://vt.tiktok.com/xxx');
        }

        const url = args[0];

        if (!url.includes('tiktok.com')) {
            return msg.reply('❌ URL harus dari TikTok!');
        }

        await msg.reply('⏳ Mengunduh video TikTok...');

        try {
            const result = await downloadTikTok(url);

            if (!result.success) {
                return msg.reply(`❌ Gagal mengunduh: ${result.error}`);
            }

            const { title, author, video } = result.data;
            
            let caption = `✅ *TikTok Video*\n\n`;
            caption += `👤 Author: ${author?.nickname || 'Unknown'}\n`;
            caption += `📝 ${title || 'No title'}\n`;
            caption += `🔗 ${url}`;

            // Download video tanpa watermark
            const videoUrl = video?.noWatermark || video?.watermark;
            if (videoUrl) {
                const videoBuffer = await downloadMediaBuffer(videoUrl);
                const media = new MessageMedia('video/mp4', videoBuffer.toString('base64'), 'tiktok.mp4');
                await msg.reply(media, undefined, { caption });
            } else {
                msg.reply('❌ Video tidak tersedia');
            }
        } catch (error) {
            console.error('Error tiktok command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengunduh video TikTok');
        }
    }
};
