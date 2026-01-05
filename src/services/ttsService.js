const { Client } = require("@gradio/client");
const fs = require('fs-extra');
const path = require('path');
const https = require('https');

/**
 * Text-to-Speech Service menggunakan VITS-Umamusume voice synthesizer
 * Fitur:
 * - Multi-character voice synthesis
 * - Multi-language support
 * - Speed control
 * - Audio file caching
 * - Error handling dengan retry mechanism
 */
class TTSService {
    constructor() {
        this.apiEndpoint = "Plachta/VITS-Umamusume-voice-synthesizer";
        this.client = null;
        this.isConnected = false;
        
        // Temporary directory untuk audio files
        this.tempDir = path.join(__dirname, '../../temp');
        this.audioDir = path.join(this.tempDir, 'tts');
        
        // Ensure directories exist
        this.initDirectories();
        
        // Available characters/speakers - Simplified with only Grass Wonder
        this.speakers = [
            "草上飞 Grass Wonder (Umamusume Pretty Derby)"
        ];
        
        // Available languages - Simplified to Japanese only
        this.languages = {
            "japanese": "日本語",
            "jp": "日本語", 
            "日本語": "日本語"
        };
        
        // Default settings - Simplified with Grass Wonder only
        this.defaultSettings = {
            speaker: "草上飞 Grass Wonder (Umamusume Pretty Derby)", // Clean and clear voice
            language: "日本語",
            speed: 1.0,
            is_symbol: false
        };
        
        // Cache untuk audio yang sudah dibuat
        this.audioCache = new Map();
        this.maxCacheSize = 50; // Maksimal 50 file audio di cache
        
        // Rate limiting
        this.lastRequest = 0;
        this.minRequestInterval = 2000; // 2 detik antara request
        
        // Initialize connection
        this.connect();
        
        console.log('🎵 TTS Service initialized');
    }
    
    /**
     * Initialize directories
     */
    async initDirectories() {
        try {
            await fs.ensureDir(this.tempDir);
            await fs.ensureDir(this.audioDir);
            console.log('📁 TTS directories initialized');
        } catch (error) {
            console.error('❌ Failed to initialize TTS directories:', error);
        }
    }
    
    /**
     * Connect to Gradio API
     */
    async connect() {
        try {
            if (this.isConnected) return true;
            
            console.log('🔌 Connecting to TTS API...');
            this.client = await Client.connect(this.apiEndpoint);
            this.isConnected = true;
            console.log('✅ TTS API connected successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to connect to TTS API:', error);
            this.isConnected = false;
            return false;
        }
    }
    
    /**
     * Reconnect jika koneksi terputus
     */
    async reconnect() {
        this.isConnected = false;
        this.client = null;
        return await this.connect();
    }
    
    /**
     * Get available speakers list
     */
    getSpeakers() {
        return this.speakers.map((speaker, index) => ({
            id: index + 1,
            name: speaker,
            shortName: this.getSpeakerShortName(speaker)
        }));
    }
    
    /**
     * Get short name for speaker - Simplified
     */
    getSpeakerShortName(speaker) {
        // Only Grass Wonder available
        if (speaker === "草上飞 Grass Wonder (Umamusume Pretty Derby)" || !speaker) {
            return "Grass Wonder";
        }
        return "Grass Wonder"; // Fallback to only available speaker
    }
    
    /**
     * Parse speaker input - Simplified (only Grass Wonder)
     */
    parseSpeaker(input) {
        // Always return Grass Wonder as it's the only available speaker
        return this.defaultSettings.speaker;
    }
    
    /**
     * Parse language input - Simplified (Japanese only)
     */
    parseLanguage(input) {
        // Always return Japanese as it's the only available language
        return this.defaultSettings.language;
    }
    
    /**
     * Parse speed input
     */
    parseSpeed(input) {
        if (!input) return this.defaultSettings.speed;
        
        const speed = parseFloat(input);
        if (isNaN(speed)) return this.defaultSettings.speed;
        
        // Clamp between 0.1 and 2.0
        return Math.max(0.1, Math.min(2.0, speed));
    }
    
