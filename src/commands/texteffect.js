const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

// Available text effect styles
const TEXT_EFFECTS = {
    // Single text effects (textprome)
    'blackpink': { type: 'textprome', name: 'Blackpink Style' },
    'cloud': { type: 'textprome', name: 'Cloud Effect' },
    'natureleaves': { type: 'textprome', name: 'Nature Leaves' },
    'watercolor': { type: 'textprome', name: 'Watercolor' },
    'neon': { type: 'textprome', name: 'Neon Light' },
    'thunder': { type: 'textprome', name: 'Thunder Effect' },
    'gradient': { type: 'textprome', name: 'Gradient Text' },
    'luxury': { type: 'textprome', name: 'Luxury Gold' },
    
    // Double text effects (textprome2)
    'avenger': { type: 'textprome2', name: 'Avengers Style' },
    'marvel': { type: 'textprome2', name: 'Marvel Style' },
    'pornhub': { type: 'textprome2', name: 'PornHub Style' },
    'glitch': { type: 'textprome2', name: 'Glitch Effect' }
};

module.exports = {
    name: 'texteffect',
    aliases: ['textpro', 'textmaker', 'maketext'],
    description: 'Generate text with various effects',
    usage: '!texteffect <style> <text> [text2]\n\nAvailable styles:\n' + 
           Object.keys(TEXT_EFFECTS).map(key => `• ${key} - ${TEXT_EFFECTS[key].name}`).join('\n'),
    category: 'image',
    execute: async (msg, args) => {
        if (args.length === 0) {
            const stylesList = Object.keys(TEXT_EFFECTS)
                .map(key => `• \`${key}\` - ${TEXT_EFFECTS[key].name}`)
                .join('\n');
            
            return msg.reply(
                '❌ Gunakan: !texteffect <style> <text> [text2]\n\n' +
                '🎨 *Available Styles:*\n\n' +
                '*Single Text (1 parameter):*\n' +
                '• `blackpink` - Blackpink Style\n' +
                '• `cloud` - Cloud Effect\n' +
                '• `natureleaves` - Nature Leaves\n' +
                '• `watercolor` - Watercolor\n' +
                '• `neon` - Neon Light\n' +
                '• `thunder` - Thunder Effect\n\n' +
                '*Double Text (2 parameters):*\n' +
                '• `avenger` - Avengers Style\n' +
                '• `marvel` - Marvel Style\n' +
                '• `pornhub` - PornHub Style\n' +
                '• `glitch` - Glitch Effect\n\n' +
                '💡 *Contoh:*\n' +
                '`!texteffect blackpink KKN126`\n' +
                '`!texteffect avenger LoL Human`\n' +
                '`!texteffect cloud fajar`'
            );
        }

        const style = args[0].toLowerCase();
        
        if (!TEXT_EFFECTS[style]) {
            return msg.reply(
                `❌ Style "${style}" tidak ditemukan!\n\n` +
                `💡 Gunakan: !texteffect list\n` +
                `untuk melihat semua style yang tersedia.`
            );
        }

        const effect = TEXT_EFFECTS[style];
        const tempDir = path.join(__dirname, '../temp');
        let tempFilePath = null;

        // Parse text parameters based on effect type
        let text1, text2;
        
        if (effect.type === 'textprome') {
            // Single text effect
            text1 = args.slice(1).join(' ');
            
            if (!text1) {
                return msg.reply(`❌ Text tidak boleh kosong!\n\nGunakan: !texteffect ${style} <text>`);
            }
        } else if (effect.type === 'textprome2') {
            // Double text effect - split by space or allow user to use | separator
            const allText = args.slice(1).join(' ');
            
            if (allText.includes('|')) {
                // User menggunakan separator |
                const parts = allText.split('|').map(t => t.trim());
                text1 = parts[0] || '';
                text2 = parts[1] || '';
            } else {
                // Split by space (ambil 2 kata pertama)
                const words = allText.split(' ');
                text1 = words[0] || '';
                text2 = words.slice(1).join(' ') || words[0]; // Jika hanya 1 kata, duplicate
            }
            
            if (!text1 || !text2) {
                return msg.reply(
                    `❌ Style "${style}" membutuhkan 2 text!\n\n` +
                    `Gunakan:\n` +
                    `• !texteffect ${style} text1 text2\n` +
                    `• !texteffect ${style} text1 | text2\n\n` +
                    `Contoh:\n` +
                    `!texteffect avenger LoL Human`
                );
            }
        }

        await msg.reply(`🎨 Membuat "${effect.name}" dengan text: ${text1}${text2 ? ` & ${text2}` : ''}...`);

        try {
            // Pastikan temp directory exists
            try {
                await fs.access(tempDir);
            } catch {
                await fs.mkdir(tempDir, { recursive: true });
            }

            // Build API URL
            let apiUrl;
            const params = {
                apikey: process.env.LOLHUMAN_API_KEY || '10dbd7bdb109b10b4f67ad1f'
            };

            if (effect.type === 'textprome') {
                apiUrl = `https://api.lolhuman.xyz/api/textprome/${style}`;
                params.text = text1;
            } else if (effect.type === 'textprome2') {
                apiUrl = `https://api.lolhuman.xyz/api/textprome2/${style}`;
                params.text1 = text1;
                params.text2 = text2;
            }

            console.log(`📥 Generating text effect: ${style} with params:`, params);

            // Call API to get image URL or direct image
            const response = await axios.get(apiUrl, {
                params: params,
                responseType: 'arraybuffer', // Langsung download image
                timeout: 60000
            });

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `texteffect_${style}_${timestamp}.png`;
            tempFilePath = path.join(tempDir, filename);

            // Save to temp folder
            await fs.writeFile(tempFilePath, Buffer.from(response.data));
            console.log(`💾 Text effect saved to: ${tempFilePath}`);

            // Get file size for info
            const stats = await fs.stat(tempFilePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);

            // Read file and create MessageMedia
            const imageBuffer = await fs.readFile(tempFilePath);
            const base64Image = imageBuffer.toString('base64');
            const media = new MessageMedia('image/png', base64Image, filename);

            // Send image with caption
            const caption = 
                `🎨 *Text Effect*\n\n` +
                `✨ Style: ${effect.name}\n` +
                `📝 Text: ${text1}${text2 ? ` & ${text2}` : ''}\n` +
                `📏 Size: ${fileSizeKB} KB\n` +
                `🔗 Source: LoLHuman API\n\n` +
                `💡 Tip: Gunakan style lain dengan !texteffect list`;

            await msg.reply(media, undefined, { caption });
            console.log(`✅ Text effect sent successfully`);

            // Delete temp file after sending
            await fs.unlink(tempFilePath);
            console.log(`🗑️ Temp file deleted: ${tempFilePath}`);

        } catch (error) {
            console.error('Error in texteffect command:', error);

            // Clean up temp file if exists
            if (tempFilePath) {
                try {
                    await fs.unlink(tempFilePath);
                    console.log(`🗑️ Temp file cleaned up after error: ${tempFilePath}`);
                } catch (cleanupError) {
                    console.error('Failed to cleanup temp file:', cleanupError);
                }
            }

            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return msg.reply('❌ Request timeout. Proses terlalu lama, coba lagi.');
            }

            if (error.response) {
                return msg.reply(`❌ API Error: ${error.response.status}\n${error.response.data?.message || 'Unknown error'}`);
            }

            msg.reply('❌ Terjadi kesalahan saat membuat text effect. Coba lagi nanti.');
        }
    }
};
