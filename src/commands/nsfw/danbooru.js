const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { checkNSFWAccess, getNSFWDeniedMessage } = require('./nsfwConfig');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'danbooru',
    aliases: ['danb', 'danimg'],
    description: '[18+] Get random image from Danbooru by tag',
    usage: '!danbooru <tag>',
    category: 'nsfw',
    async execute(msg, args) {
        // Check NSFW access
        const hasAccess = await checkNSFWAccess(msg);
        if (!hasAccess) {
            return msg.reply(getNSFWDeniedMessage());
        }

        if (args.length === 0) {
            return msg.reply(
                '❌ Gunakan: !danbooru <tag>\n\n' +
                '🔞 *WARNING: Konten 18+*\n' +
                '🎨 Dapatkan random image dari Danbooru\n\n' +
                'Contoh:\n' +
                '!danbooru azur_lane\n' +
                '!danbooru miku\n' +
                '!danbooru genshin_impact\n\n' +
                '💡 Gunakan underscore (_) untuk spasi'
            );
        }

        const query = args.join('_'); // Convert spaces to underscore
        const tempDir = path.join(__dirname, '../../../temp');
        let tempFilePath = null;

        await msg.reply(`🎨 Mengambil gambar "${query}"... 🔞`);

        try {
            // Pastikan temp directory exists
            try {
                await fs.access(tempDir);
            } catch {
                await fs.mkdir(tempDir, { recursive: true });
            }

            // Get image URL from API
            const response = await axios.get('https://api.lolhuman.xyz/api/danbooru', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    query: query
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return msg.reply(`❌ Gagal mengambil gambar: ${response.data.message}`);
            }

            const imageUrl = response.data.result;

            if (!imageUrl) {
                return msg.reply(`❌ Tidak ada gambar ditemukan untuk tag: "${query}"\n\n💡 Coba tag lain`);
            }

            // Download image to temp folder
            console.log(`📥 Downloading image from: ${imageUrl}`);
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
            const filename = `danbooru_${query}_${timestamp}${extension}`;
            tempFilePath = path.join(tempDir, filename);

            // Save to temp folder
            await fs.writeFile(tempFilePath, Buffer.from(imageResponse.data));
            console.log(`💾 Image saved to: ${tempFilePath}`);

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
                `🎨 *Danbooru Image*\n\n` +
                `🏷️ Tag: ${query}\n` +
                `📏 Size: ${fileSizeKB} KB\n` +
                `🔗 Source: Danbooru\n\n` +
                `⚠️ *WARNING: Konten 18+ - Hanya untuk dewasa*`;

            await msg.reply(media, undefined, { caption });
            console.log(`✅ Image sent successfully`);

            // Delete temp file after sending
            await fs.unlink(tempFilePath);
            console.log(`🗑️ Temp file deleted: ${tempFilePath}`);

        } catch (error) {
            console.error('Error in danbooru command:', error);

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

            msg.reply('❌ Terjadi kesalahan saat mengambil gambar. Coba lagi nanti.');
        }
    }
};
