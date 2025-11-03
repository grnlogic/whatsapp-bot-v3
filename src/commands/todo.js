const todoService = require('../services/todoService');

/**
 * Command Todo - Project Reminder & Task Tracker
 * Fungsi untuk mengelola task dan reminder
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Pesan yang diterima
 * @param {Array} args - Arguments dari command
 */
async function todoCommand(client, message, args) {
    try {
        const userId = message.from;
        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'add':
            case 'tambah':
                await addTask(message, args, userId);
                break;

            case 'list':
            case 'semua':
                await listTasks(message, userId);
                break;

            case 'done':
            case 'selesai':
                await markDone(message, args, userId);
                break;

            case 'delete':
            case 'hapus':
                await deleteTask(message, args, userId);
                break;

            case 'pending':
                await listPendingTasks(message, userId);
                break;

            case 'overdue':
                await listOverdueTasks(message, userId);
                break;

            case 'detail':
                await taskDetail(message, args, userId);
                break;

            case 'edit':
                await editTask(message, args, userId);
                break;

            case 'help':
            default:
                await showHelp(message);
                break;
        }

        console.log(`✅ Todo command berhasil: ${subCommand}`);
    } catch (error) {
        console.error('Error executing todo command:', error);
        await message.reply('❌ Terjadi kesalahan saat menjalankan command.');
    }
}

// Menambahkan task baru
async function addTask(message, args, userId) {
    if (args.length < 2) {
        return await message.reply('❌ Format salah!\n\nContoh:\n!todo add Belajar JavaScript | 2025-11-01 | high | Belajar async await');
    }

    const taskData = args.slice(1).join(' ').split('|').map(s => s.trim());
    
    if (taskData.length < 2) {
        return await message.reply('❌ Format salah! Minimal: judul | tanggal\n\nContoh:\n!todo add Meeting Client | 2025-11-01');
    }

    const title = taskData[0];
    const deadline = taskData[1];
    const priority = taskData[2]?.toLowerCase() || 'medium';
    const description = taskData[3] || '';

    // Validasi tanggal
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
        return await message.reply('❌ Format tanggal salah! Gunakan format: YYYY-MM-DD\nContoh: 2025-11-01');
    }

    // Validasi prioritas
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
        return await message.reply('❌ Prioritas tidak valid! Gunakan: low, medium, high, atau urgent');
    }

    const task = todoService.addTask(userId, {
        title,
        deadline: deadlineDate,
        priority,
        description
    });

    const priorityEmoji = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
    };

    await message.reply(
        `✅ *Task berhasil ditambahkan!*\n\n` +
        `📋 *ID:* ${task.id}\n` +
        `📝 *Judul:* ${task.title}\n` +
        `📅 *Deadline:* ${task.deadline.toLocaleDateString('id-ID')}\n` +
        `${priorityEmoji[task.priority]} *Prioritas:* ${task.priority.toUpperCase()}\n` +
        `${task.description ? `📄 *Deskripsi:* ${task.description}\n` : ''}` +
        `\nGunakan !todo list untuk melihat semua task.`
    );
}

// Menampilkan semua task
async function listTasks(message, userId) {
    const tasks = todoService.getUserTasks(userId);

    if (tasks.length === 0) {
        return await message.reply('📭 Tidak ada task. Gunakan !todo add untuk menambah task.');
    }

    let response = `📋 *DAFTAR TASK ANDA*\n`;
    response += `Total: ${tasks.length} task\n\n`;

    const priorityEmoji = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
    };

    const statusEmoji = {
        pending: '⏳',
        done: '✅',
        overdue: '⚠️'
    };

    tasks.forEach((task, index) => {
        const status = todoService.getTaskStatus(task);
        const daysLeft = Math.ceil((task.deadline - new Date()) / (1000 * 60 * 60 * 24));
        
        response += `${index + 1}. ${statusEmoji[status]} *${task.title}*\n`;
        response += `   ID: ${task.id} | ${priorityEmoji[task.priority]} ${task.priority.toUpperCase()}\n`;
        response += `   📅 ${task.deadline.toLocaleDateString('id-ID')}`;
        
        if (status === 'pending' && daysLeft >= 0) {
            response += ` (${daysLeft} hari lagi)`;
        } else if (status === 'overdue') {
            response += ` (⚠️ Terlambat ${Math.abs(daysLeft)} hari)`;
        }
        
        response += `\n   Status: ${status.toUpperCase()}\n\n`;
    });

    response += `Gunakan !todo detail [id] untuk melihat detail task.`;

    await message.reply(response);
}

// Menandai task selesai
async function markDone(message, args, userId) {
    if (args.length < 2) {
        return await message.reply('❌ Format salah!\n\nContoh: !todo done 1');
    }

    const taskId = parseInt(args[1]);
    const success = todoService.markTaskDone(userId, taskId);

    if (!success) {
        return await message.reply('❌ Task tidak ditemukan!');
    }

    await message.reply(`✅ Task #${taskId} berhasil ditandai selesai!`);
}

// Menghapus task
async function deleteTask(message, args, userId) {
    if (args.length < 2) {
        return await message.reply('❌ Format salah!\n\nContoh: !todo delete 1');
    }

    const taskId = parseInt(args[1]);
    const success = todoService.deleteTask(userId, taskId);

    if (!success) {
        return await message.reply('❌ Task tidak ditemukan!');
    }

    await message.reply(`🗑️ Task #${taskId} berhasil dihapus!`);
}

