const geminiService = require('../services/geminiService');

/**
 * Command untuk chat dengan Gemini AI menggunakan NekoBot
 * Fitur:
 * - Chat natural dengan AI
 * - Session per user dengan timeout 12 jam
 * - Support grup dan personal chat dengan mention
 * - Command untuk reset session
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments command
 */
async function geminiCommand(client, message, args) {
    try {
        const chat = await message.getChat();
        const isGroup = chat.isGroup;
        
        // Get user info
        const userId = message.author || message.from;
        const userPhone = userId.split('@')[0];
        
        // Get contact name untuk personalisasi
        let userName = userPhone;
        try {
            const contact = await message.getContact();
            userName = contact.pushname || contact.name || userPhone;
        } catch (e) {
            // Fallback ke phone number
        }
        
        // Cek sub-command
        const subCommand = args[0]?.toLowerCase();
        
        if (subCommand === 'reset' || subCommand === 'clear' || subCommand === 'restart') {
            // Reset session user
            const resetSuccess = geminiService.resetUserSession(userId);
            if (resetSuccess) {
                const replyText = isGroup 
                    ? `@${userName} ✅ Session chat dengan NekoBot sudah direset! 🔄`
                    : '✅ Session chat dengan NekoBot sudah direset! 🔄';
                await message.reply(replyText);
            } else {
                const replyText = isGroup
                    ? `@${userName} ℹ️ Kamu belum punya session chat yang aktif.`
                    : 'ℹ️ Kamu belum punya session chat yang aktif.';
                await message.reply(replyText);
            }
            return;
        }
        
        if (subCommand === 'stats' || subCommand === 'status') {
            // Show statistics (hanya untuk admin atau owner)
            const stats = geminiService.getSessionStats();
            const statsText = `📊 *Statistik NekoBot Chat*\n\n` +
                            `🔥 Session aktif: ${stats.activeSessions}\n` +
                            `💬 Total pesan: ${stats.totalMessages}\n` +
                            `⏰ Timeout session: ${stats.timeoutHours} jam\n` +
                            `🤖 Model aktif: ${stats.currentModel}\n\n` +
                            `🎭 *Mood System*\n` +
                            `😊 Mood saat ini: ${stats.currentMood} ${stats.moodEmoji}\n` +
                            `⏱️ Durasi mood: ${stats.moodDuration}\n` +
                            `🎨 Available moods: ${stats.availableMoods.join(', ')}\n\n` +
                            `ℹ️ Session akan reset otomatis jika tidak ada aktivitas selama ${stats.timeoutHours} jam.`;
            
            await message.reply(statsText);
            return;
        }
        
        if (subCommand === 'mood') {
            // Show current mood only (no manual change)
            const stats = geminiService.getSessionStats();
            const moodText = `🎭 *NekoBot Mood System*\n\n` +
                           `😊 Current mood: ${stats.currentMood} ${stats.moodEmoji}\n` +
                           `⏱️ Duration: ${stats.moodDuration}\n\n` +
                           `🎨 *All Moods:*\n${stats.availableMoods.map(m => `• ${m}`).join('\n')}\n\n` +
                           `🌟 *Natural System:*\n` +
                           `Mood berubah otomatis setiap 5-15 menit\n` +
                           `untuk pengalaman chat yang lebih natural! 😊`;
            
            await message.reply(moodText);
            return;
        }
        
        // Jika tidak ada text untuk chat
        if (args.length === 0) {
            const stats = geminiService.getSessionStats();
            const helpText = `🤖 *NekoBot AI Chat*\n\n` +
                           `� Current mood: ${stats.currentMood} ${stats.moodEmoji}\n\n` +
                           `�💬 *Cara menggunakan:*\n` +
                           `• \`!nekobot <pesan>\` - Chat dengan AI\n` +
                           `• \`!ai <pesan>\` - Alias untuk nekobot\n` +
                           `• \`!nekobot reset\` - Reset session chat\n` +
                           `• \`!nekobot stats\` - Lihat statistik\n` +
                           `• \`!nekobot mood\` - Lihat mood system\n\n` +
                           `✨ *Fitur:*\n` +
                           `• Mengingat percakapan (12 jam)\n` +
                           `• Natural mood system 🎭\n` +
                           `• Anti-spam protection 🚫\n` +
                           `• Support grup dengan mention\n` +
                           `• Response dalam Bahasa Indonesia\n` +
                           `• Powered by Gemini 2.0 Flash-Lite\n\n` +
                           `💡 *Contoh:*\n` +
                           `\`!nekobot Apa kabar?\`\n` +
                           `\`!ai Jelaskan tentang AI\`\n` +
                           `\`!nekobot Buatkan puisi tentang cinta\``;
            
            await message.reply(helpText);
            return;
        }
        
        // Gabungkan arguments menjadi satu pesan
        const userMessage = args.join(' ');
        
        // Show typing indicator
        chat.sendStateTyping();
        
        // Log aktivitas chat
        const logMessage = isGroup 
            ? `🤖 NekoBot chat dari +${userPhone} (${userName}) di grup "${chat.name}": "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`
            : `🤖 NekoBot chat dari +${userPhone} (${userName}): "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`;
        console.log(logMessage);
        
        // Get response dari Gemini
        const aiResponse = await geminiService.chat(userId, userMessage, userName, isGroup);
        
        // Send response
        await message.reply(aiResponse);
        
    } catch (error) {
        console.error('❌ Gemini Command Error:', error);
        
        const errorMessage = '❌ Terjadi kesalahan saat memproses pesan Anda.\n\n' +
                            '💡 Tips:\n' +
                            '• Coba lagi dalam beberapa saat\n' +
                            '• Gunakan `!nekobot reset` jika masalah berlanjut\n' +
                            '• Hubungi admin jika error terus terjadi';
        
        await message.reply(errorMessage);
    }
}

/**
 * Command khusus untuk chat langsung (tanpa prefix nekobot)
 * Menggunakan prefix !ai sebagai alias
 */
async function aiCommand(client, message, args) {
    // Redirect ke geminiCommand (nekobot)
    return await geminiCommand(client, message, args);
}

module.exports = {
    geminiCommand,
    aiCommand
};