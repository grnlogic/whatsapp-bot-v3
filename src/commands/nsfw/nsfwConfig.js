const axios = require('axios');
const { isUserApproved } = require('../../services/nsfwDatabaseService');

/**
 * NSFW Content Configuration
 * Sistem untuk mengatur akses konten 18+ dengan database registrasi
 */

// ===== DEVELOPER/OWNER BOT =====
// Tambahkan nomor WhatsApp developer/owner bot di sini
// Format: '6289507654588@c.us' (tanpa +, pakai 62 untuk Indonesia)
const DEVELOPER_NUMBERS = [
    '6289507654588@c.us',      // Nomor utama (Indonesia)
    '41928125116527@lid',      // Linked device (Swiss)
    // Tambahkan co-owner jika ada
];

// Daftar user yang diizinkan akses konten NSFW (berdasarkan nomor telepon)
// Format: '628123456789@c.us'
const NSFW_WHITELIST = [
    // Tambahkan nomor yang diizinkan di sini (selain developer)
    // '628123456789@c.us',
];

// Daftar grup yang diizinkan konten NSFW
const NSFW_ALLOWED_GROUPS = [
    // Tambahkan group ID di sini
    // '1234567890-1234567890@g.us',
];

// Mode: 'developer_only' | 'whitelist' | 'blacklist' | 'admin_only' | 'disabled'
const NSFW_MODE = 'developer_only'; // Default: developer_only (hanya owner bot)

/**
 * Check if user is developer/owner
 * @param {string} sender - Sender ID
 * @returns {boolean} - True if developer
 */
function isDeveloper(sender) {
    return DEVELOPER_NUMBERS.includes(sender);
}

/**
 * Check if user is allowed to access NSFW content
 * @param {Object} msg - WhatsApp message object
 * @returns {boolean} - True if allowed
 */
async function checkNSFWAccess(msg) {
    // Get sender ID (works for both personal and group)
    const sender = msg.author || msg.from;
    const chat = await msg.getChat();
    
    // Developer always has access (except when disabled)
    if (NSFW_MODE !== 'disabled' && isDeveloper(sender)) {
        return true;
    }
    
    // Check database untuk approved users (works di semua mode kecuali disabled)
    if (NSFW_MODE !== 'disabled') {
        const approvedUser = await isUserApproved(sender);
        if (approvedUser) {
            return true; // User sudah diverifikasi via !daftar + !verify approve
        }
    }
    
    // Check mode
    if (NSFW_MODE === 'disabled') {
        return false;
    }
    
    // Developer only mode
    if (NSFW_MODE === 'developer_only') {
        return isDeveloper(sender);
    }
    
    // Admin only mode
    if (NSFW_MODE === 'admin_only') {
        if (chat.isGroup) {
            const participant = chat.participants.find(p => p.id._serialized === sender);
            return participant?.isAdmin || participant?.isSuperAdmin;
        }
        return false;
    }
    
    // Whitelist mode (developer + whitelist)
    if (NSFW_MODE === 'whitelist') {
        if (chat.isGroup) {
            return NSFW_ALLOWED_GROUPS.includes(chat.id._serialized);
        }
        return NSFW_WHITELIST.includes(sender);
    }
    
    // Blacklist mode (allow all except blacklisted)
    if (NSFW_MODE === 'blacklist') {
        // Implement blacklist logic here if needed
        return true;
    }
    
    return false;
}

/**
 * Get NSFW access denied message
 * @returns {string} - Denial message
 */
function getNSFWDeniedMessage() {
    const messages = {
        'disabled': '- Fitur NSFW dinonaktifkan oleh admin bot',
        'developer_only': '- Hanya developer/owner bot dan approved users yang dapat mengakses',
        'whitelist': '- User/Grup tidak ada dalam whitelist',
        'admin_only': '- Hanya admin grup yang dapat mengakses',
        'blacklist': '- User/Grup ada dalam blacklist'
    };
    
    return `🔞 *Akses Ditolak*

Konten ini adalah konten 18+ dan memerlukan izin khusus.

⚠️ *Alasan akses ditolak:*
${messages[NSFW_MODE] || '- Mode tidak dikenali'}

📝 *Cara mendapatkan akses:*
1. Daftar dengan: \`!daftar <nama>\`
2. Tunggu approval dari admin
3. Setelah diapprove, Anda bisa akses konten NSFW

💡 Hubungi owner bot untuk informasi lebih lanjut.`;
}

module.exports = {
    DEVELOPER_NUMBERS,
    NSFW_WHITELIST,
    NSFW_ALLOWED_GROUPS,
    NSFW_MODE,
    isDeveloper,
    checkNSFWAccess,
    getNSFWDeniedMessage
};
