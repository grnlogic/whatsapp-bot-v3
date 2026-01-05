const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'wallpaper',
    aliases: ['wall', 'wp'],
    description: 'Search wallpaper images by keyword',
    usage: '!wallpaper <keyword>',
    category: 'image',
    execute: async (msg, args) => {
        if (args.length === 0) {
            return msg.reply(
                '❌ Gunakan: !wallpaper <keyword>\n\n' +
                '🖼️ Search wallpaper berdasarkan kata kunci\n\n' +
                'Contoh:\n' +
                '!wallpaper anime\n' +
                '!wallpaper genshin impact\n' +
                '!wallpaper nature\n' +
                '!wall cyberpunk'
            );
        }

        const query = args.join(' ');
        const tempDir = path.join(__dirname, '../../temp');
        let tempFilePath = null;

        await msg.reply(`🔍 Mencari wallpaper "${query}"...`);

        try {
            // Pastikan temp directory exists
            try {
                await fs.access(tempDir);
            } catch {
                await fs.mkdir(tempDir, { recursive: true });
            }

            // Call LoLHuman Wallpaper API
            const response = await axios.get('https://api.lolhuman.xyz/api/wallpaper', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    query: query
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mencari wallpaper: ${response.data.message}`);
            }

            const imageUrl = response.data.result;

            if (!imageUrl) {
                return msg.reply(`❌ Tidak ada wallpaper ditemukan untuk: "${query}"\n\n💡 Coba kata kunci lain`);
            }

            console.log(`📥 Downloading wallpaper from: ${imageUrl}`);

            // Download image to temp folder
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // Generate unique filename
            const timestamp = Date.now();
            const extension = path.extname(imageUrl.split('?')[0]) || '.jpg';
            const safeQuery = query.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
            const filename = `wallpaper_${safeQuery}_${timestamp}${extension}`;
            tempFilePath = path.join(tempDir, filename);

            // Save to temp folder
            await fs.writeFile(tempFilePath, Buffer.from(imageResponse.data));
            console.log(`💾 Wallpaper saved to: ${tempFilePath}`);

            // Get file size for info
            const stats = await fs.stat(tempFilePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            // Read file and create MessageMedia
            const imageBuffer = await fs.readFile(tempFilePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';
            const media = new MessageMedia(mimeType, base64Image, filename);

            // Send image with caption
            const caption = 
                `🖼️ *Wallpaper*\n\n` +
                `🔍 Query: ${query}\n` +
                `📏 Size: ${fileSizeKB} KB\n` +
                `🔗 Source: LoLHuman API\n\n` +
                `💡 Tip: Download untuk kualitas full HD`;

            await msg.reply(media, undefined, { caption });
            console.log(`✅ Wallpaper sent successfully`);

            // Delete temp file after sending
            await fs.unlink(tempFilePath);
            console.log(`🗑️ Temp file deleted: ${tempFilePath}`);

        } catch (error) {
            console.error('Error in wallpaper command:', error);

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
                return msg.reply('❌ Request timeout. Gambar terlalu besar atau koneksi lambat, coba lagi.');
            }

            if (error.response) {
                return msg.reply(`❌ API Error: ${error.response.status}\n${error.response.data?.message || 'Unknown error'}`);
            }

            msg.reply('❌ Terjadi kesalahan saat mengambil wallpaper. Coba lagi nanti.');
        }
    }
};
