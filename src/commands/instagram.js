const { MessageMedia } = require('whatsapp-web.js');
const { downloadInstagram, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'instagram',
    aliases: ['ig', 'igdl'],
    description: 'Download Instagram post/story/reels',
    usage: '/instagram <url>',
    category: 'downloader',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /instagram <url>\n\nContoh:\n/instagram https://www.instagram.com/p/xxx');
        }

        const url = args[0];

        if (!url.includes('instagram.com')) {
            return msg.reply('❌ URL harus dari Instagram!');
        }

        await msg.reply('⏳ Mengunduh dari Instagram...');

        try {
            const result = await downloadInstagram(url);

            if (!result.success) {
                return msg.reply(`❌ Gagal mengunduh: ${result.error}`);
            }

            const mediaUrls = Array.isArray(result.data) ? result.data : [result.data];
            
            let caption = `✅ *Instagram Media*\n\n`;
            caption += `📷 Total: ${mediaUrls.length} media\n`;
            caption += `🔗 ${url}`;

            for (let i = 0; i < mediaUrls.length && i < 5; i++) {
                const mediaUrl = mediaUrls[i];
                try {
                    const buffer = await downloadMediaBuffer(mediaUrl);
                    
                    // Detect media type
                    const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');
                    const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
                    const filename = isVideo ? `ig_${i + 1}.mp4` : `ig_${i + 1}.jpg`;
                    
                    const media = new MessageMedia(mimeType, buffer.toString('base64'), filename);
                    await msg.reply(media, undefined, { caption: i === 0 ? caption : '' });
                } catch (err) {
                    console.error(`Error downloading media ${i + 1}:`, err);
                }
            }

            if (mediaUrls.length > 5) {
                msg.reply(`ℹ️ Hanya menampilkan 5 media pertama dari ${mediaUrls.length} total media`);
            }
        } catch (error) {
            console.error('Error instagram command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengunduh dari Instagram');
        }
    }
};
