const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { isOwner } = require('./exec');

/**
 * Smart Git Operations
 * Handle git operations dengan auto-conflict resolution
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
 * Execute git command with error handling
 */
async function execGit(command, cwd = process.cwd()) {
    try {
        const { stdout, stderr } = await execAsync(command, {
            cwd,
            timeout: 60000, // 60 seconds for git operations
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
 * Smart Git Pull - Auto handle conflicts
 * Usage: !git pull
 */
async function gitPullCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        await message.reply(
            `🔄 *Smart Git Pull*\n\n` +
            `⏳ Checking repository status...`
        );
        
        // Step 1: Check current status
        const statusResult = await execGit('git status --porcelain');
        
        let steps = [];
        
        // Step 2: If there are local changes, discard them
        if (statusResult.stdout && statusResult.stdout.trim()) {
            steps.push('📝 Detected local changes');
            
            // Discard all local changes (reset hard)
            await message.reply(`⚠️ Discarding local changes...`);
            
            const resetResult = await execGit('git reset --hard HEAD');
            if (resetResult.success) {
                steps.push('✅ Local changes discarded');
            } else {
                throw new Error(`Failed to reset: ${resetResult.stderr}`);
            }
            
            // Clean untracked files
            const cleanResult = await execGit('git clean -fd');
            if (cleanResult.success) {
                steps.push('✅ Untracked files cleaned');
            }
        } else {
            steps.push('✅ Working directory is clean');
        }
        
        // Step 3: Fetch from remote
        await message.reply(`📥 Fetching from remote...`);
        const fetchResult = await execGit('git fetch origin');
        if (fetchResult.success) {
            steps.push('✅ Fetched from remote');
        } else {
            throw new Error(`Failed to fetch: ${fetchResult.stderr}`);
        }
        
        // Step 4: Get current branch
        const branchResult = await execGit('git branch --show-current');
        const currentBranch = branchResult.stdout.trim() || 'main';
        steps.push(`📍 Current branch: ${currentBranch}`);
        
        // Step 5: Pull with rebase
        await message.reply(`🔄 Pulling changes...`);
        const pullResult = await execGit(`git pull origin ${currentBranch} --rebase`);
        
        if (pullResult.success) {
            steps.push('✅ Successfully pulled latest changes');
        } else {
            // If pull failed, try without rebase
            const pullResult2 = await execGit(`git pull origin ${currentBranch}`);
            if (pullResult2.success) {
                steps.push('✅ Successfully pulled latest changes (merge)');
            } else {
                throw new Error(`Failed to pull: ${pullResult2.stderr}`);
            }
        }
        
        // Step 6: Get latest commit info
        const logResult = await execGit('git log -1 --pretty=format:"%h - %s (%an, %ar)"');
        if (logResult.success && logResult.stdout) {
            steps.push(`\n📌 Latest commit:\n${logResult.stdout}`);
        }
        
        // Send success message
        const successMessage = 
            `✅ *Git Pull Completed*\n\n` +
            `${steps.join('\n')}\n\n` +
            `🎉 Repository is now up to date!`;
        
        await message.reply(successMessage);
        
        console.log(`✅ Git pull completed by ${sender}`);
        
    } catch (error) {
        console.error('❌ Git pull error:', error);
        await message.reply(
            `❌ *Git Pull Failed*\n\n` +
            `*Error:* ${error.message}\n\n` +
            `💡 Try manually checking the repository.`
        );
    }
}

/**
 * Git Status Command
 * Usage: !git status
 */
async function gitStatusCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        await message.reply(`🔍 Checking git status...`);
        
        // Get status
        const statusResult = await execGit('git status');
        
        if (!statusResult.success) {
            throw new Error(statusResult.stderr || 'Failed to get git status');
        }
        
        // Get current branch
        const branchResult = await execGit('git branch --show-current');
        const currentBranch = branchResult.stdout.trim() || 'unknown';
        
        // Get latest commit
        const logResult = await execGit('git log -1 --pretty=format:"%h - %s (%an, %ar)"');
        const latestCommit = logResult.stdout || 'No commits';
        
        // Get remote status
        const remoteResult = await execGit('git remote -v');
        const remoteInfo = remoteResult.stdout.split('\n')[0] || 'No remote';
        
        // Split output if too long
        const chunks = splitMessage(statusResult.stdout);
        
        // Build message
        let message_text = 
            `📊 *Git Status*\n\n` +
            `📍 *Branch:* ${currentBranch}\n` +
            `📌 *Latest Commit:*\n${latestCommit}\n\n` +
            `🌐 *Remote:*\n${remoteInfo}\n\n` +
            `*Status:*\n\`\`\`\n${chunks[0]}\`\`\``;
        
        await message.reply(message_text);
        
        // Send remaining chunks
        for (let i = 1; i < chunks.length; i++) {
            await message.reply(`\`\`\`\n${chunks[i]}\`\`\``);
        }
        
        console.log(`✅ Git status checked by ${sender}`);
        
    } catch (error) {
        console.error('❌ Git status error:', error);
        await message.reply(
            `❌ *Failed to get git status*\n\n` +
            `*Error:* ${error.message}`
        );
    }
}

/**
 * Git Log Command
 * Usage: !git log [count]
 */
async function gitLogCommand(client, message, args) {
    const sender = message.author || message.from;
    
    // Check if user is owner
    if (!isOwner(sender)) {
        return message.reply('🚫 *Access Denied*\n\nCommand ini hanya untuk developer/owner.');
    }
    
    try {
        const count = parseInt(args[0]) || 5;
        
        if (count > 20) {
            return message.reply('⚠️ Maximum 20 commits. Using 20 instead.');
        }
        
        await message.reply(`🔍 Fetching last ${count} commits...`);
        
        // Get log
        const logResult = await execGit(
            `git log -${count} --pretty=format:"%h - %s (%an, %ar)"`
        );
        
        if (!logResult.success) {
            throw new Error(logResult.stderr || 'Failed to get git log');
        }
        
        const commits = logResult.stdout.split('\n');
        
        let logMessage = `📜 *Git Log (Last ${count} commits)*\n\n`;
        commits.forEach((commit, index) => {
            logMessage += `${index + 1}. ${commit}\n`;
        });
        
        await message.reply(logMessage);
        
        console.log(`✅ Git log checked by ${sender}`);
        
    } catch (error) {
        console.error('❌ Git log error:', error);
        await message.reply(
            `❌ *Failed to get git log*\n\n` +
            `*Error:* ${error.message}`
        );
    }
}

module.exports = {
    gitPullCommand,
    gitStatusCommand,
    gitLogCommand
};
