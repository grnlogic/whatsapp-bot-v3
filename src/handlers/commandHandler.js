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
const logoCommand = require('../commands/logo');
const { playCommand, songCommand, ytsCommand } = require('../commands/youtube');
const { altPlayCommand } = require('../commands/youtubeAlt');
const { ultimateYouTubeDownload } = require('../services/ultimateYoutube');
const { fileManagerCommand } = require('../commands/fileManager');

// LoLHuman API Commands (Yang bekerja)
const qrcodeCommand = require('../commands/qrcode');
const asmaulhusnaCommand = require('../commands/asmaulhusna');
const pinterestCommand = require('../commands/pinterest');
const pixivCommand = require('../commands/pixiv');
const stalkigCommand = require('../commands/stalkig');
const quoteCommand = require('../commands/quote');
const chordCommand = require('../commands/chord');
const characterCommand = require('../commands/character');
const waitCommand = require('../commands/wait');
const myidCommand = require('../commands/myid');
const wallpaperCommand = require('../commands/wallpaper');
const texteffectCommand = require('../commands/texteffect');
const faktaunikCommand = require('../commands/faktaunik');
const bucinCommand = require('../commands/bucin');
const quotesimageCommand = require('../commands/quotesimage');

// NSFW Commands (18+)
const nekopoiCommand = require('../commands/nsfw/nekopoi');
const nhentaiCommand = require('../commands/nsfw/nhentai');
const nhsearchCommand = require('../commands/nsfw/nhsearch');
const danbooruCommand = require('../commands/nsfw/danbooru');

// NSFW Registration & Management
const registerCommand = require('../commands/nsfw/register');
const verifyCommand = require('../commands/nsfw/verify');
const nsfwlistCommand = require('../commands/nsfw/nsfwlist');

// Ban Management
const banCommand = require('../commands/ban');
const unbanCommand = require('../commands/unban');
const banlistCommand = require('../commands/banlist');
const banService = require('../services/banService');

// Delete Management
const deleteCommand = require('../commands/delete');

// Developer Info
const developerCommand = require('../commands/developer');

// Terminal & System Commands (Owner Only)
const { execCommand, execInCommand, isOwner } = require('../commands/exec');
const { gitPullCommand, gitStatusCommand, gitLogCommand } = require('../commands/gitops');
const { botStopCommand, botStartCommand, botStatusCommand } = require('../commands/botcontrol');
const { restartCommand, pm2StatusCommand, pm2StopCommand, pm2StartCommand } = require('../commands/pm2control');

