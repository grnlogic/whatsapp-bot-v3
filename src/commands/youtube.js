const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Try to load ytdl-core with agent configuration
let ytdl;
try {
    ytdl = require('@distube/ytdl-core');
    
    // Configure agent untuk bypass 403 errors
    const { Agent } = require('https');
    ytdl.getInfo = ytdl.getInfo;
    ytdl.getBasicInfo = ytdl.getBasicInfo;
    
    console.log('[YOUTUBE] Using @distube/ytdl-core with agent');
} catch (error) {
    try {
        ytdl = require('ytdl-core');
        console.log('[YOUTUBE] Using ytdl-core fallback');
    } catch (fallbackError) {
        console.error('[YOUTUBE] No ytdl library available');
        ytdl = null;
    }
}

// YouTube URL regex (from code.txt)
const getID = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;

// YouTube search function (simplified version from code.txt)
async function searchYT(query) {
    try {
        // Using YouTube search API alternative (you can use any public API)
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 10,
                key: process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY' // Optional: add API key
            }
        });
        
        return {
            videos: response.data.items.map(item => ({
                id: item.id.videoId,
                title: { text: item.snippet.title },
                duration: { text: 'N/A' }, // Would need additional API call
                thumbnail: item.snippet.thumbnails.default.url
            }))
        };
    } catch (error) {
        console.error('[YOUTUBE SEARCH] Error:', error);
        // Fallback: return dummy data for testing
        return { videos: [] };
    }
}

// Get video title with retry and cookies
async function ytTitle(videoId) {
    if (!ytdl) return 'Unknown Title';
    
    try {
        // Try with agent and headers to bypass 403
        const info = await ytdl.getInfo(videoId, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            }
        });
        return info.videoDetails.title;
    } catch (error) {
        console.error('[YT TITLE] Error:', error);
        
        // Fallback: try to get title from basic info
        try {
            const basicInfo = await ytdl.getBasicInfo(videoId);
            return basicInfo.videoDetails.title;
        } catch (fallbackError) {
            console.error('[YT TITLE] Fallback error:', fallbackError);
            return 'Unknown Title';
        }
    }
}

