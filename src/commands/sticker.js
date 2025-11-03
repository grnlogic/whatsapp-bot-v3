const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');
const { createCanvas } = require('canvas');

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
        
        // Buat canvas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        
        // Background transparan
        ctx.clearRect(0, 0, 512, 512);
        
        // Setup text style
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Dynamic font size berdasarkan panjang text
        let fontSize = 60;
        if (text.length > 20) fontSize = 40;
        if (text.length > 40) fontSize = 30;
        if (text.length > 60) fontSize = 25;
        
        ctx.font = `bold ${fontSize}px Arial`;
        
        // Word wrap untuk text panjang
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > 450) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        // Draw text dengan outline
        const lineHeight = fontSize + 10;
        const startY = 256 - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            // Stroke (outline hitam)
            ctx.strokeText(line, 256, y);
            // Fill (text putih)
            ctx.fillText(line, 256, y);
        });
        
        // Convert canvas ke buffer
        const buffer = canvas.toBuffer('image/png');
        
        // Process dengan sharp untuk optimize
        const processedBuffer = await sharp(buffer)
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
