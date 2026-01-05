const { getAsmaulHusna } = require('../services/lolhumanService');

module.exports = {
    name: 'asmaulhusna',
    aliases: ['asmaul', 'nama99'],
    description: 'Dapatkan Asmaul Husna (99 Nama Allah)',
    usage: '/asmaulhusna [nomor]',
    category: 'quran',
    async execute(msg, args) {
        await msg.reply('⏳ Mengambil Asmaul Husna...');

        try {
            const result = await getAsmaulHusna();

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan Asmaul Husna: ${result.error}`);
            }

            const names = Array.isArray(result.data) ? result.data : Object.values(result.data);
            
            if (args.length > 0) {
                // Show specific name
                const index = parseInt(args[0]) - 1;
                if (index >= 0 && index < names.length) {
                    const name = names[index];
                    let response = `✨ *Asmaul Husna #${index + 1}*\n\n`;
                    response += `🕌 ${name.latin || name.name}\n`;
                    response += `📖 ${name.arab || name.arabic}\n\n`;
                    response += `📝 Arti: ${name.arti || name.meaning}`;
                    return msg.reply(response);
                } else {
                    return msg.reply('❌ Nomor tidak valid. Gunakan 1-99');
                }
            }

            // Show all names
            let response = `✨ *99 Asmaul Husna*\n\n`;
            
            names.forEach((name, index) => {
                if (index < 20) { // Show first 20
                    response += `${index + 1}. ${name.latin || name.name} - ${name.arti || name.meaning}\n`;
                }
            });

            response += `\n💡 Gunakan /asmaulhusna <nomor> untuk detail`;

            msg.reply(response);
        } catch (error) {
            console.error('Error asmaulhusna command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil Asmaul Husna');
        }
    }
};
