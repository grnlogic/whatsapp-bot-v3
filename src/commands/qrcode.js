const { MessageMedia } = require('whatsapp-web.js');
const { generateQRCode, downloadMediaBuffer } = require('../services/lolhumanService');

module.exports = {
    name: 'qrcode',
    aliases: ['qr'],
    description: 'Generate QR Code dari teks',
    usage: '/qrcode <teks>',
    category: 'image',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /qrcode <teks>\n\nContoh:\n/qrcode https://google.com\n/qrcode WhatsApp Bot');
        }

        const text = args.join(' ');
        await msg.reply('⏳ Membuat QR Code...');

        try {
            // QR Code API returns image directly, not JSON
            const axios = require('axios');
            const imageResponse = await axios.get(`https://api.lolhuman.xyz/api/qrcode`, {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    text: text
                },
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const imageBuffer = Buffer.from(imageResponse.data);
            const media = new MessageMedia('image/png', imageBuffer.toString('base64'), 'qrcode.png');
            
            await msg.reply(media, undefined, { 
                caption: `✅ QR Code untuk:\n${text}` 
            });
        } catch (error) {
            console.error('Error qrcode command:', error);
            msg.reply('❌ Terjadi kesalahan saat membuat QR Code');
        }
    }
};
