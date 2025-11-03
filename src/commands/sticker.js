const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');

module.exports = async (client, message, args) => {
    try {
        // Cek apakah ada media yang di-quote/reply
        const quotedMsg = await message.getQuotedMessage();
        
        // Jika ada argumen text, buat text sticker
        if (args.length > 0) {
            await createTextSticker(client, message, args.join(' '));
            return;
        }
        
        // Jika ada media di quote/reply
        if (quotedMsg && quotedMsg.hasMedia) {
            const media = await quotedMsg.downloadMedia();
            
            if (!media) {
                await message.reply('❌ Gagal mendownload media!');
                return;
            }
            
            // Cek tipe media
            if (media.mimetype.startsWith('image/')) {
                await createImageSticker(client, message, media);
            } else if (media.mimetype.startsWith('video/')) {
                await createVideoSticker(client, message, media);
            } else {
                await message.reply('❌ Format tidak didukung! Kirim gambar atau video (max 10 detik).');
            }
            return;
        }
        
        // Jika message saat ini memiliki media
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            
            if (!media) {
                await message.reply('❌ Gagal mendownload media!');
                return;
            }
            
            if (media.mimetype.startsWith('image/')) {
                await createImageSticker(client, message, media);
            } else if (media.mimetype.startsWith('video/')) {
                await createVideoSticker(client, message, media);
            } else {
                await message.reply('❌ Format tidak didukung! Kirim gambar atau video (max 10 detik).');
            }
            return;
        }
        
        // Jika tidak ada media dan tidak ada text
        await message.reply(
            `📝 *CARA MENGGUNAKAN STICKER MAKER*\n\n` +
            `1️⃣ *Gambar ke Sticker:*\n` +
            `   Kirim gambar dengan caption !sticker\n` +
            `   atau reply gambar dengan !sticker\n\n` +
            `2️⃣ *Video ke Sticker:*\n` +
            `   Kirim video (max 10 detik) dengan caption !sticker\n` +
            `   atau reply video dengan !sticker\n\n` +
            `3️⃣ *Text ke Sticker:*\n` +
            `   !sticker <text>\n` +
            `   Contoh: !sticker Halo Dunia!`
        );
        
    } catch (error) {
        console.error('Error in sticker command:', error);
        await message.reply('❌ Terjadi kesalahan saat membuat sticker!');
    }
};

// Fungsi untuk membuat sticker dari gambar
async function createImageSticker(client, message, media) {
    try {
        await message.reply('⏳ Sedang membuat sticker...');
        
        // Convert buffer dari base64
        const buffer = Buffer.from(media.data, 'base64');
        
        // Resize dan optimize menggunakan sharp
        const processedBuffer = await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp()
            .toBuffer();
        
        // Convert kembali ke base64
        const base64 = processedBuffer.toString('base64');
        
        // Buat MessageMedia baru
        const stickerMedia = new MessageMedia('image/webp', base64);
        
        // Kirim sebagai sticker
        await client.sendMessage(message.from, stickerMedia, {
            sendMediaAsSticker: true,
            stickerName: 'NekoBot',
            stickerAuthor: 'by fajar'
        });
        
        console.log('✅ Image sticker created successfully');
        
    } catch (error) {
        console.error('Error creating image sticker:', error);
        await message.reply('❌ Gagal membuat sticker dari gambar!');
    }
}

// Fungsi untuk membuat sticker dari video
async function createVideoSticker(client, message, media) {
    try {
        await message.reply('⏳ Sedang membuat sticker animasi...');
        
        // WhatsApp mendukung sticker animasi dari video/webm
        // Langsung kirim sebagai sticker
        await client.sendMessage(message.from, media, {
            sendMediaAsSticker: true,
            stickerName: 'NekoBot',
            stickerAuthor: 'by fajar'
        });
        
        console.log('✅ Video sticker created successfully');
        
    } catch (error) {
        console.error('Error creating video sticker:', error);
        await message.reply('❌ Gagal membuat sticker dari video! Pastikan video tidak lebih dari 10 detik.');
    }
}

// Fungsi untuk membuat sticker dari text
async function createTextSticker(client, message, text) {
    try {
        await message.reply('⏳ Sedang membuat text sticker...');
        
        // Buat text dengan SVG (kompatibel dengan Termux)
        const fontSize = text.length > 20 ? 40 : text.length > 10 ? 50 : 60;
        const textColor = '#FFFFFF';
        const strokeColor = '#000000';
        const strokeWidth = 8;
        
        // Split text jadi beberapa line jika terlalu panjang
        const maxCharsPerLine = 15;
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        
        // Limit max 5 lines
        const displayLines = lines.slice(0, 5);
        const lineHeight = fontSize + 20;
        const totalHeight = displayLines.length * lineHeight;
        const startY = (512 - totalHeight) / 2 + fontSize;
        
        // Buat SVG untuk text dengan outline
        let svgText = '';
        displayLines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            // Outline/stroke
            svgText += `<text x="256" y="${y}" font-size="${fontSize}" font-weight="bold" font-family="Arial, sans-serif" text-anchor="middle" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}">${escapeXml(line)}</text>`;
            // Fill
            svgText += `<text x="256" y="${y}" font-size="${fontSize}" font-weight="bold" font-family="Arial, sans-serif" text-anchor="middle" fill="${textColor}">${escapeXml(line)}</text>`;
        });
        
        const svg = `
            <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                ${svgText}
            </svg>
        `;
        
        // Convert SVG ke image menggunakan sharp
        const buffer = Buffer.from(svg);
        const processedBuffer = await sharp(buffer)
            .resize(512, 512)
            .webp()
            .toBuffer();
        
        // Convert ke base64
        const base64 = processedBuffer.toString('base64');
        
        // Buat MessageMedia
        const stickerMedia = new MessageMedia('image/webp', base64);
        
        // Kirim sebagai sticker
        await client.sendMessage(message.from, stickerMedia, {
            sendMediaAsSticker: true,
            stickerName: 'NekoBot',
            stickerAuthor: 'by fajar'
        });
        
        console.log('✅ Text sticker created successfully');
        
    } catch (error) {
        console.error('Error creating text sticker:', error);
        await message.reply('❌ Gagal membuat sticker dari text!');
    }
}

// Helper function untuk escape XML characters
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
