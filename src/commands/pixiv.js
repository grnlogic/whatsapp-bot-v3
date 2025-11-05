const axios = require('axios');
const cheerio = require('cheerio');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Command untuk mencari gambar dari Pixiv berdasarkan tag/karakter
 * Usage: !pixiv <nama karakter/tag>
 * Example: !pixiv miku, !pixiv anime girl
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
                '• !pixiv anime girl\n' +
                '• !pixiv genshin impact'
            );
            return;
        }

        const searchQuery = args.join(' ');
        
        // Kirim pesan loading
        const loadingMsg = await message.reply(`🔍 Mencari gambar *${searchQuery}* di Pixiv...\n⏳ Mohon tunggu sebentar...`);

        try {
            // Cara 1: Menggunakan API Pixiv (memerlukan proxy atau VPN jika diblokir)
            // Encode query untuk URL
            const encodedQuery = encodeURIComponent(searchQuery);
            
            // Setup headers untuk menghindari blocking
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.pixiv.net/',
            };

            // Cara alternatif: Gunakan API publik atau scraping ringan
            // Karena Pixiv memerlukan autentikasi, kita akan gunakan pendekatan alternatif
            
            // Option 1: Gunakan API Danbooru (lebih mudah diakses)
            const danbooruUrl = `https://danbooru.donmai.us/posts.json?tags=${encodedQuery}&limit=1`;
            const danbooruResponse = await axios.get(danbooruUrl, { 
                timeout: 15000,
                headers: headers 
            });

            if (danbooruResponse.data && danbooruResponse.data.length > 0) {
                const post = danbooruResponse.data[0];
                let imageUrl = post.file_url || post.large_file_url || post.preview_file_url;
                
                // Jika URL relatif, tambahkan domain
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = 'https://danbooru.donmai.us' + imageUrl;
                }

                if (imageUrl) {
                    // Download gambar
                    const imageResponse = await axios.get(imageUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: headers
                    });

                    // Konversi ke base64
                    const base64Image = Buffer.from(imageResponse.data).toString('base64');
                    const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
                    
                    // Buat media message
                    const media = new MessageMedia(mimeType, base64Image);
                    
                    // Kirim gambar dengan caption
                    await message.reply(media, null, {
                        caption: `🎨 *Hasil pencarian: ${searchQuery}*\n\n` +
                                `📊 *Info:*\n` +
                                `• Rating: ${post.rating || 'N/A'}\n` +
                                `• Score: ${post.score || 'N/A'}\n` +
                                `• Artist: ${post.tag_string_artist || 'Unknown'}\n\n` +
                                `🔗 Source: Danbooru\n` +
                                `💡 Tip: Gunakan tag bahasa Inggris untuk hasil lebih baik`
                    });

                    // Hapus pesan loading
                    try {
                        await loadingMsg.delete();
                    } catch (e) {
                        // Ignore jika gagal hapus
                    }
                    
                    console.log(`✅ Pixiv command berhasil untuk query: ${searchQuery}`);
                    return;
                }
            }

            // Jika tidak ada hasil dari Danbooru, coba API lain
            // Option 2: Gelbooru API
            const gelbooruUrl = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodedQuery}&limit=1`;
            const gelbooruResponse = await axios.get(gelbooruUrl, {
                timeout: 15000,
                headers: headers
            });

            if (gelbooruResponse.data && gelbooruResponse.data.post && gelbooruResponse.data.post.length > 0) {
                const post = gelbooruResponse.data.post[0];
                const imageUrl = post.file_url;

                if (imageUrl) {
                    // Download gambar
                    const imageResponse = await axios.get(imageUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: headers
                    });

                    // Konversi ke base64
                    const base64Image = Buffer.from(imageResponse.data).toString('base64');
                    const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
                    
                    // Buat media message
                    const media = new MessageMedia(mimeType, base64Image);
                    
                    // Kirim gambar dengan caption
                    await message.reply(media, null, {
                        caption: `🎨 *Hasil pencarian: ${searchQuery}*\n\n` +
                                `📊 *Info:*\n` +
                                `• Rating: ${post.rating || 'N/A'}\n` +
                                `• Score: ${post.score || 'N/A'}\n` +
                                `• Dimensions: ${post.width}x${post.height}\n\n` +
                                `🔗 Source: Gelbooru\n` +
                                `💡 Tip: Gunakan tag bahasa Inggris untuk hasil lebih baik`
                    });

                    // Hapus pesan loading
                    try {
                        await loadingMsg.delete();
                    } catch (e) {
                        // Ignore jika gagal hapus
                    }
                    
                    console.log(`✅ Pixiv command berhasil untuk query: ${searchQuery}`);
                    return;
                }
            }

            // Jika semua gagal
            await loadingMsg.edit(
                `❌ *Tidak ditemukan gambar untuk: ${searchQuery}*\n\n` +
                `💡 *Tips:*\n` +
                `• Gunakan tag dalam bahasa Inggris\n` +
                `• Coba kata kunci yang lebih spesifik\n` +
                `• Contoh: "hatsune_miku", "anime_girl", "genshin_impact"\n\n` +
                `🔄 Coba lagi dengan kata kunci berbeda!`
            );

        } catch (fetchError) {
            console.error('Error fetching image:', fetchError.message);
            
            let errorMessage = '❌ *Gagal mengambil gambar*\n\n';
            
            if (fetchError.code === 'ECONNABORTED' || fetchError.message.includes('timeout')) {
                errorMessage += '⏱️ *Timeout:* Koneksi terlalu lama\n💡 Coba lagi dalam beberapa saat';
            } else if (fetchError.response && fetchError.response.status === 429) {
                errorMessage += '🚫 *Rate limit:* Terlalu banyak request\n💡 Tunggu beberapa menit sebelum mencoba lagi';
            } else if (fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
                errorMessage += '🌐 *Koneksi gagal:* Tidak dapat mengakses API\n💡 Periksa koneksi internet Anda';
            } else {
                errorMessage += `⚠️ Error: ${fetchError.message}\n💡 Coba lagi nanti`;
            }
            
            await loadingMsg.edit(errorMessage);
        }

    } catch (error) {
        console.error('Error in pixiv command:', error);
        await message.reply(
            '❌ *Terjadi kesalahan!*\n\n' +
            `⚠️ Error: ${error.message}\n\n` +
            '💡 Silakan coba lagi nanti.'
        );
    }
}

module.exports = pixivCommand;
