const fs = require('fs').promises;
const path = require('path');

const BAN_DB_PATH = path.join(__dirname, '../../data/banned_users.json');

// Initialize database if not exists
async function initDatabase() {
    try {
        await fs.access(BAN_DB_PATH);
    } catch (error) {
        const initialData = { banned: [] };
        await fs.writeFile(BAN_DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

// Read database
async function readDatabase() {
    await initDatabase();
    const data = await fs.readFile(BAN_DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Save database
async function saveDatabase(data) {
    await fs.writeFile(BAN_DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * Check if user is banned
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} - True if banned
 */
async function isUserBanned(userId) {
    const db = await readDatabase();
    return db.banned.some(ban => ban.userId === userId);
}

/**
 * Get banned user info
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Banned user info or null
 */
async function getBannedUser(userId) {
    const db = await readDatabase();
    return db.banned.find(ban => ban.userId === userId) || null;
}

/**
 * Ban a user
 * @param {string} userId - User ID to ban
 * @param {string} bannedBy - Developer ID who banned
 * @param {string} reason - Reason for ban
 * @param {string} userName - Optional user name
 * @returns {Promise<object>} - Result object
 */
async function banUser(userId, bannedBy, reason, userName = 'Unknown') {
    const db = await readDatabase();
    
    // Check if already banned
    const existingBan = db.banned.find(ban => ban.userId === userId);
    if (existingBan) {
        return {
            success: false,
            message: 'User sudah dalam banned list',
            ban: existingBan
        };
    }
    
    const banRecord = {
        userId: userId,
        userName: userName,
        bannedAt: new Date().toISOString(),
        bannedBy: bannedBy,
        reason: reason || 'No reason provided'
    };
    
    db.banned.push(banRecord);
    await saveDatabase(db);
    
    return {
        success: true,
        message: 'User berhasil di-ban',
        ban: banRecord
    };
}

/**
 * Unban a user
 * @param {string} userId - User ID to unban
 * @param {string} unbannedBy - Developer ID who unbanned
 * @returns {Promise<object>} - Result object
 */
async function unbanUser(userId, unbannedBy) {
    const db = await readDatabase();
    
    const banIndex = db.banned.findIndex(ban => ban.userId === userId);
    if (banIndex === -1) {
        return {
            success: false,
            message: 'User tidak ada dalam banned list'
        };
    }
    
    const bannedUser = db.banned.splice(banIndex, 1)[0];
    await saveDatabase(db);
    
    return {
        success: true,
        message: 'User berhasil di-unban',
        user: bannedUser
    };
}

/**
 * Get all banned users
 * @returns {Promise<array>} - Array of banned users
 */
async function getAllBannedUsers() {
    const db = await readDatabase();
    return db.banned;
}

/**
 * Get ban statistics
 * @returns {Promise<object>} - Ban statistics
 */
async function getBanStats() {
    const db = await readDatabase();
    return {
        total: db.banned.length,
        list: db.banned
    };
}

module.exports = {
    isUserBanned,
    getBannedUser,
    banUser,
    unbanUser,
    getAllBannedUsers,
    getBanStats
};
