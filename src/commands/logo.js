const { MessageMedia } = require('whatsapp-web.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const logoList = `*📋 LOGO MAKER LIST*

*Cara Pakai:*
!logo <nomor> <text>

*Contoh:*
!logo 14 Kazuha

━━━━━━━━━━━━━━━━━━

01 - 11 : Calligraphy ✍️
12 - 13 : Beast 🦁
14 - 19 : PUBG 🎮
20 - 25 : RRR 🎬
26 - 27 : Free Fire 🔥
28 - 29 : India 🇮🇳
30 - 32 : Avengers 🦸
33 - 34 : Pushpa 🎭
35 - 37 : Master 👑
38 - 44 : IPL 🏏
45 - 45 : Dhoni 🏏
46 - 46 : Vijay ⭐
47 - 52 : KGF ⚔️
53 - 57 : Agent 🕵️
58 - 58 : Leo 🦁

━━━━━━━━━━━━━━━━━━

💡 Total: *58 Logo Maker*`;

// Helper function to download and save image temporarily
async function downloadImageToFile(url, filename) {
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error('Error downloading logo:', error);
    return null;
  }
}

// Helper function to delete file
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ File deleted: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Logo configurations
const logoConfigs = [
  // Calligraphy (01-11)
  ...Array.from({ length: 11 }, (_, i) => ({
    pattern: `logo ${String(i + 1).padStart(2, '0')}`,
    category: 'calligraphy',
    style: i + 1
  })),
  // Beast (12-13)
  { pattern: 'logo 12', category: 'beast', style: 1 },
  { pattern: 'logo 13', category: 'beast', style: 2 },
  // PUBG (14-19)
  ...Array.from({ length: 6 }, (_, i) => ({
    pattern: `logo ${14 + i}`,
    category: 'pubg',
    style: i + 1
  })),
  // RRR (20-25)
  ...Array.from({ length: 6 }, (_, i) => ({
    pattern: `logo ${20 + i}`,
    category: 'rrr',
    style: i + 1
  })),
  // Free Fire (26-27)
  { pattern: 'logo 26', category: 'freefire', style: 1 },
  { pattern: 'logo 27', category: 'freefire', style: 2 },
  // India (28-29)
  { pattern: 'logo 28', category: 'india', style: 1 },
  { pattern: 'logo 29', category: 'india', style: 2 },
  // Avengers (30-32)
  { pattern: 'logo 30', category: 'avengers', style: 1 },
  { pattern: 'logo 31', category: 'avengers', style: 2 },
  { pattern: 'logo 32', category: 'avengers', style: 3 },
  // Pushpa (33-34)
  { pattern: 'logo 33', category: 'pushpa', style: 1 },
  { pattern: 'logo 34', category: 'pushpa', style: 2 },
  // Master (35-37)
  { pattern: 'logo 35', category: 'master', style: 1 },
  { pattern: 'logo 36', category: 'master', style: 2 },
  { pattern: 'logo 37', category: 'master', style: 3 },
  // IPL (38-44)
  ...Array.from({ length: 7 }, (_, i) => ({
    pattern: `logo ${38 + i}`,
    category: 'ipl',
    style: i + 1
  })),
  // Dhoni (45)
  { pattern: 'logo 45', category: 'dhoni', style: 1 },
  // Vijay/Thalapathy (46)
  { pattern: 'logo 46', category: 'thalapathy', style: 1 },
  // KGF (47-52)
  ...Array.from({ length: 6 }, (_, i) => ({
    pattern: `logo ${47 + i}`,
    category: 'kgf',
    style: i
  })),
  // Agent (53-57)
  ...Array.from({ length: 5 }, (_, i) => ({
    pattern: `logo ${53 + i}`,
    category: 'agent',
    style: i + 1
  })),
  // Leo (58)
  { pattern: 'logo 58', category: 'leo', style: null }
];

/**
 * Command Logo Maker
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function logoCommand(client, message, args) {
  try {
    const text = args.join(' ');
    
    // Show list if no arguments or 'list' command
    if (!text || text.toLowerCase() === 'list') {
      await message.reply(logoList);
      return;
    }

    // Parse logo number and text
    const match = text.match(/^(\d+)\s+(.+)$/);
    if (!match) {
      await message.reply(
        '❌ *Format salah!*\n\n' +
        '📝 *Cara Pakai:*\n' +
        '!logo <nomor> <text>\n\n' +
        '*Contoh:*\n' +
        '!logo 14 Kazuha\n' +
        '!logo 01 Beautiful\n\n' +
        '💡 Ketik *!logo list* untuk lihat semua opsi'
      );
      return;
    }

    const logoNum = parseInt(match[1]);
    const logoText = match[2];

    const config = logoConfigs.find(c => c.pattern === `logo ${logoNum}`);
    
    if (!config) {
      await message.reply(
        `❌ *Logo ${logoNum} tidak ditemukan!*\n\n` +
        `💡 Ketik *!logo list* untuk lihat opsi yang tersedia.`
      );
      return;
    }

    // Send processing message
    await message.reply(`⏳ Sedang membuat logo... tunggu sebentar~`);

    // Build API URL
    let apiUrl;
    if (config.category === 'leo') {
      apiUrl = `https://raganork-network.vercel.app/api/logo/leo?text=${encodeURIComponent(logoText)}`;
    } else {
      apiUrl = `https://raganork-network.vercel.app/api/logo/${config.category}?style=${config.style}&text=${encodeURIComponent(logoText)}`;
    }

    console.log(`🔗 Fetching logo from: ${apiUrl}`);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `logo_${logoNum}_${timestamp}.png`;
    
    // Download image to temp file
    const filePath = await downloadImageToFile(apiUrl, filename);
    
    if (!filePath) {
      await message.reply('❌ Gagal mengunduh logo. Coba lagi ya!');
      return;
    }
    
    console.log(`✅ Logo downloaded to: ${filePath}`);
    
    try {
      // Read file as base64
      const imageBuffer = fs.readFileSync(filePath);
      const base64Data = imageBuffer.toString('base64');
      
      // Create MessageMedia from base64
      const media = new MessageMedia('image/png', base64Data, filename);
      
      // Send image with caption
      await message.reply(media);
      
      // Send caption as separate message
      const caption = `✨ *Logo #${logoNum} - ${config.category.toUpperCase()}*\n\n` +
        `📝 Text: ${logoText}\n\n` +
        `💡 Ketik *!logo list* untuk logo lainnya`;
      
      await message.reply(caption);

      console.log(`✅ Logo ${logoNum} (${config.category}) berhasil dikirim`);
    } finally {
      // Delete temp file after sending (or if error occurs)
      deleteFile(filePath);
    }

  } catch (error) {
    console.error('Logo generation error:', error);
    await message.reply(
      '❌ *Gagal membuat logo.*\n\n' +
      'Kemungkinan API sedang down atau text terlalu panjang.\n' +
      'Silakan coba lagi nanti!'
    );
  }
}

module.exports = logoCommand;
