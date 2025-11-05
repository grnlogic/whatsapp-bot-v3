const fetch = require('node-fetch');
const { downloadTikTok, downloadInstagram, downloadYouTube } = require('../services/downloadService');

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
                result = await downloadYouTube(url);
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

        // Download video ke buffer dengan timeout lebih panjang
        console.log('📥 Downloading video from:', result.videoUrl.substring(0, 80) + '...');
        
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 120000); // 2 menit timeout untuk Termux
        
        try {
            const media = await fetch(result.videoUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                }
            });
            
            clearTimeout(timeout);
            
            if (!media.ok) {
                throw new Error(`HTTP error! status: ${media.status}`);
            }
            
            const buffer = await media.buffer();
            const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
            
            console.log('✅ Video downloaded, size:', sizeMB, 'MB');
            
            // Cek ukuran file (WhatsApp limit ~64MB)
            if (buffer.length > 64 * 1024 * 1024) {
                await chat.sendMessage(
                    `⚠️ *Video terlalu besar!*\n\n` +
                    `📊 Ukuran: ${sizeMB} MB\n` +
                    `⚠️ WhatsApp limit: 64 MB\n\n` +
                    `💡 Coba video yang lebih pendek`
                );
                return;
            }
            
            // Kirim video sebagai file
            await chat.sendMessage(buffer, {
                mimetype: 'video/mp4',
                filename: result.filename || `${platform}_video_${Date.now()}.mp4`,
                caption: `${platformEmoji[platform]} Video dari ${platform.toUpperCase()}\n📊 Ukuran: ${sizeMB} MB`
            });

            console.log(`✅ Video ${platform} berhasil dikirim ke WhatsApp`);
            console.log(`📊 Total waktu: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);

        } catch (fetchError) {
            clearTimeout(timeout);
            
            if (fetchError.name === 'AbortError') {
                console.error('❌ Download timeout');
                await chat.sendMessage(
                    `⏱️ *Download Timeout!*\n\n` +
                    `Video terlalu lama untuk diunduh.\n` +
                    `Kemungkinan file terlalu besar atau koneksi lambat.\n\n` +
                    `💡 Coba video yang lebih pendek.`
                );
            } else {
                console.error('❌ Fetch error:', fetchError.message);
                await chat.sendMessage(
                    `❌ *Gagal mengunduh file video!*\n\n` +
                    `Error: ${fetchError.message}\n\n` +
                    `💡 Coba lagi dalam beberapa saat.`
                );
            }
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
