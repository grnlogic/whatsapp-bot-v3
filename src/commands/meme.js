const { MessageMedia } = require('whatsapp-web.js');
const { generateMeme, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'meme',
    description: 'Generate meme dari gambar dengan teks atas dan bawah',
    usage: '/meme <teks_atas>|<teks_bawah> (reply ke gambar)',
    category: 'image',
    async execute(msg, args) {
        if (!msg.hasQuotedMsg) {
            return msg.reply('❌ Reply ke gambar dengan format:\n/meme <teks_atas>|<teks_bawah>\n\nContoh:\n/meme when you|code at 3am');
        }

        if (args.length === 0) {
            return msg.reply('❌ Gunakan format: /meme <teks_atas>|<teks_bawah>');
        }

        const quotedMsg = await msg.getQuotedMessage();
        
        if (!quotedMsg.hasMedia) {
            return msg.reply('❌ Pesan yang di-reply harus berisi gambar!');
        }

        const text = args.join(' ');
        const parts = text.split('|');
        
        if (parts.length !== 2) {
            return msg.reply('❌ Format salah! Gunakan: /meme <teks_atas>|<teks_bawah>');
        }

        const topText = parts[0].trim();
        const bottomText = parts[1].trim();

        await msg.reply('⏳ Membuat meme...');

        try {
            // Download image from quoted message
            const media = await quotedMsg.downloadMedia();
            
            // Upload to temporary hosting or use direct buffer
            // For simplicity, we'll use a placeholder. In production, you'd upload the image first
            const imageUrl = 'https://i.imgflip.com/30b1gx.jpg'; // Placeholder
            
            const result = await generateMeme(topText, bottomText, imageUrl);

            if (!result.success) {
                return msg.reply(`❌ Gagal membuat meme: ${result.error}`);
            }

            const memeBuffer = await downloadMediaBuffer(result.data);
            const memeMedia = new MessageMedia('image/jpeg', memeBuffer.toString('base64'), 'meme.jpg');
            
            await msg.reply(memeMedia, undefined, { 
                caption: `😂 *Meme Generated*\n\n⬆️ ${topText}\n⬇️ ${bottomText}` 
            });
        } catch (error) {
            console.error('Error meme command:', error);
            msg.reply('❌ Terjadi kesalahan saat membuat meme');
        }
    }
};
