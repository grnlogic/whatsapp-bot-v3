const { getJadwalSholat } = require('../services/lolhumanService');

module.exports = {
    name: 'jadwalsholat',
    aliases: ['sholat', 'prayer'],
    description: 'Cek jadwal sholat kota',
    usage: '/jadwalsholat <nama_kota>',
    category: 'utility',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /jadwalsholat <nama_kota>\n\nContoh:\n/jadwalsholat Jakarta\n/jadwalsholat Bandung');
        }

        const city = args.join(' ');
        await msg.reply('⏳ Mengambil jadwal sholat...');

        try {
            const result = await getJadwalSholat(city);

            if (!result.success) {
                return msg.reply(`❌ Kota tidak ditemukan: ${result.error}`);
            }

            const jadwal = result.data;
            
            let response = `🕌 *Jadwal Sholat ${city}*\n\n`;
            response += `📅 Tanggal: ${jadwal.tanggal || 'N/A'}\n\n`;
            response += `🌅 Subuh: ${jadwal.subuh || jadwal.fajr || 'N/A'}\n`;
            response += `🌄 Dzuhur: ${jadwal.dzuhur || jadwal.dhuhr || 'N/A'}\n`;
            response += `☀️ Ashar: ${jadwal.ashar || jadwal.asr || 'N/A'}\n`;
            response += `🌆 Maghrib: ${jadwal.maghrib || 'N/A'}\n`;
            response += `🌃 Isya: ${jadwal.isya || jadwal.isha || 'N/A'}`;

            msg.reply(response);
        } catch (error) {
            console.error('Error jadwalsholat command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil jadwal sholat');
        }
    }
};
