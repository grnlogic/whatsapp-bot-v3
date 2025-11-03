const { Client } = require('nekos-best.js');
const { MessageMedia } = require('whatsapp-web.js');
const fetch = require('node-fetch');

const nekosBest = new Client();

// Daftar kategori yang tersedia
const CATEGORIES = {
    // Images (.png)
    images: ['husbando', 'kitsune', 'neko', 'waifu'],
    // GIFs (.gif)
    gifs: [
        'angry', 'baka', 'bite', 'blush', 'bored', 'cry', 'cuddle', 'dance', 
        'facepalm', 'feed', 'handhold', 'handshake', 'happy', 'highfive', 'hug', 
        'kick', 'kiss', 'laugh', 'lurk', 'nod', 'nom', 'nope', 'pat', 'peck', 
        'poke', 'pout', 'punch', 'run', 'shoot', 'shrug', 'slap', 'sleep', 
        'smile', 'smug', 'stare', 'think', 'thumbsup', 'tickle', 'wave', 
        'wink', 'yawn', 'yeet'
    ]
};

/**
 * Command Neko - Kirim gambar neko random
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function nekoCommand(client, message, args) {
    try {
        const subCommand = args[0]?.toLowerCase();
        
        // Jika user minta list kategori
        if (subCommand === 'list' || subCommand === 'kategori') {
            await showCategories(message);
            return;
        }
        
        // Jika user minta help
        if (subCommand === 'help') {
            await showHelp(message);
            return;
        }
        
        // Tentukan kategori (default: neko)
        let category = 'neko';
        
        // Cek apakah subCommand adalah kategori yang valid
        const allCategories = [...CATEGORIES.images, ...CATEGORIES.gifs];
        if (subCommand && allCategories.includes(subCommand)) {
            category = subCommand;
        }
        
        // Emoji loading berdasarkan kategori
        const loadingEmojis = {
            hug: '🤗', pat: '👋', kiss: '💋', cuddle: '🫂', 
            happy: '😊', smile: '😄', wave: '👋', wink: '😉',
            cry: '😢', angry: '😡', bored: '😑', sleep: '😴'
        };
        const emoji = loadingEmojis[category] || '🐱';
        
        // Kirim loading message
        await message.reply(`${emoji} Mencari ${category} yang bagus... tunggu sebentar~`);
        
        // Fetch random image/gif dari API
        const response = await nekosBest.fetch(category, 1);
        const data = response.results[0];
        const imageUrl = data.url;
        
        // Download gambar
        const media = await downloadImage(imageUrl);
        
        if (!media) {
            await message.reply('❌ Gagal mengunduh gambar. Coba lagi ya!');
            return;
        }
        
        // Siapkan caption
        let caption = `${emoji} *${category.toUpperCase()}* ${emoji}\n\n`;
        
        // Info untuk images (png)
        if (CATEGORIES.images.includes(category)) {
            if (data.artist_name) {
                caption += `🎨 Artist: ${data.artist_name}\n`;
            }
            if (data.source_url) {
                caption += `🔗 Source: ${data.source_url}\n`;
            }
        }
        // Info untuk gifs
        else if (CATEGORIES.gifs.includes(category)) {
            if (data.anime_name) {
                caption += `📺 Anime: ${data.anime_name}\n`;
            }
        }
        
        caption += `\n💡 Ketik !neko ${category} untuk ${category} lainnya`;
        caption += `\n💡 Ketik !neko list untuk lihat semua kategori`;
        
        // Kirim gambar dengan caption
        await client.sendMessage(message.from, media, {
            caption: caption
        });
        
        console.log(`✅ ${category} berhasil dikirim ke ${message.from}`);
    } catch (error) {
        console.error('Error executing neko command:', error);
        await message.reply('❌ Terjadi kesalahan saat mengambil gambar. Coba lagi nanti ya!');
    }
}

/**
 * Download gambar dari URL
 */
async function downloadImage(url) {
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();
        
        // Tentukan mime type berdasarkan extension
        const mimeType = url.endsWith('.gif') ? 'image/gif' : 'image/png';
        
        const media = new MessageMedia(
            mimeType,
            buffer.toString('base64'),
            'neko' + (url.endsWith('.gif') ? '.gif' : '.png')
        );
        
        return media;
    } catch (error) {
        console.error('Error downloading image:', error);
        return null;
    }
}

/**
 * Menampilkan daftar kategori
 */
async function showCategories(message) {
    let categoryText = `📋 *DAFTAR KATEGORI NEKOS.BEST*\n\n`;
    
    categoryText += `🖼️ *IMAGES (PNG):*\n`;
    CATEGORIES.images.forEach(cat => {
        categoryText += `• ${cat}\n`;
    });
    
    categoryText += `\n🎬 *GIFS (ANIMATED):*\n`;
    const gifsPerRow = 3;
    for (let i = 0; i < CATEGORIES.gifs.length; i += gifsPerRow) {
        const row = CATEGORIES.gifs.slice(i, i + gifsPerRow);
        categoryText += `• ${row.join(', ')}\n`;
    }
    
    categoryText += `\n━━━━━━━━━━━━━━━━━━\n`;
    categoryText += `📝 *Cara Pakai:*\n`;
    categoryText += `!neko [kategori]\n\n`;
    categoryText += `*Contoh:*\n`;
    categoryText += `!neko hug\n`;
    categoryText += `!neko pat\n`;
    categoryText += `!neko waifu\n`;
    categoryText += `!neko kiss\n\n`;
    categoryText += `💡 Ketik !neko (tanpa kategori) untuk neko random`;
    
    await message.reply(categoryText);
}

/**
 * Menampilkan help
 */
async function showHelp(message) {
    const helpText = `
🐱 *NEKO COMMAND - HELP*

━━━━━━━━━━━━━━━━━━

📝 *Cara Menggunakan:*

*1. Neko Random (default):*
!neko
Kirim gambar neko random

*2. Kategori Spesifik:*
!neko [kategori]
Kirim gambar/GIF dari kategori tertentu

*3. Lihat Kategori:*
!neko list
Tampilkan semua kategori yang tersedia

━━━━━━━━━━━━━━━━━━

💡 *Contoh Penggunaan:*

!neko           → Neko random 🐱
!neko hug       → GIF pelukan 🤗
!neko pat       → GIF elus-elus 👋
!neko waifu     → Gambar waifu 💕
!neko kiss      → GIF ciuman 💋
!neko happy     → GIF senang 😊
!neko cuddle    → GIF pelukan mesra 🫂

━━━━━━━━━━━━━━━━━━

🎯 *Fitur:*

• 4 kategori gambar (PNG) 🖼️
• 42 kategori GIF animasi 🎬
• Kualitas tinggi & lucu
• Info artist/anime name
• Random selection

━━━━━━━━━━━━━━━━━━

⚠️ *Catatan:*
• Semua konten dari nekos.best API
• Credit diberikan ke artist/anime
• Untuk melihat semua kategori: !neko list

Selamat menikmati konten anime! 🐱✨
`;

    await message.reply(helpText);
}

module.exports = nekoCommand;
