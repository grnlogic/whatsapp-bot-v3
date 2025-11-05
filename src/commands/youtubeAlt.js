const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Alternative YouTube downloader using external API
 * Fallback when ytdl-core fails due to 403 errors
 */

// Alternative API endpoints (free public APIs)
const YOUTUBE_APIS = [
    {
        name: 'YT-DLP API',
        url: 'https://api.cobalt.tools/api/json',
        method: 'POST'
    },
    {
        name: 'YouTube Download API',
        url: 'https://youtube-mp36.p.rapidapi.com/dl',
        method: 'GET'
    }
];

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Get video info using alternative API
 */
async function getVideoInfo(videoId) {
    try {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Try Cobalt API
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            vCodec: 'h264',
            vQuality: 'max',
            aFormat: 'mp3',
            isAudioOnly: true
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        if (response.data && response.data.status === 'success') {
            return {
                title: response.data.filename || 'Unknown Title',
                downloadUrl: response.data.url,
                duration: 'N/A'
            };
        }
        
        throw new Error('API response invalid');
        
    } catch (error) {
        console.error('[ALT API] Error:', error.message);
        throw error;
    }
}

/**
 * Download audio using alternative method
 */
async function downloadAudioAlt(videoUrl, outputPath) {
    try {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        console.log('[ALT DOWNLOAD] Getting video info...');
        const videoInfo = await getVideoInfo(videoId);
        
        if (!videoInfo.downloadUrl) {
            throw new Error('No download URL available');
        }

        console.log('[ALT DOWNLOAD] Downloading audio...');
        const response = await axios.get(videoInfo.downloadUrl, {
            responseType: 'stream',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('[ALT DOWNLOAD] Download completed');
                resolve({
                    filePath: outputPath,
                    title: videoInfo.title,
                    duration: videoInfo.duration
                });
            });
            
            writer.on('error', reject);
            response.data.on('error', reject);
        });

    } catch (error) {
        console.error('[ALT DOWNLOAD] Error:', error);
        throw error;
    }
}

/**
 * Simple YouTube to MP3 using public APIs
 */
async function simpleYoutubeMp3(videoUrl) {
    try {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        // Try using youtube-dl-exec style API
        const apiUrl = `https://www.yt-download.org/api/button/mp3/${videoId}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.success) {
            return {
                title: response.data.title,
                downloadUrl: response.data.downloadUrl,
                duration: response.data.duration
            };
        }

        throw new Error('API request failed');

    } catch (error) {
        console.error('[SIMPLE MP3] Error:', error);
        throw error;
    }
}

/**
 * Alternative play command using external APIs
 */
async function altPlayCommand(client, message, args) {
    try {
        if (!args || args.length === 0) {
            return message.reply("_Need song name or YouTube URL_");
        }

        const query = args.join(' ');
        let videoUrl;

        // Check if it's already a URL
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            videoUrl = query;
        } else {
            // Search YouTube (you can implement search API here)
            return message.reply("❌ Direct search not available with alternative method.\n\n💡 Please provide YouTube URL directly.\n\nExample: !altplay https://youtu.be/xxxxx");
        }

        await message.reply("🔄 Trying alternative download method...");

        const tempFolder = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempFolder)) {
            fs.mkdirSync(tempFolder, { recursive: true });
        }

        const videoId = extractVideoId(videoUrl);
        const filePath = path.join(tempFolder, `alt_${videoId}.mp3`);

        const result = await downloadAudioAlt(videoUrl, filePath);

        // Check file size
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        if (fileSizeInMB > 60) {
            fs.unlinkSync(filePath);
            return message.reply("❌ File too large for WhatsApp (>60MB)");
        }

        // Send audio
        const fileBuffer = fs.readFileSync(filePath);
        const media = new MessageMedia(
            'audio/mpeg',
            fileBuffer.toString('base64'),
            `${result.title}.mp3`
        );

        const chat = await message.getChat();
        await chat.sendMessage(media, {
            caption: `🎵 *${result.title}*\n\n✅ Downloaded using alternative method`
        });

        // Cleanup
        setTimeout(() => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }, 5000);

    } catch (error) {
        console.error('[ALT PLAY] Error:', error);
        message.reply(`❌ Alternative download failed: ${error.message}`);
    }
}

module.exports = {
    altPlayCommand,
    downloadAudioAlt,
    simpleYoutubeMp3,
    extractVideoId,
    getVideoInfo
};