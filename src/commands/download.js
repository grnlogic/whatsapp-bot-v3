const fetch = require('node-fetch');
const { downloadTikTok, downloadInstagram, downloadYouTube } = require('../services/downloadService');
const { downloadYouTubeEnhanced } = require('../services/youtubeEnhanced');

/**
 * Command untuk download video dari TikTok, Instagram, dan YouTube
 * Dioptimasi untuk Termux
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Argumen command
 */
async function downloadCommand(client, message, args) {
    try {
        // Cek apakah ada URL yang diberikan
        if (args.length === 0) {
            const helpText = 
                '📥 *Download Media*\n\n' +
                '*Cara Penggunaan:*\n' +
                '!download [url]\n' +
                '!dl [url]\n\n' +
                '*Platform yang Didukung:*\n' +
                '• TikTok (semua video public)\n' +
                '• Instagram (Post/Reels public)\n' +
                '• YouTube (video & shorts)\n\n' +
                '*Contoh:*\n' +
                '!download https://vt.tiktok.com/xxx\n' +
                '!dl https://www.instagram.com/p/xxx\n' +
                '!dl https://youtu.be/xxx\n' +
                '!dl https://youtube.com/shorts/xxx\n\n' +
                '⚠️ *Catatan:*\n' +
                '• Video harus bersifat public\n' +
                '• Maksimal durasi ~30 menit\n' +
                '• Proses download memakan waktu';
            
            await message.reply(helpText);
            return;
        }

        const url = args[0];
        
        // Deteksi platform dari URL
        let platform = 'unknown';
        if (url.includes('tiktok.com') || url.includes('vt.tiktok')) {
            platform = 'tiktok';
        } else if (url.includes('instagram.com')) {
            platform = 'instagram';
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = 'youtube';
        } else {
            await message.reply(
                '❌ *URL tidak didukung!*\n\n' +
                '💡 *Platform yang didukung:*\n' +
                '• TikTok: vt.tiktok.com / tiktok.com\n' +
                '• Instagram: instagram.com/p/ atau /reel/\n' +
                '• YouTube: youtube.com/watch atau youtu.be'
            );
            return;
        }

        // Kirim pesan loading dengan emoji yang sesuai
        const platformEmoji = {
            tiktok: '🎵',
            instagram: '📸',
            youtube: '▶️'
        };
        
        await message.reply(
            `${platformEmoji[platform]} *Sedang memproses...*\n\n` +
            `📱 Platform: ${platform.toUpperCase()}\n` +
            `🔗 URL: ${url.substring(0, 50)}...\n\n` +
            `⏳ Mohon tunggu, proses download sedang berlangsung...`
        );

        // Download berdasarkan platform
        console.log(`\n🚀 Memulai download dari ${platform.toUpperCase()}`);
        console.log(`🔗 URL: ${url}`);
        
        let result;
        const startTime = Date.now();
        
        switch (platform) {
            case 'tiktok':
                result = await downloadTikTok(url);
                break;
            case 'instagram':
                result = await downloadInstagram(url);
                break;
            case 'youtube':
                // Use enhanced YouTube downloader with save-to-local strategy
                console.log('🚀 Using enhanced YouTube downloader...');
                const enhancedResult = await downloadYouTubeEnhanced(url, client, message);
                
                if (enhancedResult.success) {
                    console.log(`✅ Enhanced YouTube download completed with method: ${enhancedResult.method}`);
                    return; // Exit early since enhanced downloader handles everything
                } else {
                    // If enhanced fails, try regular method as fallback
                    console.log('⚠️ Enhanced method failed, trying regular API...');
                    result = await downloadYouTube(url);
                }
                break;
        }

        const downloadTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⏱️ Waktu proses: ${downloadTime}s`);

        if (!result.success) {
            console.error('❌ Download gagal:', result.error);
            await message.reply(
                `❌ *Download Gagal!*\n\n` +
                `📱 Platform: ${platform.toUpperCase()}\n\n` +
                `⚠️ *Error:*\n${result.error}\n\n` +
                `💡 *Solusi:*\n` +
                `• Pastikan URL valid\n` +
                `• Pastikan konten bersifat public\n` +
                `• Coba lagi dalam beberapa saat`
            );
            return;
        }

        // Kirim info video terlebih dahulu
        const chat = await message.getChat();
        
        let caption = `✅ *Download Berhasil*\n\n`;
        caption += `📱 *Platform:* ${platform.toUpperCase()}\n`;
        if (result.title) caption += `📝 *Judul:* ${result.title.substring(0, 100)}${result.title.length > 100 ? '...' : ''}\n`;
        if (result.author) caption += `👤 *Author:* ${result.author}\n`;
        if (result.duration) caption += `⏱️ *Durasi:* ${result.duration}s\n`;
        caption += `\n⬇️ *Mengunduh video...*`;

        await chat.sendMessage(caption);

        // STRATEGY: Download to local file → Send to user → Delete from server
        console.log('📥 Downloading video from:', result.videoUrl.substring(0, 80) + '...');
        
        // Create temp directory if not exists
        const fs = require('fs');
        const path = require('path');
        const { MessageMedia } = require('whatsapp-web.js');
        
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const videoId = result.videoUrl.split('/').pop().split('?')[0] || 'video';
        const filename = `${platform}_${videoId}_${timestamp}.mp4`;
        const filePath = path.join(tempDir, filename);
        
        console.log(`💾 Saving to: ${filePath}`);
        
        try {
            // Step 1: Download to local file with streaming
            const response = await fetch(result.videoUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
                    'Accept': 'video/mp4,video/*,*/*;q=0.9',
                    'Accept-Encoding': 'identity',
                    'Range': 'bytes=0-' // Support partial downloads
                },
                timeout: 180000 // 3 minutes timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            // Stream response to file
            const fileStream = fs.createWriteStream(filePath);
            let downloadedBytes = 0;
            let lastProgress = 0;
            
            response.body.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                const progressMB = (downloadedBytes / 1024 / 1024).toFixed(1);
                
                // Log progress every 5MB
                if (downloadedBytes - lastProgress > 5 * 1024 * 1024) {
                    console.log(`📥 Downloaded: ${progressMB} MB`);
                    lastProgress = downloadedBytes;
                }
            });
            
            // Pipe to file
            response.body.pipe(fileStream);
            
            // Wait for download to complete
            await new Promise((resolve, reject) => {
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
                response.body.on('error', reject);
            });
            
            // Step 2: Check file size and validate
            const stats = fs.statSync(filePath);
            const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
            
            console.log(`✅ File saved locally: ${fileSizeMB} MB`);
            
            // Check WhatsApp limits
            if (stats.size > 64 * 1024 * 1024) {
                // Delete oversized file
                fs.unlinkSync(filePath);
                await chat.sendMessage(
                    `⚠️ *Video terlalu besar!*\n\n` +
                    `📊 Ukuran: ${fileSizeMB} MB\n` +
                    `⚠️ WhatsApp limit: 64 MB\n\n` +
                    `💡 Coba video yang lebih pendek`
                );
                return;
            }
            
            // Step 3: Read file and create media
            console.log('📤 Sending to WhatsApp...');
            const fileBuffer = fs.readFileSync(filePath);
            const media = new MessageMedia(
                'video/mp4',
                fileBuffer.toString('base64'),
                filename
            );
            
            // Step 4: Send to user
            await chat.sendMessage(media, {
                caption: `${platformEmoji[platform]} *Video dari ${platform.toUpperCase()}*\n\n` +
                        `📊 Ukuran: ${fileSizeMB} MB\n` +
                        `⏱️ Durasi: ${result.duration || 'N/A'}s\n` +
                        `✅ Download berhasil!`
            });
            
            console.log(`✅ Video berhasil dikirim ke WhatsApp`);
            
            // Step 5: Delete from server after successful send
            setTimeout(() => {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`�️ File deleted: ${filename}`);
                    }
                } catch (deleteError) {
                    console.warn('⚠️ Could not delete temp file:', deleteError.message);
                }
            }, 5000); // Delete after 5 seconds
            
            console.log(`�📊 Total processing time: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);

        } catch (downloadError) {
            console.error('❌ Download/Send error:', downloadError);
            
            // Cleanup on error
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log('🗑️ Cleaned up failed download file');
                } catch (cleanupError) {
                    console.warn('⚠️ Could not cleanup file:', cleanupError.message);
                }
            }
            
            let errorMessage = '❌ *Download gagal!*\n\n';
            
            if (downloadError.message.includes('403')) {
                errorMessage += '🚫 **Error 403:** Server menolak akses\n\n' +
                              '💡 **Solusi:**\n' +
                              '• Video mungkin private/restricted\n' +
                              '• Coba video lain\n' +
                              '• Gunakan URL yang berbeda';
            } else if (downloadError.message.includes('timeout')) {
                errorMessage += '⏱️ **Timeout:** Download terlalu lama\n\n' +
                              '💡 **Solusi:**\n' +
                              '• Video terlalu besar\n' +
                              '• Koneksi internet lambat\n' +
                              '• Coba video yang lebih pendek';
            } else if (downloadError.message.includes('404')) {
                errorMessage += '🔍 **Error 404:** Video tidak ditemukan\n\n' +
                              '💡 **Solusi:**\n' +
                              '• Video mungkin sudah dihapus\n' +
                              '• URL tidak valid\n' +
                              '• Cek kembali link yang dikirim';
            } else {
                errorMessage += `⚠️ **Error:** ${downloadError.message}\n\n` +
                              '💡 **Coba lagi dalam beberapa saat**';
            }
            
            await chat.sendMessage(errorMessage);
        }

    } catch (error) {
        console.error('❌ Error in download command:', error);
        await message.reply(
            `❌ *Terjadi kesalahan!*\n\n` +
            `⚠️ Error: ${error.message}\n\n` +
            `💡 *Coba lagi atau hubungi admin jika masalah berlanjut.*`
        );
    }
}

module.exports = downloadCommand;
