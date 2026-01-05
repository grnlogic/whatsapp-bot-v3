const { getJadwalTV } = require('../services/lolhumanService');

module.exports = {
    name: 'jadwaltv',
    aliases: ['tv'],
    description: 'Cek jadwal TV hari ini',
    usage: '/jadwaltv <nama_channel>',
    category: 'utility',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /jadwaltv <nama_channel>\n\nContoh:\n/jadwaltv rcti\n/jadwaltv sctv\n/jadwaltv trans7');
        }

        const channel = args.join(' ').toLowerCase();
        await msg.reply('⏳ Mengambil jadwal TV...');

        try {
            const result = await getJadwalTV(channel);

            if (!result.success) {
                return msg.reply(`❌ Channel tidak ditemukan: ${result.error}`);
            }

            const schedules = Array.isArray(result.data) ? result.data : [result.data];
            
            let response = `📺 *Jadwal TV ${channel.toUpperCase()}*\n\n`;
            
            schedules.slice(0, 10).forEach((schedule, index) => {
                response += `⏰ ${schedule.time || 'N/A'} - ${schedule.program || schedule.title || 'N/A'}\n`;
            });

            msg.reply(response);
        } catch (error) {
            console.error('Error jadwaltv command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil jadwal TV');
        }
    }
};
