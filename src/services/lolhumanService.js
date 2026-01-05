const axios = require('axios');
require('dotenv').config();

const LOLHUMAN_API_KEY = process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f';
const BASE_URL = process.env.LOLHUMAN_BASE_URL || 'https://api.lolhuman.xyz';

/**
 * Generic function to call LoLHuman API
 * @param {string} endpoint - API endpoint (e.g., '/api/ytdownload')
 * @param {object} params - Additional parameters
 * @returns {Promise} - API response
 */
async function callLoLHumanAPI(endpoint, params = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const response = await axios.get(url, {
            params: {
                apikey: LOLHUMAN_API_KEY,
                ...params
            },
            timeout: 60000 // 60 seconds timeout
        });

        if (response.data && response.data.status === 200) {
            return {
                success: true,
                data: response.data.result
            };
        } else {
            return {
                success: false,
                error: response.data?.message || 'Unknown error'
            };
        }
    } catch (error) {
        console.error(`LoLHuman API Error [${endpoint}]:`, error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Download media buffer from URL
 * @param {string} url - Media URL
 * @returns {Promise<Buffer>} - Media buffer
 */
async function downloadMediaBuffer(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 60000
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error downloading media:', error.message);
        throw error;
    }
}

// ===== DOWNLOADER SERVICES =====
async function downloadYoutube(url) {
    return callLoLHumanAPI('/api/ytdownload', { url });
}

async function downloadTikTok(url) {
    return callLoLHumanAPI('/api/tiktok', { url });
}

async function downloadInstagram(url) {
    return callLoLHumanAPI('/api/instagram', { url });
}

async function downloadTwitter(url) {
    return callLoLHumanAPI('/api/twitter', { url });
}

async function downloadFacebook(url) {
    return callLoLHumanAPI('/api/facebook', { url });
}

// ===== SEARCH & INFORMATION =====
async function getWikipedia(query) {
    return callLoLHumanAPI('/api/wikipedia', { query });
}

async function getKBBI(word) {
    return callLoLHumanAPI('/api/kbbien', { kata: word });
}

async function checkUsername(platform, username) {
    return callLoLHumanAPI('/api/username/check', { platform, username });
}

async function createShortLink(url) {
    return callLoLHumanAPI('/api/shortlink', { url });
}

async function getLyrics(query) {
    return callLoLHumanAPI('/api/lyrics', { query });
}

// ===== IMAGE PROCESSING =====
async function generateMeme(topText, bottomText, imageUrl) {
    return callLoLHumanAPI('/api/meme', { 
        top: topText, 
        bottom: bottomText, 
        image: imageUrl 
    });
}

async function applyImageFilter(filter, imageUrl) {
    return callLoLHumanAPI('/api/imgfilter', { filter, image: imageUrl });
}

async function getAvatar(username) {
    return callLoLHumanAPI('/api/avatar', { username });
}

async function generateQRCode(text) {
    return callLoLHumanAPI('/api/qrcode', { text });
}

async function getPinterest(query) {
    return callLoLHumanAPI('/api/pinterest', { query });
}

// ===== ANIME & MANGA =====
async function getRandomAnime() {
    return callLoLHumanAPI('/api/anime/random');
}

async function getAnimeQuotes() {
    return callLoLHumanAPI('/api/anime/quotes');
}

async function searchAnime(query) {
    return callLoLHumanAPI('/api/anime/search', { query });
}

async function getAnimeDetail(id) {
    return callLoLHumanAPI('/api/anime/detail', { id });
}

// ===== QURAN =====
async function getQuranSurahList() {
    return callLoLHumanAPI('/api/quran/listsurah');
}

async function getQuranSurah(surah) {
    return callLoLHumanAPI('/api/quran/surah', { surah });
}

async function getQuranAudio(surah) {
    return callLoLHumanAPI('/api/quran/audio', { surah });
}

async function getAsmaulHusna() {
    return callLoLHumanAPI('/api/quran/asmaulhusna');
}

// ===== UTILITY =====
async function textToSpeech(text, lang = 'id') {
    return callLoLHumanAPI('/api/tts', { text, lang });
}

async function getRandomFact() {
    return callLoLHumanAPI('/api/random/fact');
}

async function getWeather(city) {
    return callLoLHumanAPI('/api/weather', { city });
}

async function getJadwalSholat(city) {
    return callLoLHumanAPI('/api/jadwalsholat', { kota: city });
}

async function getJadwalTV(channel) {
    return callLoLHumanAPI('/api/jadwaltv', { channel });
}

module.exports = {
    // Core
    callLoLHumanAPI,
    downloadMediaBuffer,
    
    // Downloader
    downloadYoutube,
    downloadTikTok,
    downloadInstagram,
    downloadTwitter,
    downloadFacebook,
    
    // Search & Information
    getWikipedia,
    getKBBI,
    checkUsername,
    createShortLink,
    getLyrics,
    
    // Image Processing
    generateMeme,
    applyImageFilter,
    getAvatar,
    generateQRCode,
    getPinterest,
    
    // Anime & Manga
    getRandomAnime,
    getAnimeQuotes,
    searchAnime,
    getAnimeDetail,
    
    // Quran
    getQuranSurahList,
    getQuranSurah,
    getQuranAudio,
    getAsmaulHusna,
    
    // Utility
    textToSpeech,
    getRandomFact,
    getWeather,
    getJadwalSholat,
    getJadwalTV
};
