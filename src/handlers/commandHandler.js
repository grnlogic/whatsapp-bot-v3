const pingCommand = require('../commands/ping');
const todoCommand = require('../commands/todo');
const reminderCommand = require('../commands/reminder');
const uptimeCommand = require('../commands/uptime');
const menuCommand = require('../commands/menu');
const helpCommand = require('../commands/help');
const roastCommand = require('../commands/roast');
const nekoCommand = require('../commands/neko');
const hidetagCommand = require('../commands/hidetag');
const infoCommand = require('../commands/info');
const stickerCommand = require('../commands/sticker');
const downloadCommand = require('../commands/download');
const ytmp3Command = require('../commands/ytmp3');
const afkCommand = require('../commands/afk');

/**
 * Handler untuk memproses command dari pesan
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 */
async function commandHandler(client, message) {
    // Ambil isi pesan untuk command dan lowercase untuk routing
    const body = message.body.trim();
    const bodyLower = body.toLowerCase();
    
    // Cek apakah pesan dimulai dengan prefix (!)
    const prefix = '!';
    
    if (!bodyLower.startsWith(prefix)) {
        return; // Abaikan pesan yang bukan command
    }
    
    // Ambil command dan arguments (preserve case untuk arguments)
    const argsLower = bodyLower.slice(prefix.length).trim().split(/ +/);
    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = argsLower.shift();
    args.shift(); // Remove command dari args juga
    
    // Log command yang diterima dengan info lebih detail
    const chat = await message.getChat();
    const sender = message.author || message.from; // author untuk grup, from untuk personal
    const senderPhone = sender.split('@')[0];
    
    if (chat.isGroup) {
        console.log(`📨 Command "${command}" dari +${senderPhone} di grup "${chat.name}"`);
    } else {
        console.log(`📨 Command "${command}" dari +${senderPhone} (personal chat)`);
    }
    
    // Routing command
    switch (command) {
        case 'ping':
            await pingCommand(client, message);
            break;
        
        case 'menu':
        case 'start':
        case 'commands':
            await menuCommand(client, message);
            break;
        
        case 'help':
        case 'bantuan':
        case 'panduan':
            await helpCommand(client, message);
            break;
        
        case 'todo':
        case 'task':
            await todoCommand(client, message, args);
            break;
        
        case 'reminder':
        case 'cekreminder':
        case 'ingatkan':
            await reminderCommand(client, message);
            break;
        
        case 'uptime':
        case 'status':
        case 'runtime':
            await uptimeCommand(client, message);
            break;
        
        case 'maki':
        case 'roast':
        case 'ejek':
        case 'caci':
            await roastCommand(client, message, args);
            break;
        
        case 'neko':
        case 'catgirl':
        case 'nekoimg':
            await nekoCommand(client, message, args);
            break;
        
        case 'hidetag':
        case 'tagall':
        case 'tag':
            await hidetagCommand(client, message, args);
            break;
        
        case 'info':
        case 'sistem':
        case 'sysinfo':
        case 'system':
            await infoCommand(client, message);
            break;
        
        case 'sticker':
        case 's':
        case 'stiker':
        case 'stik':
            await stickerCommand(client, message, args);
            break;
        
        case 'download':
        case 'dl':
        case 'unduh':
        case 'tiktok':
        case 'tt':
        case 'instagram':
        case 'ig':
        case 'youtube':
        case 'yt':
            await downloadCommand(client, message, args);
            break;
        
        case 'ytmp3':
        case 'mp3':
        case 'ytaudio':
        case 'youtubemp3':
            await ytmp3Command(client, message, args);
            break;
        
        case 'afk':
        case 'away':
            await afkCommand.execute(client._client || client, message, args);
            break;
        
        // Tambahkan case untuk command lainnya di sini
        
        default:
            // Command tidak dikenali
            await message.reply('❌ Command tidak dikenali.\n\n💡 Ketik *!menu* untuk melihat daftar command.\n💡 Ketik *!help* untuk bantuan lengkap.');
            break;
    }
}

module.exports = commandHandler;
