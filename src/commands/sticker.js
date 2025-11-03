const { MessageMedia } = require('whatsapp-web.js');

// Try to load sharp, fallback to Jimp if not available (for Termux compatibility)
let sharp = null;
let Jimp = null;

// Load image processing libraries
(async () => {
    try {
        sharp = require('sharp');
    } catch (error) {
        console.log('⚠️ Sharp not available, using Jimp for image processing (Termux mode)');
    }
    
    try {
        Jimp = await import('jimp');
        // Untuk Jimp v1.x
        Jimp = Jimp.Jimp || Jimp.default || Jimp;
    } catch (error) {
        console.log('⚠️ Jimp import failed:', error.message);
    }
})();

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
        
        let base64;
        
        // Gunakan sharp jika tersedia (Windows/Linux), fallback ke Jimp (Termux)
        if (sharp) {
            // Resize dan optimize menggunakan sharp
            const processedBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp()
                .toBuffer();
            
            base64 = processedBuffer.toString('base64');
        } else {
            // Fallback ke Jimp untuk Termux
            const JimpModule = await import('jimp');
            const JimpClass = JimpModule.Jimp || JimpModule.default || JimpModule;
            
            const image = await JimpClass.read(buffer);
            
            // Get original dimensions
            const width = image.bitmap.width;
            const height = image.bitmap.height;
            
            // Calculate scale to fit within 512x512
            const scale = Math.min(512 / width, 512 / height);
            const newWidth = Math.floor(width * scale);
            const newHeight = Math.floor(height * scale);
            
            // Resize image
            await image.resize({ w: newWidth, h: newHeight });
            
            const processedBuffer = await image.getBuffer('image/png');
            base64 = processedBuffer.toString('base64');
        }
        
        // Buat MessageMedia baru
        const mimeType = sharp ? 'image/webp' : 'image/png';
        const stickerMedia = new MessageMedia(mimeType, base64);
        
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
        
        // Import Jimp dynamically
        const JimpModule = await import('jimp');
        const JimpClass = JimpModule.Jimp || JimpModule.default || JimpModule;
        
        // Buat blank image 512x512 dengan background hitam
        const image = new JimpClass({
            width: 512,
            height: 512,
            color: 0x000000FF // Black background
        });
        
        // Pilih font berdasarkan panjang text
        let fontName;
        if (text.length > 30) {
            fontName = JimpClass.FONT_SANS_32_WHITE;
        } else if (text.length > 15) {
            fontName = JimpClass.FONT_SANS_64_WHITE;
        } else {
            fontName = JimpClass.FONT_SANS_64_WHITE;
        }
        
        // Load font - API yang benar untuk Jimp v1.x
        const font = await JimpClass.loadFont(fontName);
        
        // Hitung posisi untuk center text
        const textWidth = JimpClass.measureText(font, text);
        const textHeight = JimpClass.measureTextHeight(font, text, 480);
        const x = Math.max(0, (512 - textWidth) / 2);
        const y = Math.max(0, (512 - textHeight) / 2);
        
        // Print text
        image.print({
            font: font,
            x: x,
            y: y,
            text: text
        });
        
        // Convert ke buffer
        const buffer = await image.getBuffer('image/png');
        const base64 = buffer.toString('base64');
        
        // Buat MessageMedia
        const stickerMedia = new MessageMedia('image/png', base64);
        
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

// Helper function untuk escape XML characters (tidak digunakan lagi)
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
