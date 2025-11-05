const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Ultimate YouTube Downloader - Alternative APIs Only
 * Completely bypass ytdl-core and use external services
 */

/**
 * Extract video ID from YouTube URL
 */
function getVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Method 1: SaveFrom.net API (Very reliable)
 */
async function downloadUsingSaveFrom(videoId, url) {
    try {
        console.log('🔄 Trying SaveFrom.net API...');
        
        const response = await axios.get(`https://ssyoutube.com/api/convert`, {
            params: {
                url: url,
                format: 'mp4',
                quality: '360p'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 20000
        });

        if (response.data && response.data.url) {
            return {
                success: true,
                downloadUrl: response.data.url,
                title: response.data.title || 'YouTube Video',
                method: 'savefrom'
            };
        }
        
        throw new Error('No download URL in response');
        
    } catch (error) {
        console.error('❌ SaveFrom API failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Method 2: Y2Mate API (Popular service)
 */
async function downloadUsingY2Mate(videoId, url) {
    try {
        console.log('🔄 Trying Y2Mate API...');
        
        // Step 1: Analyze video
        const analyzeResponse = await axios.post('https://www.y2mate.com/mates/analyze/ajax', 
            new URLSearchParams({
                url: url,
                q_auto: 1,
                ajax: 1
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Origin': 'https://www.y2mate.com',
                    'Referer': 'https://www.y2mate.com/'
                },
                timeout: 15000
            }
        );

        if (analyzeResponse.data && analyzeResponse.data.status === 'ok') {
            const links = analyzeResponse.data.links;
            
            // Find MP4 360p or best available
            let selectedFormat = null;
            if (links.mp4 && links.mp4['360']) {
                selectedFormat = links.mp4['360'];
            } else if (links.mp4 && links.mp4['480']) {
                selectedFormat = links.mp4['480'];
            } else if (links.mp4) {
                selectedFormat = Object.values(links.mp4)[0];
            }

            if (selectedFormat && selectedFormat.k) {
                // Step 2: Convert and get download link
                const convertResponse = await axios.post('https://www.y2mate.com/mates/convert', 
                    new URLSearchParams({
                        vid: videoId,
                        k: selectedFormat.k
                    }), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Origin': 'https://www.y2mate.com',
                            'Referer': 'https://www.y2mate.com/'
                        },
                        timeout: 25000
                    }
                );

                if (convertResponse.data && convertResponse.data.status === 'ok' && convertResponse.data.dlink) {
                    return {
                        success: true,
                        downloadUrl: convertResponse.data.dlink,
                        title: analyzeResponse.data.title || 'YouTube Video',
                        method: 'y2mate'
                    };
                }
            }
        }
        
        throw new Error('Y2Mate conversion failed');
        
    } catch (error) {
        console.error('❌ Y2Mate API failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Method 3: Generic YouTube downloader API
 */
async function downloadUsingGenericAPI(videoId, url) {
    try {
        console.log('🔄 Trying Generic API...');
        
        const apis = [
            `https://api.vevioz.com/api/button/mp4/360/${videoId}`,
            `https://www.yt-download.org/api/button/mp4/360/${videoId}`,
            `https://api.onlinevideoconverter.pro/api/convert?url=${encodeURIComponent(url)}&format=mp4`
        ];

        for (const apiUrl of apis) {
            try {
                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                });

                if (response.data) {
                    let downloadUrl = null;
                    let title = 'YouTube Video';

                    // Parse different response formats
                    if (typeof response.data === 'string' && response.data.includes('http')) {
                        downloadUrl = response.data.match(/https?:\/\/[^\s"]+/)?.[0];
                    } else if (response.data.url) {
                        downloadUrl = response.data.url;
                        title = response.data.title || title;
                    } else if (response.data.download) {
                        downloadUrl = response.data.download;
                    } else if (response.data.dlink) {
                        downloadUrl = response.data.dlink;
                    }

                    if (downloadUrl && downloadUrl.startsWith('http')) {
                        return {
                            success: true,
                            downloadUrl: downloadUrl,
                            title: title,
                            method: 'generic-api'
                        };
                    }
                }
            } catch (apiError) {
                console.error(`❌ API ${apiUrl} failed:`, apiError.message);
                continue;
            }
        }
        
        throw new Error('All generic APIs failed');
        
    } catch (error) {
        console.error('❌ Generic API failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Method 4: Simple direct download attempt
 */
async function downloadUsingDirectAPI(videoId, url) {
    try {
        console.log('🔄 Trying Direct API...');
        
        // Simple API that might work
        const response = await axios.post('https://api.downloadgram.com/media', {
            url: url,
            format: 'mp4'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        if (response.data && response.data.success && response.data.media) {
            return {
                success: true,
                downloadUrl: response.data.media.url,
                title: response.data.title || 'YouTube Video',
                method: 'direct-api'
            };
        }
        
        throw new Error('Direct API failed');
        
    } catch (error) {
        console.error('❌ Direct API failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Ultimate YouTube downloader that tries all alternative methods
 */
async function ultimateYouTubeDownload(url, client, message) {
    const startTime = Date.now();
    
    try {
        const videoId = getVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        console.log(`\n🎯 ULTIMATE YouTube Download`);
        console.log(`🔗 URL: ${url}`);
        console.log(`🆔 Video ID: ${videoId}`);
        console.log(`📝 Strategy: External APIs Only (No ytdl-core)`);

        // Create temp directory
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const chat = await message.getChat();
        await chat.sendMessage(
            '🎯 *Mencoba metode alternatif...*\n\n' +
            '🔄 Menggunakan service eksternal\n' +
            '⏳ Mohon tunggu...'
        );

        // Try all methods one by one
        const methods = [
            () => downloadUsingSaveFrom(videoId, url),
            () => downloadUsingY2Mate(videoId, url),
            () => downloadUsingGenericAPI(videoId, url),
            () => downloadUsingDirectAPI(videoId, url)
        ];

        let result = null;
        
        for (let i = 0; i < methods.length; i++) {
            console.log(`\n🔄 Trying method ${i + 1}/4...`);
            
            try {
                result = await methods[i]();
                
                if (result.success) {
                    console.log(`✅ Method ${i + 1} succeeded: ${result.method}`);
                    break;
                }
            } catch (methodError) {
                console.error(`❌ Method ${i + 1} failed:`, methodError.message);
                continue;
            }
        }

        if (!result || !result.success) {
            throw new Error('All alternative methods failed. Video might be restricted or APIs are down.');
        }

        // Download the video file
        console.log(`📥 Downloading from: ${result.downloadUrl.substring(0, 80)}...`);
        
        await chat.sendMessage('📥 *Download dimulai...*\nSedang mengunduh video...');

        const downloadResponse = await axios.get(result.downloadUrl, {
            responseType: 'stream',
            timeout: 120000, // 2 minutes
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'video/mp4,video/*,*/*',
                'Range': 'bytes=0-'
            }
        });

        if (downloadResponse.status !== 200) {
            throw new Error(`Download failed: HTTP ${downloadResponse.status}`);
        }

        // Save to local file
        const filename = `ultimate_${videoId}_${Date.now()}.mp4`;
        const filePath = path.join(tempDir, filename);
        const fileStream = fs.createWriteStream(filePath);

        // Track progress
        let downloadedBytes = 0;
        downloadResponse.data.on('data', (chunk) => {
            downloadedBytes += chunk.length;
        });

        downloadResponse.data.pipe(fileStream);

        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
            downloadResponse.data.on('error', reject);
        });

        // Check file size
        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

        console.log(`✅ File downloaded: ${fileSizeMB} MB`);

        if (stats.size > 64 * 1024 * 1024) {
            fs.unlinkSync(filePath);
            throw new Error(`File too large: ${fileSizeMB} MB (WhatsApp limit: 64 MB)`);
        }

        // Send to WhatsApp
        console.log('📤 Sending to WhatsApp...');
        
        await chat.sendMessage('📤 *Upload ke WhatsApp...*\nSedang mengirim video...');

        const fileBuffer = fs.readFileSync(filePath);
        const media = new MessageMedia(
            'video/mp4',
            fileBuffer.toString('base64'),
            filename
        );

        await chat.sendMessage(media, {
            caption: `▶️ *${result.title}*\n\n` +
                    `📊 Size: ${fileSizeMB} MB\n` +
                    `⚡ Method: ${result.method}\n` +
                    `⏱️ Total: ${((Date.now() - startTime) / 1000).toFixed(1)}s\n\n` +
                    `✅ Download berhasil dengan metode alternatif!`
        });

        // Cleanup
        setTimeout(() => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Cleaned up: ${filename}`);
            }
        }, 5000);

        console.log(`✅ Ultimate YouTube download completed using ${result.method}`);
        console.log(`📊 Total time: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);

        return { success: true, method: result.method };

    } catch (error) {
        console.error('❌ Ultimate YouTube download failed:', error.message);
        
        await message.reply(
            '❌ *Semua metode download gagal*\n\n' +
            `⚠️ Error: ${error.message}\n\n` +
            '💡 **Kemungkinan penyebab:**\n' +
            '• Video private/restricted\n' +
            '• Video terlalu besar (>64MB)\n' +
            '• YouTube memblokir semua service\n' +
            '• Video dilindungi hak cipta\n\n' +
            '🔄 **Solusi:**\n' +
            '• Coba video lain\n' +
            '• Tunggu beberapa jam dan coba lagi\n' +
            '• Gunakan video yang lebih pendek'
        );

        return { success: false, error: error.message };
    }
}

module.exports = {
    ultimateYouTubeDownload,
    getVideoId
};