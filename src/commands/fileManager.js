const fs = require('fs');
const path = require('path');

/**
 * File Management Commands for Downloaded Videos
 */

/**
 * Command untuk mengatur penyimpanan file download
 */
async function fileManagerCommand(client, message, args) {
    try {
        const tempDir = path.join(__dirname, '../../temp');
        const downloadDir = path.join(__dirname, '../../downloads');
        
        if (!args || args.length === 0) {
            // Show help
            const helpText = 
                '📁 *File Manager*\n\n' +
                '*Commands Available:*\n' +
                '!filemgr list - Lihat file tersimpan\n' +
                '!filemgr keep - Simpan file download\n' +
                '!filemgr nokeep - Hapus otomatis (default)\n' +
                '!filemgr clean - Hapus semua file\n' +
                '!filemgr status - Cek status penyimpanan\n\n' +
                '*Info:*\n' +
                '• Default: File dihapus otomatis setelah kirim\n' +
                '• Keep mode: File disimpan di folder downloads\n' +
                '• Lokasi: /downloads/ di server bot';
            
            return message.reply(helpText);
        }
        
        const command = args[0].toLowerCase();
        
        switch (command) {
            case 'list':
                await listDownloadedFiles(message, downloadDir);
                break;
            
            case 'keep':
                await setKeepMode(message, true);
                break;
                
            case 'nokeep':
                await setKeepMode(message, false);
                break;
                
            case 'clean':
                await cleanDownloads(message, downloadDir);
                break;
                
            case 'status':
                await showStatus(message);
                break;
                
            default:
                message.reply('❌ Command tidak dikenal. Ketik `!filemgr` untuk help.');
        }
        
    } catch (error) {
        console.error('File manager error:', error);
        message.reply('❌ Error dalam file manager: ' + error.message);
    }
}

/**
 * List downloaded files
 */
async function listDownloadedFiles(message, downloadDir) {
    try {
        if (!fs.existsSync(downloadDir)) {
            return message.reply('📁 *Folder downloads kosong*\n\nBelum ada file yang disimpan.');
        }
        
        const files = fs.readdirSync(downloadDir);
        
        if (files.length === 0) {
            return message.reply('📁 *Folder downloads kosong*\n\nBelum ada file yang disimpan.');
        }
        
        let fileList = '📁 *File Tersimpan*\n\n';
        let totalSize = 0;
        
        files.forEach((file, index) => {
            const filePath = path.join(downloadDir, file);
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
            const date = stats.mtime.toLocaleDateString('id-ID');
            
            totalSize += stats.size;
            
            fileList += `${index + 1}. ${file}\n`;
            fileList += `   📊 ${sizeMB} MB | 📅 ${date}\n\n`;
        });
        
        fileList += `📊 *Total:* ${files.length} file(s) | ${(totalSize / 1024 / 1024).toFixed(1)} MB`;
        
        message.reply(fileList);
        
    } catch (error) {
        console.error('List files error:', error);
        message.reply('❌ Error listing files: ' + error.message);
    }
}

/**
 * Set keep mode (save files or auto delete)
 */