// Download song (audio only) with retry mechanism
async function dlSong(videoId) {
    if (!ytdl) throw new Error('YouTube downloader not available');
    
    const options = {
        quality: 'highestaudio',
        filter: 'audioonly',
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': '*/*',
                'Sec-Fetch-Mode': 'navigate'
            }
        }
    };
    
    return ytdl(videoId, options);
}

// YouTube Play Command (adapted from code.txt)
async function playCommand(client, message, args) {
    try {
        if (!args || args.length === 0) {
            return message.reply("_Need song name, eg: !play starboy_");
        }

        const query = args.join(' ');
        
        if (query.includes('open.spotify.com')) {
            return message.reply("_Spotify links not supported yet!_");
        }

        if (!ytdl) {
            return message.reply(
                '❌ *YouTube downloader tidak tersedia*\n\n' +
                '💡 Install dependencies:\n' +
                '```npm install @distube/ytdl-core```'
            );
        }

        // Send searching message
        await message.reply(`🔍 *Searching:* _${query}_`);

        // Search YouTube
        const searchResults = await searchYT(query);
        
        if (!searchResults.videos || searchResults.videos.length === 0) {
            return message.reply("❌ No results found!");
        }

        const firstResult = searchResults.videos[0];
        const title = await ytTitle(firstResult.id);
        
        // Send downloading message
        await message.reply(`📥 *Downloading:* _${title}_`);

        // Create temp folder
        const tempFolder = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempFolder)) {
            fs.mkdirSync(tempFolder, { recursive: true });
        }

        // Get video info and check duration with retry
        let info, duration;
        try {
            info = await ytdl.getInfo(firstResult.id, {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                }
            });
            duration = parseInt(info.videoDetails.lengthSeconds);
        } catch (infoError) {
            console.log('[PLAY] Info error, trying basic info:', infoError.message);
            try {
                info = await ytdl.getBasicInfo(firstResult.id);
                duration = parseInt(info.videoDetails.lengthSeconds || info.length_seconds || 0);
            } catch (basicError) {
                console.error('[PLAY] Basic info failed:', basicError.message);
                return message.reply('❌ Cannot get video information. Video may be private or restricted.');
            }
        }
        
        if (duration > 600) { // 10 minutes limit
            return message.reply(
                `⚠️ *Audio too long!*\n\n` +
                `⏱️ Duration: ${Math.floor(duration / 60)} minutes\n` +
                `⚠️ Maximum: 10 minutes`
            );
        }

        // Create filename
        const cleanTitle = title
            .replace(/[<>:"/\\|?*【】\[\]]+/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
        
        const filePath = path.join(tempFolder, `${cleanTitle}.mp3`);

        // Download audio stream
        const audioStream = ytdl(firstResult.id, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });

        const writeStream = fs.createWriteStream(filePath);
        audioStream.pipe(writeStream);

        writeStream.on('finish', async () => {
            try {
                // Check file size
                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 60) {
                    fs.unlinkSync(filePath);
                    return message.reply("❌ File too large for WhatsApp (>60MB)");
                }

                // Send as audio
                const fileBuffer = fs.readFileSync(filePath);
                const media = new MessageMedia(
                    'audio/mpeg',
                    fileBuffer.toString('base64'),
                    `${cleanTitle}.mp3`
                );

                const chat = await message.getChat();
                await chat.sendMessage(media, {
                    caption: `🎵 *${title}*\n\n⏱️ Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n✅ Downloaded successfully!`
                });

                // Cleanup
                setTimeout(() => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }, 5000);

            } catch (error) {
                console.error('[PLAY] Send error:', error);
                message.reply("❌ Failed to send audio");
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        audioStream.on('error', (error) => {
            console.error('[PLAY] Stream error:', error);
            message.reply("❌ Failed to download audio");
        });

    } catch (error) {
        console.error('[PLAY] Error:', error);
        message.reply(`❌ Error: ${error.message}`);
    }
}

// Song Command (for direct YouTube links)
async function songCommand(client, message, args) {
    try {
        if (!args || args.length === 0) {
            return message.reply(
                '🎵 *Download Audio from YouTube*\n\n' +
                '*Usage:*\n' +
                '!song [YouTube URL]\n' +
                '!song https://youtu.be/xxx\n\n' +
                '⚠️ *Note:* Audio only, max 10 minutes'
            );
        }

        const input = args[0];
        let videoId;

        // Check if it's a YouTube URL
        const urlMatch = input.match(getID);
        if (urlMatch) {
            videoId = urlMatch[1];
        } else {
            return message.reply("❌ Invalid YouTube URL!");
        }

        if (!ytdl) {
            return message.reply(
                '❌ *YouTube downloader not available*\n\n' +
                '💡 Install dependencies:\n' +
                '```npm install @distube/ytdl-core```'
            );
        }

        const title = await ytTitle(videoId);
        await message.reply(`📥 *Downloading:* _${title}_`);

        // Same download logic as play command
        const tempFolder = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempFolder)) {
            fs.mkdirSync(tempFolder, { recursive: true });
        }

        const info = await ytdl.getInfo(videoId);
        const duration = parseInt(info.videoDetails.lengthSeconds);
        
        if (duration > 600) {
            return message.reply(
                `⚠️ *Audio too long!*\n\n` +
                `⏱️ Duration: ${Math.floor(duration / 60)} minutes\n` +
                `⚠️ Maximum: 10 minutes`
            );
        }

        const cleanTitle = title
            .replace(/[<>:"/\\|?*【】\[\]]+/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
        
        const filePath = path.join(tempFolder, `${cleanTitle}.mp3`);

        const audioStream = ytdl(videoId, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });

        const writeStream = fs.createWriteStream(filePath);
        audioStream.pipe(writeStream);

        writeStream.on('finish', async () => {
            try {
                const stats = fs.statSync(filePath);
                const fileSizeInMB = stats.size / (1024 * 1024);

                if (fileSizeInMB > 60) {
                    fs.unlinkSync(filePath);
                    return message.reply("❌ File too large for WhatsApp (>60MB)");
                }

                const fileBuffer = fs.readFileSync(filePath);
                const media = new MessageMedia(
                    'audio/mpeg',
                    fileBuffer.toString('base64'),
                    `${cleanTitle}.mp3`
                );

                const chat = await message.getChat();
                await chat.sendMessage(media, {
                    caption: `🎵 *${title}*\n\n⏱️ Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n✅ Downloaded successfully!`
                });

                setTimeout(() => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }, 5000);

            } catch (error) {
                console.error('[SONG] Send error:', error);
                message.reply("❌ Failed to send audio");
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        });

        audioStream.on('error', (error) => {
            console.error('[SONG] Stream error:', error);
            message.reply("❌ Failed to download audio");
        });

    } catch (error) {
        console.error('[SONG] Error:', error);
        message.reply(`❌ Error: ${error.message}`);
    }
}

// YouTube Search Command
async function ytsCommand(client, message, args) {
    try {
        if (!args || args.length === 0) {
            return message.reply("*Need search terms*");
        }

        const query = args.join(' ');
        await message.reply(`🔍 *Searching YouTube:* _${query}_`);

        const searchResults = await searchYT(query);
        
        if (!searchResults.videos || searchResults.videos.length === 0) {
            return message.reply("❌ No results found!");
        }

        let resultText = `🔍 *Search Results for "${query}":*\n\n`;
        
        searchResults.videos.slice(0, 5).forEach((video, index) => {
            resultText += `${index + 1}. *${video.title.text}*\n`;
            resultText += `🔗 https://youtu.be/${video.id}\n\n`;
        });

        resultText += `💡 *Use:* !song [URL] to download`;

        await message.reply(resultText);

    } catch (error) {
        console.error('[YTS] Error:', error);
        message.reply(`❌ Error: ${error.message}`);
    }
}

module.exports = {
    playCommand,
    songCommand,
    ytsCommand,
    searchYT,
    ytTitle,
    dlSong
};