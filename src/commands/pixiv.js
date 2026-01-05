const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Command untuk mencari gambar dari Pixiv berdasarkan tag/karakter
 * Usage: !pixiv <nama karakter/tag>
 * Example: !pixiv miku, !pixiv anime girl
 * Note: Konten bisa NSFW, jadi tidak perlu NSFW check terpisah tapi user harus aware
 * 
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function pixivCommand(client, message, args) {
    try {
        // Validasi: Pastikan ada input
        if (args.length === 0) {
            await message.reply(
                '❌ *Format salah!*\n\n' +
                '📝 *Cara pakai:*\n' +
                '!pixiv <nama karakter/tag>\n\n' +
                '💡 *Contoh:*\n' +
                '• !pixiv miku\n' +
                '• !pixiv genshin impact\n' +
                '• !pixiv loli kawaii\n\n' +
                '⚠️ *Note:* Hasil bisa mengandung konten NSFW'
            );
            return;
        }

        const searchQuery = args.join(' ');
        const tempDir = path.join(__dirname, '../../temp');
        let tempFilePath = null;
        
        // Kirim pesan loading
        await message.reply(`🔍 Mencari gambar *${searchQuery}* di Pixiv...\n⏳ Mohon tunggu sebentar...`);

        try {
            // Pastikan temp directory exists
            try {
                await fs.access(tempDir);
            } catch {
                await fs.mkdir(tempDir, { recursive: true });
            }

            // Call LoLHuman Pixiv API
            const response = await axios.get('https://api.lolhuman.xyz/api/pixiv', {
                params: {
                    apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f',
                    query: searchQuery
                },
                timeout: 60000
            });

            if (response.data.status !== 200) {
                return message.reply(`❌ Gagal mencari gambar: ${response.data.message}`);
            }

            const results = response.data.result;

            if (!results || results.length === 0) {
                return message.reply(`❌ Tidak ada gambar ditemukan untuk: "${searchQuery}"\n\n💡 Coba kata kunci lain`);
            }

            // Pilih random image dari hasil (untuk variasi)
            const randomIndex = Math.floor(Math.random() * Math.min(results.length, 10)); // Random dari 10 pertama
            const selectedImage = results[randomIndex];

            console.log(`📥 Downloading Pixiv image: ${selectedImage.title} (ID: ${selectedImage.id})`);

            // Download image to temp folder
            const imageResponse = await axios.get(selectedImage.image, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.pixiv.net/'
                }
            });

            // Generate unique filename
            const timestamp = Date.now();
            const extension = '.jpg'; // Pixiv images usually jpg
            const safeQuery = searchQuery.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
            const filename = `pixiv_${safeQuery}_${timestamp}${extension}`;
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
            const media = new MessageMedia('image/jpeg', base64Image, filename);

            // Send image with caption
            const caption = 
                `🎨 *Pixiv Image*\n\n` +
                `📝 Title: ${selectedImage.title}\n` +
                `🆔 ID: ${selectedImage.id}\n` +
                `🔍 Query: ${searchQuery}\n` +
                `📏 Size: ${fileSizeKB} KB\n` +
                `📊 Found: ${results.length} results\n\n` +
                `🔗 Source: Pixiv\n` +
                `⚠️ *Note:* Hasil bisa mengandung konten NSFW`;

            await message.reply(media, null, { caption });
            console.log(`✅ Pixiv image sent successfully`);

            // Delete temp file after sending
            await fs.unlink(tempFilePath);
            console.log(`🗑️ Temp file deleted: ${tempFilePath}`);

        } catch (error) {
            console.error('Error in pixiv command:', error);

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
                return message.reply('❌ Request timeout. Gambar terlalu besar atau koneksi lambat, coba lagi.');
            }

            if (error.response) {
                return message.reply(`❌ API Error: ${error.response.status}\n${error.response.data?.message || 'Unknown error'}`);
            }

            message.reply('❌ Terjadi kesalahan saat mengambil gambar. Coba lagi nanti.');
        }

    } catch (error) {
        console.error('Error in pixiv command:', error);
        await message.reply(
            '❌ *Terjadi kesalahan!*\n\n' +
            `📝 Detail: ${error.message}\n\n` +
            '💡 Coba lagi dalam beberapa saat'
        );
    }
}

module.exports = pixivCommand;