    /**
     * Generate cache key for audio
     */
    generateCacheKey(text, speaker, language, speed, isSymbol) {
        const data = { text, speaker, language, speed, isSymbol };
        return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 32);
    }
    
    /**
     * Check rate limiting
     */
    async checkRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequest = Date.now();
    }
    
    /**
     * Download audio from URL
     */
    async downloadAudio(audioUrl, filename) {
        return new Promise((resolve, reject) => {
            const filePath = path.join(this.audioDir, filename);
            const file = fs.createWriteStream(filePath);
            
            https.get(audioUrl, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    return;
                }
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve(filePath);
                });
                
                file.on('error', (error) => {
                    fs.unlink(filePath, () => {}); // Delete partial file
                    reject(error);
                });
                
            }).on('error', reject);
        });
    }
    
    /**
     * Clean up old cache files
     */
    async cleanupCache() {
        try {
            if (this.audioCache.size >= this.maxCacheSize) {
                // Remove oldest entries
                const entriesToRemove = Math.floor(this.maxCacheSize * 0.3); // Remove 30%
                const oldestEntries = Array.from(this.audioCache.entries())
                    .sort((a, b) => a[1].timestamp - b[1].timestamp)
                    .slice(0, entriesToRemove);
                
                for (const [key, entry] of oldestEntries) {
                    try {
                        await fs.unlink(entry.filePath);
                        this.audioCache.delete(key);
                    } catch (error) {
                        // File might already be deleted
                        this.audioCache.delete(key);
                    }
                }
                
                console.log(`🧹 Cleaned up ${entriesToRemove} old TTS cache files`);
            }
        } catch (error) {
            console.error('❌ Error cleaning up TTS cache:', error);
        }
    }
    
    /**
     * Convert text to speech
     * @param {string} text - Text to convert
     * @param {Object} options - TTS options
     * @returns {string} Path to audio file
     */
    async generateSpeech(text, options = {}) {
        try {
            // Parse options
            const speaker = this.parseSpeaker(options.speaker);
            const language = this.parseLanguage(options.language);
            const speed = this.parseSpeed(options.speed);
            const isSymbol = options.isSymbol || false;
            
            // Validate text
            if (!text || text.trim().length === 0) {
                throw new Error('Text tidak boleh kosong');
            }
            
            if (text.length > 500) {
                throw new Error('Text terlalu panjang (maksimal 500 karakter)');
            }
            
            // Check cache first
            const cacheKey = this.generateCacheKey(text, speaker, language, speed, isSymbol);
            
            if (this.audioCache.has(cacheKey)) {
                const cachedEntry = this.audioCache.get(cacheKey);
                // Check if file still exists
                if (await fs.pathExists(cachedEntry.filePath)) {
                    console.log('📦 Using cached TTS audio');
                    return cachedEntry.filePath;
                } else {
                    // File deleted, remove from cache
                    this.audioCache.delete(cacheKey);
                }
            }
            
            // Ensure connected
            if (!this.isConnected) {
                const connected = await this.reconnect();
                if (!connected) {
                    throw new Error('Tidak dapat terhubung ke layanan TTS');
                }
            }
            
            // Rate limiting
            await this.checkRateLimit();
            
            console.log(`🎵 Generating TTS: "${text.substring(0, 50)}..." with ${this.getSpeakerShortName(speaker)}`);
            
            // Call TTS API
            const result = await this.client.predict("/tts_fn", {
                text: text,
                speaker: speaker,
                language: language,
                speed: speed,
                is_symbol: isSymbol
            });
            
            // Check result
            if (!result || !result.data || !result.data[1] || !result.data[1].url) {
                throw new Error('Response dari TTS API tidak valid');
            }
            
            const audioUrl = result.data[1].url;
            const message = result.data[0] || 'TTS generated successfully';
            
            // Download audio file
            const filename = `tts_${cacheKey}_${Date.now()}.wav`;
            const filePath = await this.downloadAudio(audioUrl, filename);
            
            // Add to cache
            this.audioCache.set(cacheKey, {
                filePath: filePath,
                timestamp: Date.now(),
                text: text.substring(0, 100),
                speaker: this.getSpeakerShortName(speaker)
            });
            
            // Cleanup old cache if needed
            await this.cleanupCache();
            
            console.log(`✅ TTS generated successfully: ${filename}`);
            console.log(`📝 Message: ${message}`);
            
            return filePath;
            
        } catch (error) {
            console.error('❌ TTS Generation Error:', error);
            
            // Handle specific errors
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                throw new Error('🚫 Terlalu banyak permintaan TTS. Coba lagi dalam beberapa detik.');
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error('🚫 Kuota TTS habis. Coba lagi nanti.');
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                throw new Error('🌐 Masalah koneksi. Coba lagi dalam beberapa saat.');
            } else if (error.message.includes('Text terlalu panjang') || error.message.includes('Text tidak boleh kosong')) {
                throw error; // Pass validation errors as-is
            } else {
                throw new Error(`❌ Gagal membuat audio: ${error.message}`);
            }
        }
    }
    
    /**
     * Get TTS statistics
     */
    getStats() {
        return {
            isConnected: this.isConnected,
            cacheSize: this.audioCache.size,
            maxCacheSize: this.maxCacheSize,
            availableSpeakers: this.speakers.length,
            supportedLanguages: Object.keys(this.languages).length,
            lastRequestTime: this.lastRequest ? new Date(this.lastRequest).toISOString() : null
        };
    }
    
    /**
     * Clear all cached audio files
     */
    async clearCache() {
        try {
            let deletedCount = 0;
            
            for (const [key, entry] of this.audioCache.entries()) {
                try {
                    await fs.unlink(entry.filePath);
                    deletedCount++;
                } catch (error) {
                    // File might already be deleted
                }
                this.audioCache.delete(key);
            }
            
            console.log(`🧹 Cleared ${deletedCount} TTS cache files`);
            return deletedCount;
            
        } catch (error) {
            console.error('❌ Error clearing TTS cache:', error);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new TTSService();