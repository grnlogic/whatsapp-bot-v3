module.exports = {
    name: 'myid',
    aliases: ['getid', 'whoami', 'me'],
    description: 'Cek ID WhatsApp Anda',
    usage: '/myid',
    category: 'utility',
    async execute(msg, args) {
        try {
            const sender = msg.author || msg.from;
            const chat = await msg.getChat();
            
            let response = `🆔 *Your WhatsApp ID*\n\n`;
            response += `👤 Your ID: \`${sender}\`\n\n`;
            
            if (chat.isGroup) {
                response += `📱 Chat Type: Group\n`;
                response += `👥 Group ID: \`${msg.from}\`\n`;
                response += `📛 Group Name: ${chat.name}\n\n`;
                
                // Check if admin
                const participant = chat.participants.find(p => p.id._serialized === sender);
                if (participant) {
                    response += `👑 Admin: ${participant.isAdmin || participant.isSuperAdmin ? 'Yes' : 'No'}\n`;
                }
            } else {
                response += `📱 Chat Type: Personal\n`;
            }
            
            response += `\n💡 Copy ID di atas untuk konfigurasi whitelist/developer`;
            
            msg.reply(response);
        } catch (error) {
            console.error('Error myid command:', error);
            msg.reply('❌ Terjadi kesalahan saat mengambil ID');
        }
    }
};
