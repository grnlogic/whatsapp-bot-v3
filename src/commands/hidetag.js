const { isOwner } = require('./exec');

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
        
        // Ambil sender ID - untuk GRUP pakai message.author, untuk PRIVATE pakai message.from
        const sender = chat.isGroup ? message.author : message.from;
        
        // Normalisasi sender ID (handle @lid dan @c.us)
        const senderNumber = sender.split('@')[0]; // Ambil nomor saja
        
        console.log(`🔍 Debug Hidetag:`);
        console.log(`   Is Group: ${chat.isGroup}`);
        console.log(`   Sender (from): ${message.from}`);
        console.log(`   Sender (author): ${message.author}`);
        console.log(`   Final Sender: ${sender}`);
        console.log(`   Sender Number: ${senderNumber}`);
        console.log(`   Total participants: ${chat.participants.length}`);
        console.log(`   Participants IDs:`);
        chat.participants.forEach((p, i) => {
            console.log(`     ${i+1}. ${p.id._serialized} (Admin: ${p.isAdmin})`);
        });
        
        // CHECK 1: Apakah user adalah OWNER? (bypass admin check)
        const userIsOwner = isOwner(sender);
        
        if (!userIsOwner) {
            // CHECK 2: Apakah user adalah admin grup? (hanya cek jika bukan owner)
            // Cari participant - coba match dengan berbagai cara
            let participant = chat.participants.find(p => {
                const pId = p.id._serialized;
                const pNumber = pId.split('@')[0];
                
                // Match exact ID
                if (pId === sender) return true;
                
                // Match by number only (ignore domain)
                if (pNumber === senderNumber) return true;
                
                // Match jika sender pakai @lid tapi participant pakai @c.us
                if (sender.includes('@lid') && pId.includes('@c.us')) {
                    return pNumber === senderNumber;
                }
                
                return false;
            });
            
            console.log(`   Participant found: ${participant ? 'Yes' : 'No'}`);
            console.log(`   Is Admin: ${participant ? participant.isAdmin : 'N/A'}`);
            
            // Cek apakah user adalah admin
            if (!participant) {
                await message.reply('❌ Gagal memverifikasi status admin. Coba lagi.');
                return;
            }
            
            if (!participant.isAdmin) {
                await message.reply('❌ Command ini hanya bisa digunakan oleh admin grup!');
                return;
            }
            
            console.log(`   ✅ User is GROUP ADMIN`);
        } else {
            console.log(`   ✅ User is OWNER - bypassing admin check`);
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
