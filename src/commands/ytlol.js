const { MessageMedia } = require('whatsapp-web.js');
const { downloadYoutube, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'ytlol',
    description: 'Download YouTube video/audio menggunakan LoLHuman API',
    usage: '/ytlol <url> [video|audio]',
    category: 'downloader',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /ytlol <url> [video|audio]\n\nContoh:\n/ytlol https://youtu.be/xxx video\n/ytlol https://youtu.be/xxx audio');
        }

        const url = args[0];
        const type = args[1]?.toLowerCase() || 'audio';

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return msg.reply('❌ URL harus dari YouTube!');
        }

        if (type !== 'video' && type !== 'audio') {
            return msg.reply('❌ Tipe harus "video" atau "audio"');
        }

        await msg.reply('⏳ Mengunduh dari YouTube...');

        try {
            const result = await downloadYoutube(url);

            if (!result.success) {
                return msg.reply(`❌ Gagal mengunduh: ${result.error}`);
            }

            const { title, thumbnail, link } = result.data;
            
            let caption = `✅ *${title}*\n\n`;
            caption += `🔗 Link: ${url}`;

            if (type === 'audio') {
                const audioUrl = link.audio['128kbps'] || link.audio['320kbps'];
                if (audioUrl) {
                    const audioBuffer = await downloadMediaBuffer(audioUrl);
                    const media = new MessageMedia('audio/mpeg', audioBuffer.toString('base64'), `${title}.mp3`);
                    await msg.reply(media, undefined, { caption });
                } else {
                    msg.reply('❌ Audio tidak tersedia');
                }
            } else {
                const videoUrl = link.video['360p'] || link.video['480p'] || link.video['720p'];
                if (videoUrl) {
                    const videoBuffer = await downloadMediaBuffer(videoUrl);
                    const media = new MessageMedia('video/mp4', videoBuffer.toString('base64'), `${title}.mp4`);
                    await msg.reply(media, undefined, { caption });
                } else {
                    msg.reply('❌ Video tidak tersedia');
                }
            }
        } catch (error) {
            console.error('Error ytlol command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengunduh video');
        }
    }
};
