/**
 * Bot State Service
 * Mengelola state operasional bot (sleep/active mode)
 */

let botState = {
    isSleeping: false,
    sleepStartTime: null,
    sleepBy: null
};

/**
 * Check if bot is in sleep mode
 * @returns {boolean}
 */
function isSleeping() {
    return botState.isSleeping;
}

/**
 * Set bot sleep state
 * @param {boolean} sleeping - True to put bot to sleep, false to wake up
 * @param {string} userId - User ID who changed the state (optional)
 */
function setSleeping(sleeping, userId = null) {
    botState.isSleeping = sleeping;
    
    if (sleeping) {
        botState.sleepStartTime = Date.now();
        botState.sleepBy = userId;
    } else {
        botState.sleepStartTime = null;
        botState.sleepBy = null;
    }
    
    console.log(`🤖 Bot state changed: ${sleeping ? 'SLEEPING' : 'ACTIVE'} ${userId ? `by ${userId}` : ''}`);
}

/**
 * Get sleep start time
 * @returns {number|null} - Timestamp when bot entered sleep mode
 */
function getSleepStartTime() {
    return botState.sleepStartTime;
}

/**
 * Get sleep duration in formatted string
 * @returns {string}
 */
function getSleepDuration() {
    if (!botState.isSleeping || !botState.sleepStartTime) {
        return 'Not sleeping';
    }
    
    const durationMs = Date.now() - botState.sleepStartTime;
    const seconds = Math.floor(durationMs / 1000);
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} hari`);
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} detik`);
    
    return parts.join(', ');
}

/**
 * Get who put the bot to sleep
 * @returns {string|null}
 */
function getSleepBy() {
    return botState.sleepBy;
}

/**
 * Get all bot state info
 * @returns {object}
 */
function getState() {
    return {
        ...botState,
        sleepDuration: getSleepDuration()
    };
}

module.exports = {
    isSleeping,
    setSleeping,
    getSleepStartTime,
    getSleepDuration,
    getSleepBy,
    getState
};
