let ytdl;
try {
    ytdl = require('@distube/ytdl-core');
    console.log('[YTMP3] Using @distube/ytdl-core');
} catch (error) {
    try {
        ytdl = require('ytdl-core');
        console.log('[YTMP3] Using ytdl-core');
    } catch (fallbackError) {
        console.error('[YTMP3] Both ytdl libraries failed to load:', fallbackError);
        ytdl = null;
    }
}

const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Command untuk download audio MP3 dari YouTube
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Argumen command
 */
async function ytmp3Command(client, message, args) {
    // Check if ytdl is available
    if (!ytdl) {
        return message.reply(
            '❌ *Library YouTube downloader tidak tersedia*\n\n' +
            '💡 Silakan install ulang dependencies:\n' +
            '```npm install @distube/ytdl-core```'
        );
    }

    try {
        // Cek apakah ada URL yang diberikan
        if (args.length === 0) {
            const helpText = 
                '🎵 *Download Audio MP3 dari YouTube*\n\n' +
                '*Cara Penggunaan:*\n' +
                '!ytmp3 [url]\n' +
                '!mp3 [url]\n\n' +
                '*Contoh:*\n' +
                '!ytmp3 https://youtu.be/xxx\n' +
                '!mp3 https://www.youtube.com/watch?v=xxx\n\n' +
                '⚠️ *Catatan:*\n' +
                '• Hanya audio (tanpa video)\n' +
                '• Kualitas audio terbaik\n' +
                '• Maksimal ~60MB\n' +
                '• Proses memakan waktu';
            
            await message.reply(helpText);
            return;
        }

        const url = args[0];

        // Validate URL
        if (!ytdl.validateURL(url)) {
            await message.reply(
                '❌ *URL YouTube tidak valid!*\n\n' +
                '💡 Pastikan URL dari YouTube:\n' +
                '• youtube.com/watch?v=xxx\n' +
                '• youtu.be/xxx\n' +
                '• youtube.com/shorts/xxx'
            );
            return;
        }

        // Kirim pesan loading
        await message.reply(
            '🎵 *Sedang memproses...*\n\n' +
            '⏳ Mengunduh audio dari YouTube...\n' +
            '⚠️ Mohon tunggu, proses ini memakan waktu.'
        );

        // Pastikan folder temp ada
        const tempFolder = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempFolder)) {
            fs.mkdirSync(tempFolder, { recursive: true });
        }

        // Get video info
        console.log('[YTMP3] Mendapatkan info video...');
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title
            .replace(/[<>:"/\\|?*【】\[\]]+/g, '') // Bersihkan karakter khusus
            .replace(/\s+/g, '_') // Ganti spasi dengan underscore
            .substring(0, 100); // Batasi panjang

        const duration = parseInt(info.videoDetails.lengthSeconds);
        const author = info.videoDetails.author?.name || 'YouTube';

        console.log(`[YTMP3] Mengunduh: ${title}`);
        console.log(`[YTMP3] Durasi: ${duration} detik`);

        // Cek durasi (maksimal 30 menit untuk audio)
        if (duration > 1800) {
            await message.reply(
                '⚠️ *Audio terlalu panjang!*\n\n' +
                `⏱️ Durasi: ${Math.floor(duration / 60)} menit\n` +
                `⚠️ Maksimal: 30 menit\n\n` +
                `💡 Coba audio yang lebih pendek`
            );
            return;
        }

        const filePath = path.join(tempFolder, `${title}.mp3`);

        // Update status
        await message.reply('📥 Download dimulai... Mohon sabar.');

        // Create audio stream
        const audioStream = ytdl(url, {
            quality: 'highestaudio',
            filter: 'audioonly',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        });

        // Save to file
        const writeStream = fs.createWriteStream(filePath);
        audioStream.pipe(writeStream);

        // Handle stream events
        writeStream.on('finish', async () => {
            console.log(`[YTMP3] Download selesai: ${filePath}`);

            try {
                // Check file size
                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                console.log(`[YTMP3] Ukuran file: ${fileSizeInMB.toFixed(2)} MB`);

                // WhatsApp limit check
                if (fileSizeInMB > 60) {
                    await message.reply(
                        `⚠️ *File terlalu besar!*\n\n` +
                        `📊 Ukuran: ${fileSizeInMB.toFixed(2)} MB\n` +
                        `⚠️ WhatsApp limit: 60 MB\n\n` +
                        `💡 Coba audio yang lebih pendek`
                    );
                    
                    // Delete oversized file
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    return;
                }

                // Send upload notification
                const chat = await message.getChat();
                await chat.sendMessage(
                    '⬆️ *Mengirim audio ke WhatsApp...*\n\n' +
                    '⏳ Mohon sabar, proses upload sedang berlangsung.'
                );

                // Read file and create media
                const fileBuffer = fs.readFileSync(filePath);
                const media = new MessageMedia(
                    'audio/mpeg',
                    fileBuffer.toString('base64'),
                    `${title}.mp3`
                );

                // Send as audio (try as voice message first)
                try {
                    await chat.sendMessage(media, {
                        sendMediaAsDocument: false,
                        caption: `🎵 *${info.videoDetails.title}*\n\n👤 ${author}\n⏱️ ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n\n✅ Download selesai!`
                    });
                    console.log(`[YTMP3] Sukses dikirim sebagai audio: ${title}`);
                } catch (audioError) {
                    // Fallback: send as document
                    console.log('[YTMP3] Mencoba kirim sebagai document...');
                    await chat.sendMessage(media, {
                        sendMediaAsDocument: true,
                        caption: `🎵 *${info.videoDetails.title}*\n\n👤 ${author}\n⏱️ ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n\n✅ Download selesai!`
                    });
                    console.log(`[YTMP3] Sukses dikirim sebagai document: ${title}`);
                }

                // Delete temp file after delay
                setTimeout(() => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`[YTMP3] File dihapus: ${filePath}`);
                    }
                }, 5000);

            } catch (sendError) {
                console.error('[YTMP3] Error mengirim file:', sendError);
                await message.reply(
                    '❌ *Gagal mengirim audio!*\n\n' +
                    '⚠️ Error: ' + sendError.message + '\n\n' +
                    '💡 File mungkin terlalu besar atau ada masalah dengan WhatsApp.'
                );
                
                // Clean up file
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        writeStream.on('error', (error) => {
            console.error('[YTMP3] File Stream Error:', error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            message.reply(
                '❌ *Gagal menyimpan audio!*\n\n' +
                '💡 Coba lagi dalam beberapa saat.'
            );
        });

        audioStream.on('error', (error) => {
            console.error('[YTMP3] Audio Stream Error:', error);
            
            let errorMessage = '❌ *Gagal mengunduh audio!*\n\n';
            
            if (error.message.includes('Could not extract functions')) {
                errorMessage += '⚠️ YouTube telah memperbarui sistemnya.\n💡 Coba lagi nanti atau gunakan link yang berbeda.';
            } else if (error.message.includes('Video unavailable')) {
                errorMessage += '⚠️ Video tidak tersedia atau bersifat private.';
            } else if (error.message.includes('Sign in')) {
                errorMessage += '⚠️ Video memerlukan login untuk diakses.';
            } else if (error.message.includes('copyright')) {
                errorMessage += '⚠️ Video dilindungi hak cipta dan tidak dapat diunduh.';
            } else {
                errorMessage += `⚠️ Error: ${error.message}\n\n💡 Pastikan link YouTube valid dan coba lagi.`;
            }
            
            message.reply(errorMessage);
        });

    } catch (error) {
        console.error('[YTMP3] Error:', error);

        let errorMessage = '❌ *Terjadi kesalahan!*\n\n';

        if (error.message.includes('Could not extract functions')) {
            errorMessage += '⚠️ YouTube mungkin telah memperbarui sistemnya.\n💡 Coba lagi nanti atau gunakan link yang berbeda.';
        } else if (error.message.includes('Video unavailable')) {
            errorMessage += '⚠️ Video tidak tersedia atau bersifat private.';
        } else if (error.message.includes('Sign in')) {
            errorMessage += '⚠️ Video memerlukan login untuk diakses.';
        } else if (error.message.includes('copyright')) {
            errorMessage += '⚠️ Video dilindungi hak cipta dan tidak dapat diunduh.';
        } else {
            errorMessage += `⚠️ Error: ${error.message}\n\n💡 Pastikan link YouTube valid dan coba lagi.`;
        }

        await message.reply(errorMessage);
    }
}

module.exports = ytmp3Command;
