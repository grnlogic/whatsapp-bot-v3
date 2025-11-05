const axios = require('axios');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Try to load ytdl-core
let ytdl;
try {
    ytdl = require('@distube/ytdl-core');
    console.log('✅ Using @distube/ytdl-core for YouTube downloads');
} catch (error) {
    try {
        ytdl = require('ytdl-core');
        console.log('✅ Using ytdl-core for YouTube downloads');
    } catch (fallbackError) {
        console.warn('⚠️ ytdl-core not available, will use API fallback');
        ytdl = null;
    }
}

/**
 * Service untuk download media dari berbagai platform
 * Dioptimasi untuk kompatibilitas Termux
 */

/**
 * Download video dari TikTok dengan multiple fallback APIs
 */
async function downloadTikTok(url) {
    try {
        console.log('🔄 Mencoba download TikTok dari API 1...');
        
        // Method 1: tikwm.com API (Primary)
        try {
            const response = await axios.post('https://www.tikwm.com/api/', {
                url: url,
                hd: 1
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });

            const data = response.data;

            if (data.code === 0 && data.data) {
                console.log('✅ TikTok API 1 berhasil');
                return {
                    success: true,
                    videoUrl: data.data.hdplay || data.data.play,
                    title: data.data.title || 'TikTok Video',
                    author: data.data.author?.nickname || 'Unknown',
                    thumbnail: data.data.cover,
                    duration: data.data.duration,
                    filename: 'tiktok_video.mp4'
                };
            }
        } catch (err) {
            console.error('❌ TikTok API 1 gagal:', err.message);
        }

        // Method 2: tikvideo.app API (Fallback)
        console.log('🔄 Mencoba download TikTok dari API 2...');
        try {
            const response = await axios.get(`https://www.tikvideo.app/api/ajaxSearch?q=${encodeURIComponent(url)}&lang=id`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            if (response.data && response.data.status === 'ok') {
                const html = response.data.data;
                const videoMatch = html.match(/href="([^"]*\.mp4[^"]*)"/);
                
                if (videoMatch) {
                    console.log('✅ TikTok API 2 berhasil');
                    return {
                        success: true,
                        videoUrl: videoMatch[1].replace(/&amp;/g, '&'),
                        title: 'TikTok Video',
                        author: 'TikTok User',
                        filename: 'tiktok_video.mp4'
                    };
                }
            }
        } catch (err) {
            console.error('❌ TikTok API 2 gagal:', err.message);
        }

        return {
            success: false,
            error: 'Video TikTok tidak ditemukan atau tidak dapat diunduh. Pastikan URL valid dan video bersifat public.'
        };
    } catch (error) {
        console.error('TikTok download error:', error.message);
        return {
            success: false,
            error: 'Gagal mengunduh dari TikTok: ' + error.message
        };
    }
}

/**
 * Download video dari Instagram menggunakan multiple fallback APIs
 */
async function downloadInstagram(url) {
    try {
        console.log('🔄 Mencoba download Instagram dari API 1...');
        
        // Method 1: instavideosave.net API (Primary - lebih stabil)
        try {
            const response = await axios.get(`https://instavideosave.net/?url=${encodeURIComponent(url)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml'
                },
                timeout: 15000,
                maxRedirects: 5
            });

            if (response.data) {
                const html = response.data;
                // Extract download link dari HTML
                const videoMatch = html.match(/href="([^"]*download[^"]*\.mp4[^"]*)"/i) || 
                                 html.match(/class="download-button"[^>]*href="([^"]*)"/i);
                
                if (videoMatch) {
                    let videoUrl = videoMatch[1];
                    if (!videoUrl.startsWith('http')) {
                        videoUrl = 'https://instavideosave.net' + videoUrl;
                    }
                    console.log('✅ Instagram API 1 berhasil');
                    return {
                        success: true,
                        videoUrl: videoUrl,
                        title: 'Instagram Video',
                        author: 'Instagram User',
                        filename: 'instagram_video.mp4'
                    };
                }
            }
        } catch (err) {
            console.error('❌ Instagram API 1 gagal:', err.message);
        }

        // Method 2: downloadgram.com API (Fallback)
        console.log('🔄 Mencoba download Instagram dari API 2...');
        try {
            const response = await axios.post('https://downloadgram.com/api/get',
                { url: url },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                }
            );

            if (response.data && response.data.video_url) {
                console.log('✅ Instagram API 2 berhasil');
                return {
                    success: true,
                    videoUrl: response.data.video_url,
                    title: response.data.title || 'Instagram Video',
                    author: response.data.username || 'Instagram User',
                    filename: 'instagram_video.mp4'
                };
            }
        } catch (err) {
            console.error('❌ Instagram API 2 gagal:', err.message);
        }

        // Method 3: snapinsta.app API (Fallback 2)
        console.log('🔄 Mencoba download Instagram dari API 3...');
        try {
            const response = await axios.post('https://snapinsta.app/api/ajaxSearch', 
                `q=${encodeURIComponent(url)}&t=media&lang=id`, 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': '*/*',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    timeout: 15000
                }
            );

            if (response.data && response.data.status === 'ok') {
                const html = response.data.data;
                const videoMatch = html.match(/href="([^"]*\.mp4[^"]*)"/);
                
                if (videoMatch) {
                    console.log('✅ Instagram API 3 berhasil');
                    return {
                        success: true,
                        videoUrl: videoMatch[1].replace(/&amp;/g, '&'),
                        title: 'Instagram Video',
                        author: 'Instagram User',
                        filename: 'instagram_video.mp4'
                    };
                }
            }
        } catch (err) {
            console.error('❌ Instagram API 3 gagal:', err.message);
        }

        // Method 4: Direct Instagram API attempt (Fallback 3)
        console.log('🔄 Mencoba download Instagram dari API 4...');
        try {
            const shortcodeMatch = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
            if (shortcodeMatch) {
                const shortcode = shortcodeMatch[1];
                const apiUrl = `https://www.instagram.com/api/v1/media/${shortcode}/info/`;
                
                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'Instagram 76.0.0.15.395 Android',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });

                if (response.data && response.data.items && response.data.items[0]) {
                    const media = response.data.items[0];
                    if (media.video_versions && media.video_versions.length > 0) {
                        console.log('✅ Instagram API 4 berhasil');
                        return {
                            success: true,
                            videoUrl: media.video_versions[0].url,
                            title: media.caption?.text?.substring(0, 100) || 'Instagram Video',
                            author: media.user?.username || 'Instagram User',
                            filename: 'instagram_video.mp4'
                        };
                    }
                }
            }
        } catch (err) {
            console.error('❌ Instagram API 4 gagal:', err.message);
        }

        return {
            success: false,
            error: 'Video Instagram tidak dapat diunduh. Pastikan:\n• Post bersifat public\n• URL valid\n• Bukan akun private'
        };
    } catch (error) {
        console.error('Instagram download error:', error.message);
        return {
            success: false,
            error: 'Gagal mengunduh dari Instagram: ' + error.message
        };
    }
}