// Menampilkan task yang pending
async function listPendingTasks(message, userId) {
    const tasks = todoService.getPendingTasks(userId);

    if (tasks.length === 0) {
        return await message.reply('✨ Tidak ada task pending. Kerja bagus!');
    }

    let response = `⏳ *TASK PENDING*\n`;
    response += `Total: ${tasks.length} task\n\n`;

    tasks.forEach((task, index) => {
        const daysLeft = Math.ceil((task.deadline - new Date()) / (1000 * 60 * 60 * 24));
        response += `${index + 1}. *${task.title}*\n`;
        response += `   ID: ${task.id} | Prioritas: ${task.priority.toUpperCase()}\n`;
        response += `   📅 ${task.deadline.toLocaleDateString('id-ID')} (${daysLeft} hari lagi)\n\n`;
    });

    await message.reply(response);
}

// Menampilkan task yang overdue
async function listOverdueTasks(message, userId) {
    const tasks = todoService.getOverdueTasks(userId);

    if (tasks.length === 0) {
        return await message.reply('✅ Tidak ada task yang terlambat!');
    }

    let response = `⚠️ *TASK TERLAMBAT*\n`;
    response += `Total: ${tasks.length} task\n\n`;

    tasks.forEach((task, index) => {
        const daysLate = Math.abs(Math.ceil((task.deadline - new Date()) / (1000 * 60 * 60 * 24)));
        response += `${index + 1}. *${task.title}*\n`;
        response += `   ID: ${task.id} | Prioritas: ${task.priority.toUpperCase()}\n`;
        response += `   📅 ${task.deadline.toLocaleDateString('id-ID')} (Terlambat ${daysLate} hari)\n\n`;
    });

    await message.reply(response);
}

// Menampilkan detail task
async function taskDetail(message, args, userId) {
    if (args.length < 2) {
        return await message.reply('❌ Format salah!\n\nContoh: !todo detail 1');
    }

    const taskId = parseInt(args[1]);
    const task = todoService.getTaskById(userId, taskId);

    if (!task) {
        return await message.reply('❌ Task tidak ditemukan!');
    }

    const status = todoService.getTaskStatus(task);
    const daysLeft = Math.ceil((task.deadline - new Date()) / (1000 * 60 * 60 * 24));

    const priorityEmoji = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
    };

    let response = `📋 *DETAIL TASK*\n\n`;
    response += `🆔 *ID:* ${task.id}\n`;
    response += `📝 *Judul:* ${task.title}\n`;
    response += `📅 *Deadline:* ${task.deadline.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    response += `${priorityEmoji[task.priority]} *Prioritas:* ${task.priority.toUpperCase()}\n`;
    response += `📊 *Status:* ${status.toUpperCase()}\n`;
    
    if (status === 'pending' && daysLeft >= 0) {
        response += `⏰ *Sisa Waktu:* ${daysLeft} hari lagi\n`;
    } else if (status === 'overdue') {
        response += `⚠️ *Terlambat:* ${Math.abs(daysLeft)} hari\n`;
    }
    
    if (task.description) {
        response += `\n📄 *Deskripsi:*\n${task.description}\n`;
    }
    
    response += `\n🕐 *Dibuat:* ${task.createdAt.toLocaleDateString('id-ID')} ${task.createdAt.toLocaleTimeString('id-ID')}`;
    
    if (task.completedAt) {
        response += `\n✅ *Selesai:* ${task.completedAt.toLocaleDateString('id-ID')} ${task.completedAt.toLocaleTimeString('id-ID')}`;
    }

    await message.reply(response);
}

// Edit task
async function editTask(message, args, userId) {
    if (args.length < 2) {
        return await message.reply(
            '❌ Format salah!\n\n' +
            'Contoh:\n' +
            '!todo edit 1 | title | Judul Baru\n' +
            '!todo edit 1 | deadline | 2025-12-01\n' +
            '!todo edit 1 | priority | high\n' +
            '!todo edit 1 | description | Deskripsi baru'
        );
    }

    const taskId = parseInt(args[1]);
    const editData = args.slice(2).join(' ').split('|').map(s => s.trim());

    if (editData.length < 2) {
        return await message.reply('❌ Format salah! Gunakan: !todo edit [id] | [field] | [value]');
    }

    const field = editData[0].toLowerCase();
    const value = editData[1];

    const success = todoService.editTask(userId, taskId, field, value);

    if (!success) {
        return await message.reply('❌ Gagal mengedit task! Pastikan ID dan field benar.');
    }

    await message.reply(`✅ Task #${taskId} berhasil diupdate!\n\nGunakan !todo detail ${taskId} untuk melihat perubahan.`);
}

// Menampilkan help
async function showHelp(message) {
    const helpText = `
📋 *TODO LIST - HELP*

*Menambah Task:*
!todo add [judul] | [tanggal] | [prioritas] | [deskripsi]
Contoh: !todo add Meeting Client | 2025-11-01 | high | Presentasi Q4

*Melihat Task:*
!todo list - Semua task
!todo pending - Task yang belum selesai
!todo overdue - Task yang terlambat
!todo detail [id] - Detail task

*Mengelola Task:*
!todo done [id] - Tandai selesai
!todo delete [id] - Hapus task
!todo edit [id] | [field] | [value] - Edit task

*Field untuk edit:*
- title | Judul baru
- deadline | 2025-12-01
- priority | low/medium/high/urgent
- description | Deskripsi baru

*Prioritas:*
🟢 low - Prioritas rendah
🟡 medium - Prioritas sedang
🟠 high - Prioritas tinggi
🔴 urgent - Sangat mendesak

*Format Tanggal:* YYYY-MM-DD
Contoh: 2025-11-01
`;

    await message.reply(helpText);
}

module.exports = todoCommand;
