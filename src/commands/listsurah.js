const { getQuranSurahList } = require('../services/lolhumanService');

module.exports = {
    name: 'listsurah',
    aliases: ['surahlist', 'quranlist'],
    description: 'Dapatkan daftar semua surah Al-Quran',
    usage: '/listsurah',
    category: 'quran',
    async execute(msg, args) {
        await msg.reply('⏳ Mengambil daftar surah...');

        try {
            const result = await getQuranSurahList();

            if (!result.success) {
                return msg.reply(`❌ Gagal mendapatkan daftar: ${result.error}`);
            }

            const surahs = Array.isArray(result.data) ? result.data : Object.values(result.data);
            
            let response = `📖 *Daftar Surah Al-Quran*\n\n`;
            
            surahs.forEach((surah, index) => {
                if (index < 20) { // Show first 20
                    response += `${surah.number || index + 1}. ${surah.name || surah.latin || 'N/A'}\n`;
                }
            });

            response += `\n💡 Gunakan /quran <nomor> untuk membaca surah`;

            msg.reply(response);
        } catch (error) {
            console.error('Error listsurah command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil daftar surah');
        }
    }
};