async function setKeepMode(message, keepFiles) {
    try {
        // Save setting to config file
        const configPath = path.join(__dirname, '../../config/download-config.json');
        const configDir = path.dirname(configPath);
        
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        const config = {
            keepFiles: keepFiles,
            lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        const statusText = keepFiles ? 
            '💾 *Mode Simpan AKTIF*\n\n✅ File download akan disimpan\n📁 Lokasi: /downloads/\n⚠️ Ingat bersihkan berkala dengan !filemgr clean' :
            '🗑️ *Mode Hapus Otomatis AKTIF*\n\n✅ File akan dihapus setelah kirim\n💾 Hemat storage server\n📱 File tetap ada di WhatsApp Anda';
        
        message.reply(statusText);
        
    } catch (error) {
        console.error('Set keep mode error:', error);
        message.reply('❌ Error setting keep mode: ' + error.message);
    }
}

/**
 * Clean all downloads
 */
async function cleanDownloads(message, downloadDir) {
    try {
        if (!fs.existsSync(downloadDir)) {
            return message.reply('📁 Folder downloads sudah kosong.');
        }
        
        const files = fs.readdirSync(downloadDir);
        
        if (files.length === 0) {
            return message.reply('📁 Folder downloads sudah kosong.');
        }
        
        let deletedCount = 0;
        let totalSize = 0;
        
        files.forEach(file => {
            const filePath = path.join(downloadDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            
            fs.unlinkSync(filePath);
            deletedCount++;
        });
        
        message.reply(
            `🗑️ *Cleanup Selesai*\n\n` +
            `✅ Dihapus: ${deletedCount} file(s)\n` +
            `💾 Ruang dibebaskan: ${(totalSize / 1024 / 1024).toFixed(1)} MB\n\n` +
            `📁 Folder downloads sekarang kosong.`
        );
        
    } catch (error) {
        console.error('Clean downloads error:', error);
        message.reply('❌ Error cleaning downloads: ' + error.message);
    }
}

/**
 * Show current status
 */
async function showStatus(message) {
    try {
        const configPath = path.join(__dirname, '../../config/download-config.json');
        const downloadDir = path.join(__dirname, '../../downloads');
        
        let keepFiles = false; // Default
        
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            keepFiles = config.keepFiles || false;
        }
        
        // Count files
        let fileCount = 0;
        let totalSize = 0;
        
        if (fs.existsSync(downloadDir)) {
            const files = fs.readdirSync(downloadDir);
            fileCount = files.length;
            
            files.forEach(file => {
                const stats = fs.statSync(path.join(downloadDir, file));
                totalSize += stats.size;
            });
        }
        
        const statusText = 
            `📊 *Download Manager Status*\n\n` +
            `💾 **Mode:** ${keepFiles ? 'SIMPAN FILE' : 'HAPUS OTOMATIS'}\n` +
            `📁 **File tersimpan:** ${fileCount} file(s)\n` +
            `💽 **Storage used:** ${(totalSize / 1024 / 1024).toFixed(1)} MB\n\n` +
            `🔧 **Commands:**\n` +
            `• !filemgr ${keepFiles ? 'nokeep' : 'keep'} - ${keepFiles ? 'Aktifkan hapus otomatis' : 'Aktifkan simpan file'}\n` +
            `• !filemgr list - Lihat file tersimpan\n` +
            `• !filemgr clean - Hapus semua file`;
        
        message.reply(statusText);
        
    } catch (error) {
        console.error('Show status error:', error);
        message.reply('❌ Error showing status: ' + error.message);
    }
}

/**
 * Check if files should be kept (for use in download commands)
 */
function shouldKeepFiles() {
    try {
        const configPath = path.join(__dirname, '../../config/download-config.json');
        
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return config.keepFiles || false;
        }
        
        return false; // Default: don't keep files
        
    } catch (error) {
        console.error('Check keep files error:', error);
        return false;
    }
}

/**
 * Move file to downloads folder if keep mode is enabled
 */
function handleFileAfterSend(filePath, filename) {
    try {
        if (shouldKeepFiles()) {
            // Move to downloads folder
            const downloadDir = path.join(__dirname, '../../downloads');
            
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }
            
            const newPath = path.join(downloadDir, filename);
            
            // Copy file instead of move (in case of errors)
            fs.copyFileSync(filePath, newPath);
            
            // Delete original temp file
            fs.unlinkSync(filePath);
            
            console.log(`💾 File saved to downloads: ${filename}`);
            
        } else {
            // Delete file as before
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ File deleted: ${filename}`);
                }
            }, 5000);
        }
        
    } catch (error) {
        console.error('Handle file after send error:', error);
        
        // Fallback: delete file anyway
        setTimeout(() => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ File deleted (fallback): ${filename}`);
            }
        }, 5000);
    }
}

module.exports = {
    fileManagerCommand,
    shouldKeepFiles,
    handleFileAfterSend
};