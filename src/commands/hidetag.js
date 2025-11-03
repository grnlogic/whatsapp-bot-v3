/**
 * Hide Tag Command
 * Mengirim pesan dengan mention semua member grup (hidden tag)
 * 
 * Cara pakai:
 * 1. !hidetag [pesan] - Kirim pesan dengan hidden tag
 * 2. Reply pesan + ketik !hidetag - Bot akan kirim ulang pesan yang di-reply dengan hidden tag
 * 
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function hidetagCommand(client, message, args) {
    try {
        // Cek apakah pesan dikirim di grup
        let chat = await message.getChat();
        
        if (!chat.isGroup) {
            await message.reply('❌ Command ini hanya bisa digunakan di grup!');
            return;
        }
        
        // Cek apakah user adalah admin
        const sender = message.author || message.from;
        
        // Normalisasi sender ID (handle @lid dan @c.us)
        const senderNumber = sender.split('@')[0]; // Ambil nomor saja
        
        console.log(`🔍 Debug Hidetag:`);
        console.log(`   Sender: ${sender}`);
        console.log(`   Sender Number: ${senderNumber}`);
        console.log(`   Total participants: ${chat.participants.length}`);
        console.log(`   Participants IDs:`);
        chat.participants.forEach((p, i) => {
            console.log(`     ${i+1}. ${p.id._serialized} (Admin: ${p.isAdmin})`);
        });
        
        // Cari participant berdasarkan nomor (bukan full ID)
        const participant = chat.participants.find(p => {
            const participantNumber = p.id._serialized.split('@')[0];
            console.log(`   Comparing: ${participantNumber} === ${senderNumber}`);
            return participantNumber === senderNumber;
        });
        
        console.log(`   Participant found: ${participant ? 'Yes' : 'No'}`);
        console.log(`   Is Admin: ${participant ? participant.isAdmin : 'N/A'}`);
        
        // TEMPORARY: Skip admin check jika participant tidak ditemukan
        // (untuk testing, hapus nanti setelah fix)
        if (!participant) {
            console.log(`⚠️  WARNING: Participant not found, skipping admin check for testing`);
            // Lanjutkan eksekusi tanpa cek admin
        } else if (!participant.isAdmin) {
            await message.reply('❌ Command ini hanya bisa digunakan oleh admin grup!');
            return;
        }
        
        let textToSend = '';
        
        // CEK APAKAH INI REPLY MESSAGE
        if (message.hasQuotedMsg) {
            // Ambil pesan yang di-reply
            const quotedMsg = await message.getQuotedMessage();
            
            // Ambil isi pesan yang di-reply
            if (quotedMsg.body) {
                textToSend = quotedMsg.body;
            } else if (quotedMsg.type === 'image' || quotedMsg.type === 'video') {
                textToSend = quotedMsg.caption || '📷 [Media]';
            } else {
                textToSend = '[Pesan tidak dapat ditampilkan]';
            }
            
            // Jika ada teks tambahan setelah command, tambahkan
            if (args.length > 0) {
                const additionalText = args.join(' ');
                textToSend = `${textToSend}\n\n${additionalText}`;
            }
        } else {
            // Tidak ada reply, ambil teks dari args
            textToSend = args.join(' ');
            
            // Jika tidak ada teks, gunakan teks default
            if (!textToSend || textToSend.trim() === '') {
                textToSend = '📢 *PENGUMUMAN GRUP* 📢';
            }
        }
        
        // Dapatkan semua participant ID untuk mention
        const mentions = chat.participants.map(p => p.id._serialized);
        
        // Kirim pesan dengan hidden mentions
        await chat.sendMessage(textToSend, {
            mentions: mentions
        });
        
        // Hapus pesan command (opsional)
        // await message.delete(true);
        
        // Log dengan info lebih detail
        const senderPhone = sender.split('@')[0]; // Ambil nomor HP saja
        const groupId = chat.id._serialized.split('@')[0]; // Ambil group ID saja
        console.log(`✅ Hidetag dikirim oleh +${senderPhone} di grup "${chat.name}" (${groupId})`);
        
    } catch (error) {
        console.error('Error executing hidetag command:', error);
        await message.reply('❌ Terjadi kesalahan saat mengirim hidetag.');
    }
}

module.exports = hidetagCommand;
