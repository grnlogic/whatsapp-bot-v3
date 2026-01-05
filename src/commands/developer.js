/**
 * Developer Contact Command
 * Menampilkan informasi kontak developer bot
 */
async function developerCommand(client, message) {
    try {
        const developerInfo = `
👨‍💻 *BOT DEVELOPER*
━━━━━━━━━━━━━━━━━━━━

*Fajar Geran Arifin*
Bot Developer & Backend Engineer

📚 *Background:*
Mahasiswa Teknik Informatika yang fokus pada pengembangan WhatsApp Bot berbasis Node.js dengan pendekatan modular, scalable, dan stabil.

🔧 *Expertise:*
• WhatsApp Bot Development
• Backend Engineering
• API Integration
• Automation Solutions

🎯 *Project Focus:*
Bot ini dikembangkan untuk mengintegrasikan berbagai fitur seperti pencarian informasi, media downloader, image search, serta integrasi API pihak ketiga sebagai sarana eksplorasi teknologi dan pembelajaran.

━━━━━━━━━━━━━━━━━━━━

📞 *CONTACT DEVELOPER:*

📸 *Instagram:*
https://www.instagram.com/qx.nkp_amv/

💬 *WhatsApp:*
https://wa.me/6289507654588

━━━━━━━━━━━━━━━━━━━━

💡 Untuk saran, bug report, atau kebutuhan pengembangan lanjutan, silakan hubungi via WhatsApp.

🙏 Terima kasih telah menggunakan bot ini!
`;

        await message.reply(developerInfo);
        console.log(`✅ Developer info displayed for ${message.from}`);

    } catch (error) {
        console.error('Error executing developer command:', error);
        await message.reply('❌ Terjadi kesalahan saat menampilkan info developer.');
    }
}

module.exports = developerCommand;
