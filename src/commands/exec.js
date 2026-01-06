const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Terminal Command Execution
 * Execute terminal commands dan kirim output ke WhatsApp
 * Hanya bisa digunakan oleh owner/developer
 */

// Daftar owner/developer (tambahkan nomor WA Anda dengan format: nomor@c.us atau @lid)
const OWNER_NUMBERS = [
    '6289507654588@c.us',    // Developer number (sesuai di developer.js)
    '41928125116527@lid',    // Developer via linked device
    '41928125116527@c.us',   // Developer alternate format
    // Tambahkan owner lainnya di sini
];

/**
 * Check if user is owner/developer
 */
function isOwner(userId) {
    return OWNER_NUMBERS.includes(userId);
}

/**
 * Split long text into chunks (max 4096 characters per WhatsApp message)
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
            // If single line is too long, split it
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
 * Execute Terminal Command
 * Usage: !exec <command>
 */
async function execCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    // Check if command provided
    if (args.length === 0) {
        return message.reply(
            '⚠️ *Usage:* !exec <command>\n\n' +
            '*Examples:*\n' +
            '```!exec ls -la```\n' +
            '```!exec git status```\n' +
            '```!exec npm list```\n' +
            '```!exec pwd```\n\n' +
            '⚠️ *Warning:* Be careful with destructive commands!'
        );
    }
    
    const command = args.join(' ');
    
    try {
        await message.reply(
            `🔄 *Executing Command...*\n\n` +
            `\`\`\`${command}\`\`\`\n\n` +
            `⏳ Please wait...`
        );
        
        // Execute command with timeout (30 seconds)
        const { stdout, stderr } = await execAsync(command, {
            timeout: 30000,
            maxBuffer: 1024 * 1024 * 10, // 10MB buffer
            cwd: process.cwd() // Execute in bot's root directory
        });
        
        // Combine stdout and stderr
        let output = '';
        if (stdout) output += stdout;
        if (stderr) output += `\n━━━ STDERR ━━━\n${stderr}`;
        
        // If no output
        if (!output.trim()) {
            output = '✅ Command executed successfully (no output)';
        }
        
        // Log to console
        console.log(`✅ Exec command by ${sender}:`, command);
        console.log('Output:', output.substring(0, 200) + (output.length > 200 ? '...' : ''));
        
        // Split output if too long
        const chunks = splitMessage(output);
        
        // Send first chunk with header
        await message.reply(
            `✅ *Command Executed*\n\n` +
            `*Command:* \`${command}\`\n\n` +
            `*Output:*\n\`\`\`\n${chunks[0]}\`\`\``
        );
        
        // Send remaining chunks
        for (let i = 1; i < chunks.length; i++) {
            await message.reply(`\`\`\`\n${chunks[i]}\`\`\``);
        }
        
    } catch (error) {
        console.error('❌ Exec command error:', error);
        
        let errorMessage = '❌ *Command Failed*\n\n';
        errorMessage += `*Command:* \`${command}\`\n\n`;
        
        if (error.killed) {
            errorMessage += '⏱️ *Error:* Command timeout (exceeded 30 seconds)';
        } else if (error.code) {
            errorMessage += `*Exit Code:* ${error.code}\n\n`;
            
            if (error.stderr) {
                const stderrChunks = splitMessage(error.stderr);
                errorMessage += `*Error Output:*\n\`\`\`\n${stderrChunks[0]}\`\`\``;
                
                // Send main error
                await message.reply(errorMessage);
                
                // Send remaining error chunks
                for (let i = 1; i < stderrChunks.length; i++) {
                    await message.reply(`\`\`\`\n${stderrChunks[i]}\`\`\``);
                }
                return;
            }
            
            if (error.stdout) {
                errorMessage += `*Output:*\n\`\`\`\n${error.stdout}\`\`\``;
            }
        } else {
            errorMessage += `*Error:* ${error.message}`;
        }
        
        await message.reply(errorMessage);
    }
}

module.exports = { execCommand, isOwner };
