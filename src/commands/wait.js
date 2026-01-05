const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'wait',
    aliases: ['trace', 'whatanime', 'sauceanime'],
    description: 'Cari anime dari gambar (reverse image search)',
    usage: '/wait (reply ke gambar)',
    category: 'anime',
    async execute(msg, args) {
        // Check if message has quoted message with image
        if (!msg.hasQuotedMsg && !msg.hasMedia) {
            return msg.reply('❌ Reply ke gambar atau kirim gambar dengan caption:\n/wait\n\n💡 Bot akan mencari anime dari gambar tersebut');
        }

        await msg.reply('🔍 Mencari anime dari gambar...');

        try {
            let imageUrl;

            // Get image from quoted message or current message
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                if (!quotedMsg.hasMedia) {
                    return msg.reply('❌ Pesan yang di-reply harus berisi gambar!');
                }
                const media = await quotedMsg.downloadMedia();
                
                // Upload to temporary image hosting (imgbb, imgur, etc)
                // For now, we'll use a placeholder or direct base64
                // In production, upload to image host first
                return msg.reply('❌ Fitur ini memerlukan URL gambar online.\n\n💡 Gunakan gambar dari internet dengan format:\n/wait <url_gambar>');
            } else if (args.length > 0) {
                // Use URL from args
                imageUrl = args[0];
            } else {
                return msg.reply('❌ Berikan URL gambar atau reply ke gambar!');
            }

            const response = await axios.get('https://api.lolhuman.xyz/api/wait', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    img: imageUrl
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mencari anime: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `🎬 *Anime Found!*\n\n`;
            text += `📺 Title: ${data.title || data.anime || 'N/A'}\n`;
            text += `🎭 Japanese: ${data.title_japanese || data.japanese || 'N/A'}\n`;
            text += `📖 Episode: ${data.episode || 'N/A'}\n`;
            text += `⏰ Timestamp: ${data.at || data.timestamp || 'N/A'}\n`;
            text += `🎯 Similarity: ${data.similarity || 'N/A'}%\n`;
            
            if (data.mal_id) {
                text += `\n🔗 MyAnimeList: https://myanimelist.net/anime/${data.mal_id}`;
            }
            
            if (data.anilist_id) {
                text += `\n🔗 AniList: https://anilist.co/anime/${data.anilist_id}`;
            }

            // Send thumbnail if available
            if (data.thumbnail || data.image) {
                try {
                    const imageResponse = await axios.get(data.thumbnail || data.image, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    const imageBuffer = Buffer.from(imageResponse.data);
                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'anime.jpg');
                    await msg.reply(media, undefined, { caption: text });
                } catch (err) {
                    msg.reply(text);
                }
            } else {
                msg.reply(text);
            }
        } catch (error) {
            console.error('Error wait command:', error);
            msg.reply('❌ Terjadi kesalahan saat mencari anime.\n\n💡 Pastikan gambar jelas dan dari scene anime.');
        }
    }
};
