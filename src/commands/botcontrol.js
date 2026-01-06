const { isOwner } = require('./exec');
const botStateService = require('../services/botStateService');

/**
 * Bot Control Command
 * Control bot's operational state (start/stop/status)
 * Hanya bisa digunakan oleh owner/developer
 */

/**
 * Bot Stop - Put bot in sleep mode
 * Usage: !bot stop
 */
async function botStopCommand(client, message) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        // Check if already stopped
        if (botStateService.isSleeping()) {
            return message.reply(
                `⚠️ *Bot Already in Sleep Mode*\n\n` +
                `Bot sudah dalam mode sleep sejak:\n` +
                `${new Date(botStateService.getSleepStartTime()).toLocaleString('id-ID')}\n\n` +
                `Use \`!bot start\` to wake up the bot.`
            );
        }
        
        // Put bot to sleep
        botStateService.setSleeping(true);
        
        const senderPhone = sender.split('@')[0];
        console.log(`🛑 Bot put to sleep by +${senderPhone}`);
        
        await message.reply(
            `🛑 *Bot Entering Sleep Mode*\n\n` +
            `✅ Bot will now ignore all commands from regular users.\n` +
            `⚡ Only owner can use commands during sleep mode.\n\n` +
            `💤 Sleep mode activated at:\n` +
            `${new Date().toLocaleString('id-ID')}\n\n` +
            `📱 Use \`!bot start\` to wake up the bot.`
        );
        
    } catch (error) {
        console.error('❌ Bot stop error:', error);
        await message.reply(`❌ *Error:* ${error.message}`);
    }
}

/**
 * Bot Start - Wake up bot from sleep mode
 * Usage: !bot start
 */
async function botStartCommand(client, message) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        // Check if already running
        if (!botStateService.isSleeping()) {
            return message.reply(
                `✅ *Bot Already Running*\n\n` +
                `Bot sudah dalam mode normal.\n` +
                `Semua user dapat menggunakan commands.`
            );
        }
        
        const sleepDuration = botStateService.getSleepDuration();
        
        // Wake up bot
        botStateService.setSleeping(false);
        
        const senderPhone = sender.split('@')[0];
        console.log(`✅ Bot woken up by +${senderPhone}`);
        
        await message.reply(
            `✅ *Bot is Now Active*\n\n` +
            `🎉 Bot has been woken up from sleep mode!\n` +
            `⚡ All users can now use commands.\n\n` +
            `💤 Sleep duration: ${sleepDuration}\n\n` +
            `🤖 Bot is fully operational.`
        );
        
    } catch (error) {
        console.error('❌ Bot start error:', error);
        await message.reply(`❌ *Error:* ${error.message}`);
    }
}

/**
 * Bot Status - Check bot's current state
 * Usage: !bot status
 */
async function botStatusCommand(client, message) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        const isSleeping = botStateService.isSleeping();
        const uptime = process.uptime();
        const uptimeStr = formatUptime(uptime);
        
        let statusMessage = `📊 *Bot Status*\n\n`;
        
        if (isSleeping) {
            const sleepDuration = botStateService.getSleepDuration();
            const sleepStartTime = new Date(botStateService.getSleepStartTime()).toLocaleString('id-ID');
            
            statusMessage += 
                `💤 *Mode:* Sleep Mode (Inactive)\n` +
                `🛑 *Status:* Ignoring regular users\n` +
                `⏰ *Sleep Since:* ${sleepStartTime}\n` +
                `⏱️ *Sleep Duration:* ${sleepDuration}\n` +
                `👑 *Owner Commands:* Active\n\n` +
                `📱 Use \`!bot start\` to wake up.`;
        } else {
            statusMessage += 
                `✅ *Mode:* Active (Normal)\n` +
                `🟢 *Status:* Accepting all commands\n` +
                `⏱️ *Uptime:* ${uptimeStr}\n` +
                `👥 *User Access:* All users\n\n` +
                `🤖 Bot is fully operational.`;
        }
        
        // System info
        const memUsage = process.memoryUsage();
        const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
        
        statusMessage += `\n\n📈 *System Info:*\n`;
        statusMessage += `💾 Memory: ${memUsedMB}MB / ${memTotalMB}MB\n`;
        statusMessage += `⏰ Uptime: ${uptimeStr}`;
        
        await message.reply(statusMessage);
        
        console.log(`✅ Bot status checked by ${sender}`);
        
    } catch (error) {
        console.error('❌ Bot status error:', error);
        await message.reply(`❌ *Error:* ${error.message}`);
    }
}

/**
 * Format uptime to readable string
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

module.exports = {
    botStopCommand,
    botStartCommand,
    botStatusCommand
};
