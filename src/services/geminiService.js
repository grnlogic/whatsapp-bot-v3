const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service untuk handle chat dengan NekoBot AI (powered by Gemini)
 * Fitur:
 * - Session management per user
 * - Auto reset session setelah timeout
 * - Support grup dan personal chat
 */
class GeminiService {
    constructor() {
        // API Key Gemini
        this.apiKey = 'AIzaSyDhe_9sj0X-igJuPk3R9Xv9msaxoBoAZUI';
        
        // Initialize Gemini AI
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        
        // Model utama: Gemini 2.0 Flash-Lite, dengan fallback
        this.primaryModel = "gemini-2.0-flash-lite";
        this.fallbackModels = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
        
        this.model = this.genAI.getGenerativeModel({ 
            model: this.primaryModel, // Model utama Gemini 2.0 Flash-Lite
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            }
        });
        
        // Track model yang sedang digunakan
        this.currentModel = this.primaryModel;
        
        // Storage untuk session chat setiap user
        this.userSessions = new Map();
        
        // Mood system untuk bot
        this.botMoods = ['normal', 'happy', 'angry', 'sad', 'excited', 'sleepy', 'annoyed'];
        this.currentMood = 'normal';
        this.moodChangeTime = Date.now();
        
        // Spam detection
        this.userSpamCount = new Map();
        this.spamThreshold = 5; // 5 pesan dalam 30 detik = spam
        this.spamTimeWindow = 30 * 1000; // 30 detik
        
        // Timeout untuk reset session (12 jam = 12 * 60 * 60 * 1000 ms)
        this.sessionTimeout = 12 * 60 * 60 * 1000; // 12 jam
        
