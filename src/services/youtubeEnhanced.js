const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const { MessageMedia } = require('whatsapp-web.js');
const { handleFileAfterSend } = require('../commands/fileManager');

// Try to load ytdl-core with enhanced configuration
let ytdl;
try {
    ytdl = require('@distube/ytdl-core');
    console.log('✅ Using @distube/ytdl-core for YouTube downloads');
} catch (error) {
    console.warn('⚠️ ytdl-core not available, using API fallback only');
    ytdl = null;
}

/**
 * Enhanced YouTube Download with Save-to-Local Strategy
 * Strategy: Download → Save Local → Send to User → Delete from Server
 */

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

/**
 * Enhanced YouTube downloader with multiple methods and local file saving
 */
async function downloadYouTubeEnhanced(url, client, message) {
    const startTime = Date.now();
    
    try {
        // Extract video ID
        const videoId = extractVideoId(url);
        if (!videoId) {
            throw new Error('URL YouTube tidak valid atau video ID tidak ditemukan');
        }

        console.log(`\n🚀 Starting enhanced YouTube download`);
        console.log(`🔗 URL: ${url}`);
        console.log(`🆔 Video ID: ${videoId}`);

        // Create temp directory
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        let downloadResult = null;
        let method = 'unknown';

        // Method 1: Enhanced ytdl-core with better configuration
        if (ytdl) {
            console.log('🔄 Method 1: Enhanced ytdl-core...');
            try {
                // Enhanced ytdl options to bypass 403
                const ytdlOptions = {
                    quality: 'highest',
                    filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio,
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                            'Sec-Fetch-Dest': 'document',
                            'Sec-Fetch-Mode': 'navigate',
                            'Sec-Fetch-Site': 'none'
                        }
                    }
                };

                const info = await ytdl.getInfo(videoId, ytdlOptions);
                const title = info.videoDetails.title.replace(/[<>:"/\\|?*]/g, '_');
                const formats = info.formats.filter(format => 
                    format.hasVideo && format.hasAudio && format.container === 'mp4'
                );

                if (formats.length > 0) {
                    // Prefer 360p or 480p for balance of quality and size
                    let selectedFormat = formats.find(f => f.height <= 480) || formats[0];
                    
                    const filename = `yt_${videoId}_${Date.now()}.mp4`;
                    const filePath = path.join(tempDir, filename);
                    
                    console.log(`📊 Format: ${selectedFormat.qualityLabel || selectedFormat.height + 'p'} ${selectedFormat.container}`);
                    console.log(`💾 Saving to: ${filePath}`);

                    // Download using stream with better error handling
                    const stream = ytdl(videoId, { format: selectedFormat, ...ytdlOptions });
                    const writeStream = fs.createWriteStream(filePath);
                    
                    // Progress tracking
                    let downloadedBytes = 0;
                    stream.on('data', (chunk) => {
                        downloadedBytes += chunk.length;
                    });

                    // Pipe with error handling
                    stream.pipe(writeStream);

                    await new Promise((resolve, reject) => {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                        stream.on('error', reject);
                    });

                    const stats = fs.statSync(filePath);
                    
                    downloadResult = {
                        filePath,
                        filename,
                        title,
                        author: info.videoDetails.author?.name || 'YouTube',
                        size: stats.size,
                        duration: info.videoDetails.lengthSeconds
                    };
                    method = 'ytdl-core';
                    
                    console.log('✅ ytdl-core berhasil');
                }
            } catch (ytdlError) {
                console.error('❌ ytdl-core failed:', ytdlError.message);
                
                // If it's a 403 error, inform user about alternative
                if (ytdlError.message.includes('403')) {
                    await message.reply(
                        '⚠️ *YouTube memblokir akses*\n\n' +
                        '🚫 Error 403: Server menolak permintaan\n' +
                        '💡 Mencoba metode alternatif...\n\n' +
                        '⏳ Mohon tunggu sebentar...'
                    );
                }
            }
        }

        // Method 2: Cobalt API (High quality fallback)
        if (!downloadResult) {
            console.log('🔄 Method 2: Cobalt API...');
            try {
                const response = await axios.post('https://api.cobalt.tools/api/json', {
                    url: url,
                    vCodec: 'h264',
                    vQuality: '720',
                    aFormat: 'mp3',
                    isAudioOnly: false
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                if (response.data && (response.data.status === 'redirect' || response.data.status === 'stream')) {
                    const downloadUrl = response.data.url;
                    const filename = `yt_cobalt_${videoId}_${Date.now()}.mp4`;
                    const filePath = path.join(tempDir, filename);

                    // Download file to local
                    const downloadResponse = await fetch(downloadUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                        }
                    });

                    if (!downloadResponse.ok) {
                        throw new Error(`HTTP ${downloadResponse.status}: ${downloadResponse.statusText}`);
                    }

                    const fileStream = fs.createWriteStream(filePath);
                    downloadResponse.body.pipe(fileStream);

                    await new Promise((resolve, reject) => {
                        fileStream.on('finish', resolve);
                        fileStream.on('error', reject);
                    });

                    const stats = fs.statSync(filePath);
                    
                    downloadResult = {
                        filePath,
                        filename,
                        title: 'YouTube Video (Cobalt)',
                        author: 'YouTube',
                        size: stats.size,
                        duration: 'N/A'
                    };
                    method = 'cobalt-api';
                    
                    console.log('✅ Cobalt API berhasil');
                }
            } catch (cobaltError) {
                console.error('❌ Cobalt API failed:', cobaltError.message);
            }
        }

        // Method 3: YT1S API (Reliable fallback)
        if (!downloadResult) {
            console.log('🔄 Method 3: YT1S API...');
            try {
                // Step 1: Analyze video
                const analyzeResponse = await axios.post('https://yt1s.com/api/ajaxSearch/index',
                    new URLSearchParams({
                        q: url,
                        vt: 'home'
                    }).toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                        },
                        timeout: 25000
                    }
                );

                if (analyzeResponse.data?.status === 'ok' && analyzeResponse.data.links?.mp4) {
                    const mp4Links = analyzeResponse.data.links.mp4;
                    
                    // Select best available quality (prefer 360p for size balance)
                    let selectedQuality = mp4Links['360'] || mp4Links['480'] || mp4Links['720'] || Object.values(mp4Links)[0];
                    
                    if (selectedQuality?.k) {
                        // Step 2: Convert and get download link
                        const convertResponse = await axios.post('https://yt1s.com/api/ajaxConvert/convert',
                            new URLSearchParams({
                                vid: videoId,
                                k: selectedQuality.k
                            }).toString(),
                            {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                                },
                                timeout: 30000
                            }
                        );

                        if (convertResponse.data?.status === 'ok' && convertResponse.data.dlink) {
                            const downloadUrl = convertResponse.data.dlink;
                            const filename = `yt_yt1s_${videoId}_${Date.now()}.mp4`;
                            const filePath = path.join(tempDir, filename);

                            // Download to local file
                            const downloadResponse = await fetch(downloadUrl, {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                                }
                            });

                            if (downloadResponse.ok) {
                                const fileStream = fs.createWriteStream(filePath);
                                downloadResponse.body.pipe(fileStream);

                                await new Promise((resolve, reject) => {
                                    fileStream.on('finish', resolve);
                                    fileStream.on('error', reject);
                                });

                                const stats = fs.statSync(filePath);
                                
                                downloadResult = {
                                    filePath,
                                    filename,
                                    title: analyzeResponse.data.title || 'YouTube Video',
                                    author: 'YouTube',
                                    size: stats.size,
                                    duration: 'N/A'
                                };
                                method = 'yt1s-api';
                                
                                console.log('✅ YT1S API berhasil');
                            }
                        }
                    }
                }
            } catch (yt1sError) {
                console.error('❌ YT1S API failed:', yt1sError.message);
            }
        }

        // Check if we got a result
        if (!downloadResult) {
            throw new Error('Semua metode download gagal. Video mungkin private, restricted, atau terlalu besar.');
        }

        // Validate file size
        const fileSizeMB = (downloadResult.size / 1024 / 1024).toFixed(2);
        console.log(`📊 File size: ${fileSizeMB} MB`);

        if (downloadResult.size > 64 * 1024 * 1024) {
            // Delete oversized file
            fs.unlinkSync(downloadResult.filePath);
            throw new Error(`Video terlalu besar (${fileSizeMB} MB). WhatsApp limit: 64 MB`);
        }

        // Send to user
        console.log('📤 Sending to WhatsApp...');
        const fileBuffer = fs.readFileSync(downloadResult.filePath);
        const media = new MessageMedia(
            'video/mp4',
            fileBuffer.toString('base64'),
            downloadResult.filename
        );

        const chat = await message.getChat();
        await chat.sendMessage(media, {
            caption: `▶️ *${downloadResult.title}*\n\n` +
                    `👤 ${downloadResult.author}\n` +
                    `📊 Size: ${fileSizeMB} MB\n` +
                    `⚡ Method: ${method}\n` +
                    `⏱️ Process: ${((Date.now() - startTime) / 1000).toFixed(1)}s\n\n` +
                    `✅ Download berhasil!`
        });

        // Handle file after send (keep or delete based on user preference)
        handleFileAfterSend(downloadResult.filePath, downloadResult.filename);

        console.log(`✅ YouTube download completed successfully using ${method}`);
        console.log(`📊 Total time: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);

        return { success: true, method, size: fileSizeMB };

    } catch (error) {
        console.error('❌ Enhanced YouTube download failed:', error.message);
        
        // Clean up any partial files
        const tempFiles = fs.readdirSync(path.join(__dirname, '../../temp')).filter(f => f.includes(extractVideoId(url)));
        tempFiles.forEach(file => {
            try {
                fs.unlinkSync(path.join(__dirname, '../../temp', file));
                console.log(`🗑️ Cleaned up partial file: ${file}`);
            } catch (e) {
                console.warn('⚠️ Could not clean partial file:', e.message);
            }
        });

        let errorMessage = '❌ *Download YouTube Gagal*\n\n';
        
        if (error.message.includes('403')) {
            errorMessage += '🚫 **Error 403:** YouTube menolak akses\n\n' +
                          '💡 **Kemungkinan penyebab:**\n' +
                          '• Video memiliki pembatasan geografis\n' +
                          '• Video dilindungi hak cipta\n' +
                          '• Server YouTube sedang memblokir bot\n\n' +
                          '🔄 **Solusi:** Coba gunakan `!altplay [URL]`';
        } else if (error.message.includes('terlalu besar')) {
            errorMessage += `📊 **Video terlalu besar:** ${error.message}\n\n` +
                          '💡 **Solusi:** Gunakan video yang lebih pendek';
        } else if (error.message.includes('private') || error.message.includes('restricted')) {
            errorMessage += '🔒 **Video Private/Restricted**\n\n' +
                          '💡 **Solusi:** Pastikan video bersifat public';
        } else {
            errorMessage += `⚠️ **Error:** ${error.message}\n\n` +
                          '💡 **Solusi:**\n' +
                          '• Coba lagi dalam beberapa saat\n' +
                          '• Pastikan URL YouTube valid\n' +
                          '• Gunakan `!altplay [URL]` untuk metode alternatif';
        }

        await message.reply(errorMessage);
        return { success: false, error: error.message };
    }
}

module.exports = {
    downloadYouTubeEnhanced,
    extractVideoId
};