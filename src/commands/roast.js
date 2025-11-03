const roastService = require('../services/roastService');

/**
 * Command Roast/Hina - Untuk roasting teman dengan lucu
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function roastCommand(client, message, args) {
    try {
        const userId = message.from;
        const subCommand = args[0]?.toLowerCase();
        
        // Jika ada subcommand khusus
        if (subCommand === 'stats' || subCommand === 'statistik') {
            await showStats(message, userId);
            return;
        }
        
        if (subCommand === 'reset') {
            await resetRoasts(message, userId);
            return;
        }
        
        if (subCommand === 'help' || args.length === 0) {
            await showHelp(message);
            return;
        }
        
        // Cek apakah ada mention dalam pesan
        const mentionedUsers = await message.getMentions();
        let targetName = '';
        let mentionedJid = null;
        
        if (mentionedUsers && mentionedUsers.length > 0) {
            // Jika ada yang di-mention, gunakan nama contact atau nomor mereka
            const mentionedUser = mentionedUsers[0];
            targetName = mentionedUser.pushname || mentionedUser.verifiedName || mentionedUser.number;
            mentionedJid = mentionedUser.id._serialized;
        } else {
            // Jika tidak ada mention, ambil nama dari args
            targetName = args.join(' ').trim();
        }
        
        if (!targetName) {
            await message.reply('❌ Saha nu rék dimaki? 🤔\n\nContoh:\n!maki Nabil\natau\n!maki @mention');
            return;
        }
        
        // Validasi panjang nama (max 50 karakter)
        if (targetName.length > 50) {
            await message.reply('❌ Panjang teuing namana! Maksimal 50 karakter.');
            return;
        }
        
        // Get random roast
        const roastText = roastService.getRandomRoast(userId, targetName);
        
        // Get stats
        const stats = roastService.getRoastStats(userId);
        
        // Kirim roasting dengan mention jika ada
        let response = '';
        
        // Jika ada mention, tambahkan mention di response
        if (mentionedJid) {
            response += `@${mentionedJid.split('@')[0]} ${roastText.replace(targetName, '').trim()}`;
        } else {
            response += `${roastText}`;
        }
        
        // Kirim dengan mention jika ada
        if (mentionedJid) {
            await client.sendMessage(message.from, response, {
                mentions: [mentionedJid]
            });
        } else {
            await message.reply(response);
        }
        
        console.log(`✅ Roast berhasil untuk ${targetName} oleh ${userId}`);
    } catch (error) {
        console.error('Error executing roast command:', error);
        await message.reply('❌ Terjadi kesalahan saat menjalankan command.');
    }
}

/**
 * Menampilkan statistik roasting
 */
async function showStats(message, userId) {
    const stats = roastService.getRoastStats(userId);
    
    let response = `📊 *STATISTIK ROASTING*\n\n`;
    response += `🔥 Total roast tersedia: ${stats.total}\n`;
    response += `✅ Sudah digunakan: ${stats.totalUsed}\n`;
    response += `📦 Sisa belum keluar: ${stats.remaining}\n\n`;
    
    if (stats.remaining === 0) {
        response += `🎉 Selamat! Kamu sudah menggunakan semua roast!\n`;
        response += `💡 Roast akan di-reset otomatis, kamu bisa mulai dari awal lagi.`;
    } else {
        const percentage = ((stats.totalUsed / stats.total) * 100).toFixed(1);
        response += `📈 Progress: ${percentage}%\n\n`;
        response += `💡 Ketik !hina reset untuk reset history`;
    }
    
    await message.reply(response);
}

/**
 * Reset history roasting
 */
async function resetRoasts(message, userId) {
    const success = roastService.resetHistory(userId);
    
    if (success) {
        await message.reply(`✅ History roasting berhasil di-reset!\n\nSekarang kamu bisa pakai semua ${roastService.totalRoasts} roast dari awal lagi! 🔥`);
    } else {
        await message.reply('ℹ️ History kamu masih kosong, belum ada yang perlu di-reset.');
    }
}

/**
 * Menampilkan help
 */
async function showHelp(message) {
    const helpText = `
🔥 *MAKI-MAKI COMMAND - HELP*

━━━━━━━━━━━━━━━━━━

📝 *Cara Menggunakan:*

*Metode 1: Dengan Nama*
!maki [nama]
Maki-maki teman dengan nama tertentu

*Metode 2: Dengan Mention/Tag*
!maki @nama
Tag/mention orang yang mau dimaki

*Contoh:*
!maki Nabil
!maki Asep Bengek
!maki @628123456789

━━━━━━━━━━━━━━━━━━

🎯 *Fitur Spesial:*

• *Mention Support:* Tag orang dan bot akan tag balik! 🏷️
• *Anti-Duplicate:* Makian tidak akan keluar berturut-turut
• *${roastService.totalRoasts}+ Variasi:* Banyak pilihan makian lucu
• *Random System:* Setiap makian berbeda-beda
• *Progress Tracking:* Lihat berapa makian yang sudah keluar

━━━━━━━━━━━━━━━━━━

⚙️ *Command Tambahan:*

!maki stats
→ Lihat statistik makian kamu

!maki reset
→ Reset history, mulai dari awal

!maki help
→ Tampilkan help ini

━━━━━━━━━━━━━━━━━━

💡 *Tips:*

• Roast bersifat random
• Tidak akan keluar roast yang sama berturut-turut
• Setelah semua roast keluar, akan otomatis reset
• Semua roast adalah candaan, jangan baper ya! 😂

━━━━━━━━━━━━━━━━━━

⚠️ *Catatan:*
Ini hanya untuk hiburan dan bercanda!
Jangan sampai bikin sakit hati temen ya 😊

Selamat ber-roasting! 🔥
`;

    await message.reply(helpText);
}

module.exports = roastCommand;