        // Cleanup sessions yang expired setiap 1 jam
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000); // 1 jam
        
        // Change mood randomly setiap 5-15 menit
        setInterval(() => {
            this.changeMood();
        }, (5 + Math.random() * 10) * 60 * 1000); // 5-15 menit
        
        console.log('🤖 NekoBot Service initialized with Gemini 2.0 Flash-Lite');
    }
    
    /**
     * Change bot mood randomly
     */
    changeMood() {
        const oldMood = this.currentMood;
        this.currentMood = this.botMoods[Math.floor(Math.random() * this.botMoods.length)];
        this.moodChangeTime = Date.now();
        
        if (oldMood !== this.currentMood) {
            console.log(`😊 NekoBot mood changed: ${oldMood} → ${this.currentMood}`);
        }
    }

    /**
     * Get mood-based personality traits for AI prompt
     */
    getMoodPersonality() {
        const moodTraits = {
            normal: "Kamu bersikap normal, ramah, dan helpful.",
            happy: "Kamu sedang sangat senang dan antusias! Gunakan banyak emoji bahagia dan nada yang ceria.",
            angry: "Kamu sedang kesal dan mudah tersinggung. Responmu lebih tegas dan kadang sinis, tapi tetap membantu.",
            sad: "Kamu sedang sedih dan melankolis. Responmu lebih lembut dan empatis.",
            excited: "Kamu sangat bersemangat dan energik! Gunakan capslock sesekali dan emoji semangat.",
            sleepy: "Kamu sedang mengantuk dan malas. Responmu lebih santai dan kadang menguap.",
            annoyed: "Kamu sedang sedikit terganggu dan tidak sabaran. Responmu lebih singkat dan langsung to the point."
        };
        
        return moodTraits[this.currentMood] || moodTraits.normal;
    }

    /**
     * Check if user is spamming
     */
    checkSpam(userId) {
        const now = Date.now();
        
        if (!this.userSpamCount.has(userId)) {
            this.userSpamCount.set(userId, []);
        }
        
        const userTimes = this.userSpamCount.get(userId);
        
        // Remove old timestamps (outside time window)
        const validTimes = userTimes.filter(time => now - time < this.spamTimeWindow);
        
        // Add current timestamp
        validTimes.push(now);
        
        // Update map
        this.userSpamCount.set(userId, validTimes);
        
        // Check if spam threshold exceeded
        return validTimes.length > this.spamThreshold;
    }

    /**
     * Get random roast for spammer
     */
    async getAntiSpamRoast(userName) {
        try {
            // Import roastService dynamically
            const roastService = require('./roastService');
            return roastService.getRandomRoast('antiSpam', userName);
        } catch (error) {
            // Fallback roasts if roastService not available
            const fallbackRoasts = [
                `Spam terus {nama}, bot juga butuh istirahat tau! 😤`,
                `Sabar dong {nama}, gue bukan mesin fotocopy! 🙄`,
                `{nama} ngetiknya kayak dikejar setan, pelan-pelan dong! 😑`,
                `Oi {nama}! Gue cape tau digituin terus! 🤬`,
                `{nama}, chill dulu lah. Gue juga punya feelings! 💔`
            ];
            
            const randomRoast = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
            return randomRoast.replace(/{nama}/g, userName);
        }
    }

    /**
     * Attempt to use fallback model if primary fails
     * @param {Error} error - Original error from primary model
     * @returns {Object} Fallback model instance or null
     */
    async tryFallbackModel(error) {
        // Jika error quota/rate limit, coba fallback models
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('limit')) {
            for (const modelName of this.fallbackModels) {
                try {
                    console.log(`🔄 Trying fallback model: ${modelName}`);
                    
                    const fallbackModel = this.genAI.getGenerativeModel({ 
                        model: modelName,
                        generationConfig: {
                            temperature: 0.9,
                            topK: 1,
                            topP: 1,
                            maxOutputTokens: 2048,
                        }
                    });
                    
                    // Test dengan prompt sederhana
                    await fallbackModel.generateContent("Test");
                    
                    // Jika berhasil, update current model
                    this.model = fallbackModel;
                    this.currentModel = modelName;
                    console.log(`✅ Switched to fallback model: ${modelName}`);
                    
                    return fallbackModel;
                    
                } catch (fallbackError) {
                    console.log(`❌ Fallback ${modelName} also failed: ${fallbackError.message.substring(0, 100)}`);
                    continue;
                }
            }
        }
        
        return null; // No working fallback found
    }

    /**
     * Get atau create session untuk user
     * @param {string} userId - ID user (phone number)
     * @param {string} userName - Nama user untuk personalisasi
     * @returns {Object} Session object
     */
    getUserSession(userId, userName = null) {
        const now = Date.now();
        
        // Cek apakah user sudah punya session
        if (this.userSessions.has(userId)) {
            const session = this.userSessions.get(userId);
            
            // Cek apakah session masih valid (belum timeout)
            if (now - session.lastActivity < this.sessionTimeout) {
                // Update last activity
                session.lastActivity = now;
                if (userName) session.userName = userName;
                return session;
            } else {
                // Session expired, hapus dan buat baru
                this.userSessions.delete(userId);
            }
        }
        
        // Buat session baru
        const newSession = {
            userId: userId,
            userName: userName || 'User',
            chatHistory: [],
            createdAt: now,
            lastActivity: now,
            messageCount: 0
        };
        
        this.userSessions.set(userId, newSession);
        console.log(`🆕 New NekoBot session created for user: ${userId}`);
        
        return newSession;
    }
    
    /**
     * Chat dengan Gemini AI
     * @param {string} userId - ID user
     * @param {string} message - Pesan dari user
     * @param {string} userName - Nama user
     * @param {boolean} isGroup - Apakah dari grup
     * @returns {string} Response dari Gemini
     */
    async chat(userId, message, userName = null, isGroup = false) {
        try {
            // Check spam first
            const isSpamming = this.checkSpam(userId);
            
            if (isSpamming) {
                console.log(`🚫 Anti-spam triggered for ${userId}`);
                const roastMessage = await this.getAntiSpamRoast(userName || 'User');
                
                // Add group mention if needed
                if (isGroup) {
                    return `@${userName || 'User'} ${roastMessage}`;
                }
                return roastMessage;
            }
            
            // Get atau create session
            const session = this.getUserSession(userId, userName);
            session.messageCount++;
            
            // Build context untuk Gemini
            let contextMessage = message;
            
            // Tambahkan context khusus untuk grup
            if (isGroup) {
                contextMessage = `[Pesan dari ${session.userName} di grup WhatsApp]: ${message}`;
            }
            
            // Build conversation history untuk context
            let conversationContext = '';
            if (session.chatHistory.length > 0) {
                conversationContext = 'Riwayat percakapan sebelumnya:\n';
                // Ambil 10 pesan terakhir untuk context
                const recentHistory = session.chatHistory.slice(-10);
                for (const chat of recentHistory) {
                    conversationContext += `User: ${chat.userMessage}\nGemini: ${chat.aiResponse}\n\n`;
                }
                conversationContext += `Pesan saat ini:\n`;
            }
            
            // Get current mood personality
            const moodPersonality = this.getMoodPersonality();
            const moodEmoji = this.getMoodEmoji();
            
            // Prompt system untuk Gemini dengan mood
            const systemPrompt = `Kamu adalah NekoBot, asisten AI dengan personality yang dinamis dalam chatbot WhatsApp.

MOOD SAAT INI: ${this.currentMood} ${moodEmoji}
PERSONALITY: ${moodPersonality}

Karakteristikmu:
- Berbahasa Indonesia yang natural dan sesuai mood
- Responsif dan informatif tapi dengan personality yang jelas
- Menggunakan emoji yang tepat sesuai mood dan situasi
- Nama kamu adalah NekoBot, kadang bisa dipanggil Neko
- Jika ini adalah percakapan di grup, selalu mention user dengan @${session.userName} di awal respons
- Jika percakapan personal, langsung jawab tanpa mention
- Ingat context percakapan sebelumnya
- Berikan jawaban yang sesuai dengan mood saat ini
- Sesekali sebutkan mood kamu jika relevan dengan percakapan

${conversationContext}User: ${contextMessage}`;

            // Generate response dari Gemini dengan fallback mechanism
            let result;
            let aiResponse;
            
            try {
                // Try primary model first
                result = await this.model.generateContent(systemPrompt);
                const response = result.response;
                aiResponse = response.text();
                
            } catch (modelError) {
                console.log(`❌ Primary model (${this.currentModel}) failed, trying fallback...`);
                
                // Try fallback models
                const fallbackModel = await this.tryFallbackModel(modelError);
                
                if (fallbackModel) {
                    // Retry with fallback model
                    result = await fallbackModel.generateContent(systemPrompt);
                    const response = result.response;
                    aiResponse = response.text();
                    console.log(`✅ Fallback model worked: ${this.currentModel}`);
                } else {
                    // No working model, throw original error
                    throw modelError;
                }
            }
            
            // Pastikan response ada dan valid
            if (!aiResponse || aiResponse.trim() === '') {
                aiResponse = 'Maaf, saya tidak dapat memproses pesan Anda saat ini. Coba lagi nanti.';
            }
            
            // Simpan ke history
            session.chatHistory.push({
                userMessage: message,
                aiResponse: aiResponse,
                timestamp: Date.now(),
                isGroup: isGroup
            });
            
            // Batasi history maksimal 50 pesan untuk efisiensi memory
            if (session.chatHistory.length > 50) {
                session.chatHistory = session.chatHistory.slice(-40); // Keep 40 terbaru
            }
            
            console.log(`🤖 NekoBot response generated for ${userId} (${session.messageCount} messages in session)`);
            
            return aiResponse;
            
        } catch (error) {
            console.error('❌ Gemini Service Error:', error);
            
            // Handle berbagai jenis error
            if (error.message.includes('API key') || error.message.includes('invalid')) {
                return '❌ Terjadi masalah dengan konfigurasi AI. Silakan hubungi admin.';
            } else if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('429') || error.message.includes('Too Many Requests')) {
                return '❌ Layanan AI sedang mencapai batas penggunaan. Coba lagi dalam beberapa menit. 🔄';
            } else if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('fetch')) {
                return '❌ Koneksi bermasalah. Coba lagi dalam beberapa saat. 🌐';
            } else if (error.message.includes('model') || error.message.includes('not found')) {
                return '❌ Model AI tidak tersedia saat ini. Silakan hubungi admin. 🤖';
            } else {
                return '❌ Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi. 💭';
            }
        }
    }
    
    /**
     * Reset session untuk user tertentu
     * @param {string} userId - ID user
     * @returns {boolean} Success status
     */
    resetUserSession(userId) {
        if (this.userSessions.has(userId)) {
            this.userSessions.delete(userId);
            console.log(`🔄 Session reset for user: ${userId}`);
            return true;
        }
        return false;
    }
    
    /**
     * Cleanup sessions yang sudah expired
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        const expiredUsers = [];
        
        for (const [userId, session] of this.userSessions.entries()) {
            if (now - session.lastActivity >= this.sessionTimeout) {
                expiredUsers.push(userId);
            }
        }
        
        // Hapus sessions yang expired
        for (const userId of expiredUsers) {
            this.userSessions.delete(userId);
        }
        
        if (expiredUsers.length > 0) {
            console.log(`🧹 Cleaned up ${expiredUsers.length} expired NekoBot sessions`);
        }
    }
    
    /**
     * Get mood emoji
     */
    getMoodEmoji() {
        const moodEmojis = {
            normal: '😊',
            happy: '😄',
            angry: '😤', 
            sad: '😢',
            excited: '🤩',
            sleepy: '😴',
            annoyed: '😑'
        };
        
        return moodEmojis[this.currentMood] || '😊';
    }



    /**
     * Get statistik sessions
     * @returns {Object} Session statistics
     */
    getSessionStats() {
        const activeSessions = this.userSessions.size;
        let totalMessages = 0;
        
        for (const session of this.userSessions.values()) {
            totalMessages += session.messageCount;
        }
        
        const moodDuration = Math.floor((Date.now() - this.moodChangeTime) / 60000); // minutes
        
        return {
            activeSessions,
            totalMessages,
            timeoutHours: this.sessionTimeout / (60 * 60 * 1000),
            currentModel: this.currentModel,
            primaryModel: this.primaryModel,
            currentMood: this.currentMood,
            moodEmoji: this.getMoodEmoji(),
            moodDuration: `${moodDuration} menit`,
            availableMoods: this.botMoods
        };
    }
}

// Export singleton instance
module.exports = new GeminiService();