/**
 * Download video dari YouTube dengan multiple fallback APIs
 */
async function downloadYouTube(url) {
    try {
        // Extract video ID
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
        if (!videoIdMatch) {
            return {
                success: false,
                error: 'URL YouTube tidak valid.'
            };
        }

        const videoId = videoIdMatch[1];
        console.log('🔄 Video ID:', videoId);

        // Method 1: Using ytdl-core (Primary - paling andal)
        if (ytdl) {
            console.log('🔄 Mencoba download YouTube menggunakan ytdl-core...');
            try {
                // Validate URL
                if (!ytdl.validateURL(url)) {
                    console.log('❌ URL tidak valid untuk ytdl-core');
                } else {
                    // Get video info
                    const info = await ytdl.getInfo(url);
                    const title = info.videoDetails.title;
                    const author = info.videoDetails.author?.name || 'YouTube';
                    
                    // Get format with video and audio, quality 360p or 480p
                    const format = ytdl.chooseFormat(info.formats, { 
                        quality: '18', // 360p with audio
                        filter: 'videoandaudio'
                    });

                    if (format && format.url) {
                        console.log('✅ ytdl-core berhasil');
                        console.log('📊 Format:', format.qualityLabel || '360p', format.container);
                        
                        return {
                            success: true,
                            videoUrl: format.url,
                            title: title,
                            author: author,
                            filename: 'youtube_video.mp4',
                            isStream: true // Indicate this is a direct stream
                        };
                    }
                }
            } catch (err) {
                console.error('❌ ytdl-core gagal:', err.message);
                // Continue to API fallback
            }
        }

        // Method 2: cobalt.tools API (Fallback 1)
        console.log('🔄 Mencoba download YouTube dari API 1...');
        try {
            const response = await axios.post('https://api.cobalt.tools/api/json',
                {
                    url: url,
                    vCodec: 'h264',
                    vQuality: '720',
                    aFormat: 'mp3',
                    isAudioOnly: false
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                    },
                    timeout: 25000
                }
            );

            if (response.data && response.data.status === 'redirect' && response.data.url) {
                console.log('✅ YouTube API 1 berhasil');
                return {
                    success: true,
                    videoUrl: response.data.url,
                    title: 'YouTube Video',
                    author: 'YouTube',
                    filename: 'youtube_video.mp4'
                };
            }

            if (response.data && response.data.status === 'stream' && response.data.url) {
                console.log('✅ YouTube API 1 berhasil (stream)');
                return {
                    success: true,
                    videoUrl: response.data.url,
                    title: 'YouTube Video',
                    author: 'YouTube',
                    filename: 'youtube_video.mp4'
                };
            }
        } catch (err) {
            console.error('❌ YouTube API 1 gagal:', err.message);
        }

        // Method 2: ytdl-core alternative API (Fallback)
        console.log('🔄 Mencoba download YouTube dari API 2...');
        try {
            const response = await axios.get(`https://www.yt-download.org/api/button/mp4/360/${videoId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 20000,
                maxRedirects: 5
            });

            if (response.data && typeof response.data === 'object') {
                if (response.data.url || response.data.download) {
                    console.log('✅ YouTube API 2 berhasil');
                    return {
                        success: true,
                        videoUrl: response.data.url || response.data.download,
                        title: response.data.title || 'YouTube Video',
                        author: 'YouTube',
                        filename: 'youtube_video.mp4'
                    };
                }
            }
        } catch (err) {
            console.error('❌ YouTube API 2 gagal:', err.message);
        }

        // Method 3: yt1s.com API (Fallback 2)
        console.log('🔄 Mencoba download YouTube dari API 3...');
        try {
            const analyzeResponse = await axios.post('https://yt1s.com/api/ajaxSearch/index',
                new URLSearchParams({
                    q: url,
                    vt: 'home'
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                        'Accept': 'application/json',
                        'Origin': 'https://yt1s.com',
                        'Referer': 'https://yt1s.com/'
                    },
                    timeout: 20000
                }
            );

            if (analyzeResponse.data && analyzeResponse.data.status === 'ok' && analyzeResponse.data.links) {
                const mp4Links = analyzeResponse.data.links.mp4;
                
                if (mp4Links && Object.keys(mp4Links).length > 0) {
                    let selectedFormat = mp4Links['360'] || mp4Links['480'] || mp4Links['720'] || Object.values(mp4Links)[0];
                    
                    if (selectedFormat && selectedFormat.k) {
                        const convertResponse = await axios.post('https://yt1s.com/api/ajaxConvert/convert',
                            new URLSearchParams({
                                vid: videoId,
                                k: selectedFormat.k
                            }).toString(),
                            {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                                    'Accept': 'application/json',
                                    'Origin': 'https://yt1s.com',
                                    'Referer': 'https://yt1s.com/'
                                },
                                timeout: 20000
                            }
                        );

                        if (convertResponse.data && convertResponse.data.status === 'ok' && convertResponse.data.dlink) {
                            console.log('✅ YouTube API 3 berhasil');
                            return {
                                success: true,
                                videoUrl: convertResponse.data.dlink,
                                title: analyzeResponse.data.title || 'YouTube Video',
                                author: 'YouTube',
                                filename: 'youtube_video.mp4'
                            };
                        }
                    }
                }
            }
        } catch (err) {
            console.error('❌ YouTube API 3 gagal:', err.message);
        }

        // Method 4: Simple ytdl proxy (Fallback 3)
        console.log('🔄 Mencoba download YouTube dari API 4...');
        try {
            const response = await axios.get(`https://ytdl-node.vercel.app/api/download?url=${encodeURIComponent(url)}&quality=medium`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 25000
            });

            if (response.data && response.data.url) {
                console.log('✅ YouTube API 4 berhasil');
                return {
                    success: true,
                    videoUrl: response.data.url,
                    title: response.data.title || 'YouTube Video',
                    author: 'YouTube',
                    filename: 'youtube_video.mp4'
                };
            }
        } catch (err) {
            console.error('❌ YouTube API 4 gagal:', err.message);
        }

        return {
            success: false,
            error: 'Video YouTube tidak dapat diunduh. Kemungkinan:\n• Video private atau memiliki pembatasan\n• Video terlalu panjang (>30 menit)\n• Server download sedang sibuk, coba lagi'
        };
    } catch (error) {
        console.error('YouTube download error:', error.message);
        return {
            success: false,
            error: 'Gagal mengunduh dari YouTube: ' + error.message
        };
    }
}

module.exports = {
    downloadTikTok,
    downloadInstagram,
    downloadYouTube
};
