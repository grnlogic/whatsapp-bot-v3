const axios = require('axios');
const { checkNSFWAccess, getNSFWDeniedMessage } = require('./nsfwConfig');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'nhentai',
    aliases: ['nh', 'doujin'],
    description: '[18+] Get nhentai doujin info by kode nuklir (nuclear code)',
    usage: '!nhentai <kode nuklir>',
    category: 'nsfw',
    async execute(msg, args) {
        // Check NSFW access
        const hasAccess = await checkNSFWAccess(msg);
        if (!hasAccess) {
            return msg.reply(getNSFWDeniedMessage());
        }

        if (args.length === 0) {
            return msg.reply('❌ Gunakan: !nhentai <kode nuklir>\n\n🔞 *WARNING: Konten 18+*\n💣 Kode nuklir = 6 digit angka nhentai\n\nContoh:\n!nhentai 344253');
        }

        const code = args[0];

        if (!/^\d+$/.test(code)) {
            return msg.reply('❌ Kode nuklir harus berupa angka!');
        }

        await msg.reply('⏳ Mengambil data... 🔞');

        try {
            const response = await axios.get(`https://api.lolhuman.xyz/api/nhentai/${code}`, {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mengambil data: ${response.data.message}`);
            }

            const data = response.data.result;
            
            let text = `🔞 *nhentai*\n💣 Kode Nuklir: *${code}*\n\n`;
            
            // Title
            if (data.title_native) {
                text += `📝 *Title:*\n${data.title_native}\n\n`;
            }
            if (data.title_romaji && data.title_romaji !== data.title_native) {
                text += `🔤 *Romaji:*\n${data.title_romaji}\n\n`;
            }
            
            // Pages count
            if (data.image && Array.isArray(data.image)) {
                text += `📖 Pages: ${data.image.length}\n`;
            }
            
            // Read online link
            if (data.read) {
                text += `📱 Read: ${data.read}\n`;
            }
            text += `\n`;
            
            // Tags
            if (data.tags && data.tags.length > 0) {
                text += `🏷️ *Tags:*\n`;
                const displayTags = data.tags.slice(0, 15);
                text += displayTags.join(', ');
                if (data.tags.length > 15) {
                    text += `... (+${data.tags.length - 15} more)`;
                }
                text += `\n\n`;
            }
            
            text += `⚠️ *WARNING: Konten 18+ - Hanya untuk dewasa*`;

            // Send cover image (first image from array)
            if (data.image && Array.isArray(data.image) && data.image.length > 0) {
                try {
                    const coverUrl = data.image[0];
                    const imageResponse = await axios.get(coverUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    const imageBuffer = Buffer.from(imageResponse.data);
                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'), 'cover.jpg');
                    await msg.reply(media, undefined, { caption: text });
                } catch (err) {
                    console.warn('Failed to send cover image:', err.message);
                    msg.reply(text);
                }
            } else {
                msg.reply(text);
            }
        } catch (error) {
            console.error('Error nhentai command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil data');
        }
    }
};
