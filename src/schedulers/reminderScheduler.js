const cron = require('node-cron');
const todoService = require('../services/todoService');

/**
 * Scheduler untuk reminder otomatis
 * @param {Object} client - WhatsApp client
 */
function initReminderScheduler(client) {
    console.log('🔔 Reminder scheduler diaktifkan');
    
    // Cek setiap jam pada menit ke-0 (contoh: 08:00, 09:00, 10:00, dst)
    // Format: '0 * * * *' = setiap jam
    // Format: '0 8 * * *' = setiap hari jam 8 pagi
    // Format: '*/30 * * * *' = setiap 30 menit
    
    // Reminder jam 8 pagi setiap hari
    cron.schedule('0 8 * * *', async () => {
        console.log('⏰ Menjalankan reminder check - Jam 8 pagi');
        await sendReminders(client);
    });
    
    // Reminder jam 12 siang setiap hari
    cron.schedule('0 12 * * *', async () => {
        console.log('⏰ Menjalankan reminder check - Jam 12 siang');
        await sendReminders(client);
    });
    
    // Reminder jam 6 sore setiap hari
    cron.schedule('0 18 * * *', async () => {
        console.log('⏰ Menjalankan reminder check - Jam 6 sore');
        await sendReminders(client);
    });
    
    // Untuk testing: cek setiap 5 menit (uncomment jika perlu test)
    // cron.schedule('*/5 * * * *', async () => {
    //     console.log('⏰ Menjalankan reminder check - Test setiap 5 menit');
    //     await sendReminders(client);
    // });
}

/**
 * Mengirim reminder ke user yang punya task menjelang deadline
 */
async function sendReminders(client) {
    try {
        const allUsers = todoService.getAllUsers();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        console.log(`📊 Mengecek reminder untuk ${allUsers.length} user...`);
        
        for (const userId of allUsers) {
            const tasks = todoService.getPendingTasks(userId);
            
            // Filter task yang deadlinenya 1 hari lagi
            const tasksToRemind = tasks.filter(task => {
                const taskDate = new Date(task.deadline.getFullYear(), task.deadline.getMonth(), task.deadline.getDate());
                const diffTime = taskDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Task yang deadline-nya besok (1 hari lagi)
                return diffDays === 1;
            });
            
            // Filter task yang deadline-nya hari ini
            const tasksToday = tasks.filter(task => {
                const taskDate = new Date(task.deadline.getFullYear(), task.deadline.getMonth(), task.deadline.getDate());
                const diffTime = taskDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return diffDays === 0;
            });
            
            // Kirim reminder untuk task besok
            if (tasksToRemind.length > 0) {
                await sendReminderMessage(client, userId, tasksToRemind, 1);
            }
            
            // Kirim reminder untuk task hari ini
            if (tasksToday.length > 0) {
                await sendReminderMessage(client, userId, tasksToday, 0);
            }
        }
        
        console.log('✅ Reminder check selesai');
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
}

/**
 * Mengirim pesan reminder ke user
 */
async function sendReminderMessage(client, userId, tasks, daysLeft) {
    try {
        const priorityEmoji = {
            low: '🟢',
            medium: '🟡',
            high: '🟠',
            urgent: '🔴'
        };
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        let message = '';
        
        if (daysLeft === 1) {
            message = `🔔 *REMINDER - DEADLINE BESOK!*\n\n`;
            message += `⏰ Waktu: ${timeStr}\n`;
            message += `📅 Tanggal: ${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
            message += `Anda memiliki *${tasks.length} task* yang deadline-nya *BESOK*:\n\n`;
        } else {
            message = `⚠️ *REMINDER - DEADLINE HARI INI!*\n\n`;
            message += `⏰ Waktu: ${timeStr}\n`;
            message += `📅 Tanggal: ${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
            message += `Anda memiliki *${tasks.length} task* yang deadline-nya *HARI INI*:\n\n`;
        }
        
        tasks.forEach((task, index) => {
            message += `${index + 1}. ${priorityEmoji[task.priority]} *${task.title}*\n`;
            message += `   ID: ${task.id} | Prioritas: ${task.priority.toUpperCase()}\n`;
            message += `   📅 Deadline: ${task.deadline.toLocaleDateString('id-ID')}\n`;
            if (task.description) {
                message += `   📝 ${task.description}\n`;
            }
            message += `\n`;
        });
        
        message += `💡 Gunakan !todo done [id] untuk menandai task selesai.\n`;
        message += `💡 Gunakan !todo list untuk melihat semua task.`;
        
        // Kirim pesan
        await client.sendMessage(userId, message);
        console.log(`✅ Reminder terkirim ke ${userId} (${tasks.length} task, ${daysLeft} hari lagi)`);
        
    } catch (error) {
        console.error(`Error sending reminder to ${userId}:`, error);
    }
}

/**
 * Kirim reminder manual untuk user tertentu
 */
async function sendManualReminder(client, userId) {
    const tasks = todoService.getPendingTasks(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcomingTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline.getFullYear(), task.deadline.getMonth(), task.deadline.getDate());
        const diffTime = taskDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3; // Task dalam 3 hari ke depan
    });
    
    if (upcomingTasks.length === 0) {
        return false;
    }
    
    // Kirim reminder
    const priorityEmoji = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
    };
    
    let message = `🔔 *REMINDER - TASK MENDATANG*\n\n`;
    message += `Anda memiliki *${upcomingTasks.length} task* dalam 3 hari ke depan:\n\n`;
    
    upcomingTasks.forEach((task, index) => {
        const taskDate = new Date(task.deadline.getFullYear(), task.deadline.getMonth(), task.deadline.getDate());
        const diffTime = taskDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        message += `${index + 1}. ${priorityEmoji[task.priority]} *${task.title}*\n`;
        message += `   📅 ${task.deadline.toLocaleDateString('id-ID')} (${diffDays} hari lagi)\n`;
        message += `   Prioritas: ${task.priority.toUpperCase()}\n\n`;
    });
    
    await client.sendMessage(userId, message);
    return true;
}

module.exports = {
    initReminderScheduler,
    sendManualReminder
};
