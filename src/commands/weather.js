const { getWeather } = require('../services/lolhumanService');

module.exports = {
    name: 'weather',
    aliases: ['cuaca'],
    description: 'Cek cuaca kota',
    usage: '/weather <nama_kota>',
    category: 'utility',
    async execute(msg, args) {
        if (args.length === 0) {
            return msg.reply('❌ Gunakan: /weather <nama_kota>\n\nContoh:\n/weather Jakarta\n/weather Surabaya');
        }

        const city = args.join(' ');
        await msg.reply('⏳ Mengecek cuaca...');

        try {
            const result = await getWeather(city);

            if (!result.success) {
                return msg.reply(`❌ Kota tidak ditemukan: ${result.error}`);
            }

            const weather = result.data;
            
            let response = `🌤️ *Cuaca ${city}*\n\n`;
            response += `🌡️ Suhu: ${weather.temperature || 'N/A'}\n`;
            response += `☁️ Kondisi: ${weather.description || 'N/A'}\n`;
            response += `💧 Kelembaban: ${weather.humidity || 'N/A'}\n`;
            response += `💨 Angin: ${weather.wind || 'N/A'}`;

            msg.reply(response);
        } catch (error) {
            console.error('Error weather command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengecek cuaca');
        }
    }
};
