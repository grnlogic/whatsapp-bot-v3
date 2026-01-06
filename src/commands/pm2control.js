const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { isOwner } = require('./exec');

/**
 * PM2 Process Management
 * Control PM2 processes (restart, stop, start, status)
 * Hanya bisa digunakan oleh owner/developer
 */

/**
 * Split long text into chunks
 */
function splitMessage(text, maxLength = 4000) {
    const chunks = [];
    let currentChunk = '';
    
    const lines = text.split('\n');
    for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            if (line.length > maxLength) {
                for (let i = 0; i < line.length; i += maxLength) {
                    chunks.push(line.substring(i, i + maxLength));
                }
            } else {
                currentChunk = line + '\n';
            }
        } else {
            currentChunk += line + '\n';
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks;
}

/**
 * Execute PM2 command
 */
async function execPM2(command) {
    try {
        const { stdout, stderr } = await execAsync(command, {
            timeout: 30000,
            maxBuffer: 1024 * 1024 * 10
        });
        return { success: true, stdout, stderr };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            stdout: error.stdout || '',
            stderr: error.stderr || '',
            code: error.code
        };
    }
}

/**
 * Check if bot is running under PM2
 */
async function isRunningInPM2() {
    try {
        // Check if PM2_HOME environment variable exists
        if (process.env.PM2_HOME || process.env.pm_id !== undefined) {
            return true;
        }
        
        // Try to check PM2 list
        const result = await execPM2('pm2 jlist');
        if (result.success) {
            const processes = JSON.parse(result.stdout);
            // Check if current process is in PM2
            const currentPid = process.pid;
            return processes.some(proc => proc.pid === currentPid);
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Smart Restart Command
 * Auto-detect PM2 or Local and restart accordingly
 * Usage: !restart [process_name]
 */
async function restartCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        // Check if running in PM2
        const inPM2 = await isRunningInPM2();
        
        if (inPM2) {
            // PM2 Restart
            const processName = args[0] || 'whatsapp-bot-v3';
            
            await message.reply(
                `🔄 *Restarting PM2 Process...*\n\n` +
                `Process: \`${processName}\`\n` +
                `⏳ Please wait...`
            );
            
            // Restart PM2 process
            const restartResult = await execPM2(`pm2 restart ${processName}`);
            
            if (restartResult.success) {
                await message.reply(
                    `✅ *PM2 Process Restarted*\n\n` +
                    `Process: \`${processName}\`\n` +
                    `Status: Running\n\n` +
                    `🎉 Bot has been restarted successfully!`
                );
                
                console.log(`✅ PM2 process "${processName}" restarted by ${sender}`);
            } else {
                throw new Error(restartResult.stderr || restartResult.error);
            }
        } else {
            // Local Restart (Windows/Development)
            await message.reply(
                `🔄 *Restarting Bot (Local Mode)...*\n\n` +
                `⏳ Bot will restart in 3 seconds...\n` +
                `Please wait for reconnection...`
            );
            
            console.log(`🔄 Local restart initiated by ${sender}`);
            
            // Wait 3 seconds then exit
            setTimeout(() => {
                console.log('💀 Exiting process for restart...');
                process.exit(0); // Exit with code 0 (clean exit)
            }, 3000);
        }
        
    } catch (error) {
        console.error('❌ Restart error:', error);
        await message.reply(
            `❌ *Failed to Restart*\n\n` +
            `*Error:* ${error.message}\n\n` +
            `💡 Try manually restarting the bot.`
        );
    }
}

/**
 * PM2 Status Command
 * Usage: !pm2 status
 */
async function pm2StatusCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        await message.reply(`🔍 Checking PM2 status...`);
        
        // Get PM2 list
        const listResult = await execPM2('pm2 jlist');
        
        if (!listResult.success) {
            throw new Error(listResult.stderr || 'Failed to get PM2 status');
        }
        
        // Parse JSON output
        const processes = JSON.parse(listResult.stdout);
        
        if (processes.length === 0) {
            return message.reply('⚠️ No PM2 processes running.');
        }
        
        let statusMessage = `📊 *PM2 Process Status*\n\n`;
        
        processes.forEach((proc, index) => {
            const status = proc.pm2_env.status;
            const statusIcon = status === 'online' ? '🟢' : '🔴';
            const uptime = proc.pm2_env.pm_uptime ? 
                formatUptime((Date.now() - proc.pm2_env.pm_uptime) / 1000) : 'N/A';
            const memory = formatBytes(proc.monit.memory);
            const cpu = proc.monit.cpu + '%';
            const restarts = proc.pm2_env.restart_time;
            
            statusMessage += 
                `${statusIcon} *${proc.name}*\n` +
                `ID: ${proc.pm_id}\n` +
                `Status: ${status}\n` +
                `Uptime: ${uptime}\n` +
                `Memory: ${memory}\n` +
                `CPU: ${cpu}\n` +
                `Restarts: ${restarts}\n`;
            
            if (index < processes.length - 1) {
                statusMessage += `\n`;
            }
        });
        
        await message.reply(statusMessage);
        
        console.log(`✅ PM2 status checked by ${sender}`);
        
    } catch (error) {
        console.error('❌ PM2 status error:', error);
        await message.reply(
            `❌ *Failed to get PM2 status*\n\n` +
            `*Error:* ${error.message}`
        );
    }
}

/**
 * PM2 Stop Command
 * Usage: !pm2 stop [process_name]
 */
async function pm2StopCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        const processName = args[0] || 'whatsapp-bot-v3';
        
        await message.reply(
            `🛑 *Stopping PM2 Process...*\n\n` +
            `Process: \`${processName}\`\n` +
            `⏳ Please wait...`
        );
        
        // Stop PM2 process
        const stopResult = await execPM2(`pm2 stop ${processName}`);
        
        if (stopResult.success) {
            await message.reply(
                `✅ *PM2 Process Stopped*\n\n` +
                `Process: \`${processName}\`\n` +
                `Status: Stopped\n\n` +
                `Use \`!pm2 start\` to start it again.`
            );
            
            console.log(`✅ PM2 process "${processName}" stopped by ${sender}`);
        } else {
            throw new Error(stopResult.stderr || stopResult.error);
        }
        
    } catch (error) {
        console.error('❌ PM2 stop error:', error);
        await message.reply(
            `❌ *Failed to Stop PM2 Process*\n\n` +
            `*Error:* ${error.message}`
        );
    }
}

/**
 * PM2 Start Command
 * Usage: !pm2 start [process_name]
 */
async function pm2StartCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        const processName = args[0] || 'whatsapp-bot-v3';
        
        await message.reply(
            `▶️ *Starting PM2 Process...*\n\n` +
            `Process: \`${processName}\`\n` +
            `⏳ Please wait...`
        );
        
        // Start PM2 process
        const startResult = await execPM2(`pm2 start ${processName}`);
        
        if (startResult.success) {
            await message.reply(
                `✅ *PM2 Process Started*\n\n` +
                `Process: \`${processName}\`\n` +
                `Status: Running\n\n` +
                `🎉 Process is now running!`
            );
            
            console.log(`✅ PM2 process "${processName}" started by ${sender}`);
        } else {
            throw new Error(startResult.stderr || startResult.error);
        }
        
    } catch (error) {
        console.error('❌ PM2 start error:', error);
        await message.reply(
            `❌ *Failed to Start PM2 Process*\n\n` +
            `*Error:* ${error.message}`
        );
    }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
    restartCommand,
    pm2StatusCommand,
    pm2StopCommand,
    pm2StartCommand
};