// Bot State Service
const botStateService = require('../services/botStateService');

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
    
    // Check if user is banned (before processing any command)
    const isBanned = await banService.isUserBanned(sender);
    if (isBanned) {
        const banInfo = await banService.getBannedUser(sender);
        return message.reply(
            '🚫 *Anda Telah Di-Ban*\n\n' +
            `📝 Reason: ${banInfo.reason}\n` +
            `📅 Banned at: ${new Date(banInfo.bannedAt).toLocaleString('id-ID')}\n\n` +
            '⛔ Anda tidak bisa menggunakan bot.\n' +
            'Hubungi developer jika ini kesalahan.'
        );
    }
    
    // Check if bot is in sleep mode (ignore commands from non-owners)
    if (botStateService.isSleeping() && !isOwner(sender)) {
        // Bot commands are still allowed for checking status
        if (command !== 'bot') {
            // Silent ignore - bot is sleeping (probably running locally for testing)
            return;
        }
    }
    
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
        
        case 'logo':
        case 'logomaker':
        case 'makelogo':
            await logoCommand(client, message, args);
            break;
        
        case 'play':
        case 'musik':
        case 'lagu':
            await playCommand(client, message, args);
            break;
        
        case 'song':
        case 'ytdl':
            await songCommand(client, message, args);
            break;
        
        case 'yts':
        case 'ytsearch':
        case 'cariyt':
            await ytsCommand(client, message, args);
            break;
        
        case 'altplay':
        case 'altyt':
        case 'playfallback':
            await altPlayCommand(client, message, args);
            break;
        
        case 'filemgr':
        case 'filemanager':
        case 'fm':
        case 'files':
            await fileManagerCommand(client, message, args);
            break;
        
        // LoLHuman API - Working Commands
        case 'qrcode':
        case 'qr':
            await qrcodeCommand.execute(message, args);
            break;
        
        case 'pinterest':
        case 'pin':
        case 'pint':
            await pinterestCommand.execute(message, args);
            break;
        
        case 'pixiv':
        case 'pix':
        case 'pixivimg':
            await pixivCommand(client, message, args);
            break;
        
        case 'stalkig':
        case 'igstalk':
        case 'igprofile':
            await stalkigCommand.execute(message, args);
            break;
        
        case 'quote':
        case 'quotes':
        case 'randomquote':
            await quoteCommand.execute(message, args);
            break;
        
        case 'faktaunik':
        case 'fakta':
        case 'fact':
            await faktaunikCommand.execute(message, args);
            break;
        
        case 'bucin':
        case 'katacinta':
        case 'romantis':
            await bucinCommand.execute(message, args);
            break;
        
        case 'quotesimage':
        case 'quoteimg':
        case 'imgquote':
            await quotesimageCommand.execute(message, args);
            break;
        
        case 'chord':
        case 'chordgitar':
        case 'kuncigitar':
            await chordCommand.execute(message, args);
            break;
        
        case 'asmaulhusna':
        case 'asmaul':
        case 'nama99':
            await asmaulhusnaCommand.execute(message, args);
            break;
        
        case 'myid':
        case 'getid':
        case 'whoami':
        case 'me':
            await myidCommand.execute(message, args);
            break;
        
        case 'developer':
        case 'dev':
        case 'contact':
        case 'kontak':
            await developerCommand(client, message, args);
            break;
        
        // Terminal & System Commands (Owner Only)
        case 'exec':
        case 'execute':
        case 'terminal':
        case 'cmd':
            await execCommand(client, message, args);
            break;
        
        case 'execin':
        case 'exin':
        case 'cdin':
            await execInCommand(client, message, args);
            break;
        
        // Git Operations (Owner Only)
        case 'git':
            const gitSubCommand = args[0] ? args[0].toLowerCase() : '';
            const gitArgs = args.slice(1);
            
            switch (gitSubCommand) {
                case 'pull':
                case 'update':
                    await gitPullCommand(client, message, gitArgs);
                    break;
                case 'status':
                case 'stat':
                    await gitStatusCommand(client, message, gitArgs);
                    break;
                case 'log':
                case 'history':
                    await gitLogCommand(client, message, gitArgs);
                    break;
                default:
                    await message.reply(
                        '⚠️ *Git Command Usage:*\n\n' +
                        '```!git pull``` - Smart pull (auto-handle conflicts)\n' +
                        '```!git status``` - Check repository status\n' +
                        '```!git log [count]``` - View commit history\n\n' +
                        '🔒 Owner only commands'
                    );
            }
            break;
        
        // Bot Control (Owner Only)
        case 'bot':
            const botSubCommand = args[0] ? args[0].toLowerCase() : '';
            const botArgs = args.slice(1);
            
            switch (botSubCommand) {
                case 'stop':
                case 'sleep':
                case 'pause':
                    await botStopCommand(client, message);
                    break;
                case 'start':
                case 'wake':
                case 'resume':
                    await botStartCommand(client, message);
                    break;
                case 'status':
                case 'info':
                case 'state':
                    await botStatusCommand(client, message);
                    break;
                default:
                    await message.reply(
                        '⚠️ *Bot Control Usage:*\n\n' +
                        '```!bot stop``` - Put bot in sleep mode\n' +
                        '```!bot start``` - Wake up bot\n' +
                        '```!bot status``` - Check bot status\n\n' +
                        '🔒 Owner only commands'
                    );
            }
            break;
        
        // PM2 Process Management (Owner Only)
        case 'restart':
        case 'reboot':
            await restartCommand(client, message, args);
            break;
        
        case 'pm2':
            const pm2SubCommand = args[0] ? args[0].toLowerCase() : '';
            const pm2Args = args.slice(1);
            
            switch (pm2SubCommand) {
                case 'status':
                case 'list':
                case 'ls':
                    await pm2StatusCommand(client, message, pm2Args);
                    break;
                case 'restart':
                case 'reboot':
                    await restartCommand(client, message, pm2Args);
                    break;
                case 'stop':
                case 'kill':
                    await pm2StopCommand(client, message, pm2Args);
                    break;
                case 'start':
                case 'run':
                    await pm2StartCommand(client, message, pm2Args);
                    break;
                default:
                    await message.reply(
                        '⚠️ *PM2 Command Usage:*\n\n' +
                        '```!pm2 status``` - Check PM2 processes\n' +
                        '```!pm2 restart [name]``` - Restart process\n' +
                        '```!pm2 stop [name]``` - Stop process\n' +
                        '```!pm2 start [name]``` - Start process\n' +
                        '```!restart``` - Quick restart bot\n\n' +
                        '🔒 Owner only commands'
                    );
            }
            break;
        
        case 'character':
        case 'char':
        case 'animechar':
        case 'searchchar':
            await characterCommand.execute(message, args);
            break;
        
        case 'wait':
        case 'trace':
        case 'whatanime':
        case 'sauceanime':
            await waitCommand.execute(message, args);
            break;
        
        case 'wallpaper':
        case 'wall':
        case 'wp':
            await wallpaperCommand.execute(message, args);
            break;
        
        case 'texteffect':
        case 'textpro':
        case 'textmaker':
        case 'maketext':
            await texteffectCommand.execute(message, args);
            break;
        
        // NSFW Commands (18+) - Controlled Access
        case 'nekopoi':
        case 'neko18':
        case 'hentai':
            await nekopoiCommand.execute(message, args);
            break;
        
        case 'nhentai':
        case 'nh':
        case 'doujin':
            await nhentaiCommand.execute(message, args);
            break;
        
        case 'nhsearch':
        case 'nhs':
        case 'searchnh':
        case 'nhcari':
            await nhsearchCommand.execute(message, args);
            break;
        
        case 'danbooru':
        case 'danb':
        case 'danimg':
            await danbooruCommand.execute(message, args);
            break;
        
        // NSFW Registration & Management
        case 'daftar':
        case 'register':
        case 'daftarnsfw':
            await registerCommand.execute(message, args);
            break;
        
        case 'verify':
        case 'approve':
        case 'verifynsfw':
            await verifyCommand.execute(message, args);
            break;
        
        case 'nsfwlist':
        case 'listnsfw':
        case 'nsfwusers':
            await nsfwlistCommand.execute(message, args);
            break;
        
        // Ban Management (Developer Only)
        case 'ban':
        case 'banuser':
        case 'block':
            await banCommand.execute(message, args);
            break;
        
        case 'unban':
        case 'unbanuser':
        case 'unblock':
            await unbanCommand.execute(message, args);
            break;
        
        case 'banlist':
        case 'listban':
        case 'bannedusers':
            await banlistCommand.execute(message, args);
            break;
        
        // Delete Message (Admin/Developer Only)
        case 'delete':
        case 'del':
        case 'hapus':
            await deleteCommand.execute(message, args);
            break;
        
        default:
            // Command tidak dikenali
            await message.reply('❌ Command tidak dikenali.\n\n💡 Ketik *!menu* untuk melihat daftar command.\n💡 Ketik *!help* untuk bantuan lengkap.');
            break;
    }
}

module.exports = commandHandler;
