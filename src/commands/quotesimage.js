const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'quotesimage',
    aliases: ['quoteimg', 'imgquote'],
    description: 'Random quote dalam bentuk image',
    usage: '!quotesimage',
    category: 'fun',
    execute: async (msg, args) => {
        const tempDir = path.join(__dirname, '../temp');
        let tempFilePath = null;

        try {
            await msg.reply('🎨 Membuat quote image...');

            // Pastikan temp directory exists
            try {
                await fs.access(tempDir);
            } catch {
                await fs.mkdir(tempDir, { recursive: true });
            }

            // Call API - langsung download image
            const response = await axios.get('https://api.lolhuman.xyz/api/random/quotesimage', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
                },
                responseType: 'arraybuffer',
                timeout: 60000
            });

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `quote_${timestamp}.jpg`;
            tempFilePath = path.join(tempDir, filename);

            // Save to temp folder
            await fs.writeFile(tempFilePath, Buffer.from(response.data));
            console.log(`💾 Quote image saved to: ${tempFilePath}`);

            // Get file size for info
            const stats = await fs.stat(tempFilePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            // Read file and create MessageMedia
            const imageBuffer = await fs.readFile(tempFilePath);
            const base64Image = imageBuffer.toString('base64');
            const media = new MessageMedia('image/jpeg', base64Image, filename);

            // Send image with caption
            const caption = 
                `📜 *Quote Image*\n\n` +
                `📏 Size: ${fileSizeKB} KB\n` +
                `🔗 Source: LoLHuman API\n\n` +
                `🔄 Ketik !quotesimage untuk quote lainnya`;

            await msg.reply(media, undefined, { caption });
            console.log(`✅ Quote image sent successfully`);

            // Delete temp file after sending
            await fs.unlink(tempFilePath);
            console.log(`🗑️ Temp file deleted: ${tempFilePath}`);

        } catch (error) {
            console.error('Error in quotesimage command:', error);

            // Clean up temp file if exists
            if (tempFilePath) {
                try {
                    await fs.unlink(tempFilePath);
                    console.log(`🗑️ Temp file cleaned up after error: ${tempFilePath}`);
                } catch (cleanupError) {
                    console.error('Failed to cleanup temp file:', cleanupError);
                }
            }

            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return msg.reply('❌ Request timeout. Coba lagi.');
            }

            if (error.response) {
                return msg.reply(`❌ API Error: ${error.response.status}`);
            }

            msg.reply('❌ Terjadi kesalahan. Coba lagi nanti.');
        }
    }
};
