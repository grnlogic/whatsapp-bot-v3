const { getQuranSurah } = require('../services/lolhumanService');

module.exports = {
    name: 'quran',
    aliases: ['surah', 'alquran'],
    description: 'Baca ayat Al-Quran berdasarkan nomor surah',
    usage: '/quran <nomor_surah>',
    category: 'quran',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /quran <nomor_surah>\n\nContoh:\n/quran 1 (Al-Fatihah)\n/quran 112 (Al-Ikhlas)');
        }

        const surahNumber = args[0];
        
        if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
            return msg.reply('❌ Nomor surah harus antara 1-114');
        }

        await msg.reply('⏳ Mengambil surah...');

        try {
            const result = await getQuranSurah(surahNumber);

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan surah: ${result.error}`);
            }

            const surah = result.data;
            const ayahs = surah.ayat || surah.verses || [];
            
            let response = `📖 *${surah.nama || surah.name}*\n`;
            response += `${surah.asma || surah.latin || ''}\n\n`;
            response += `📊 Surah ${surahNumber} | ${ayahs.length} Ayat\n`;
            response += `📍 ${surah.tempat_turun || surah.type || ''}\n\n`;
            
            // Show first 5 ayahs
            ayahs.slice(0, 5).forEach((ayah, index) => {
                response += `${index + 1}. ${ayah.arab || ayah.text_arab || ''}\n`;
                response += `${ayah.latin || ''}\n`;
                response += `${ayah.terjemahan || ayah.translation || ''}\n\n`;
            });

            if (ayahs.length > 5) {
                response += `... dan ${ayahs.length - 5} ayat lainnya`;
            }

            msg.reply(response);
        } catch (error) {
            console.error('Error quran command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil surah');
        }
    }
};
