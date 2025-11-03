const fs = require('fs');
const path = require('path');

// Path untuk menyimpan data todo
const DATA_DIR = path.join(__dirname, '../../data');
const TODO_FILE = path.join(DATA_DIR, 'todos.json');

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inisialisasi file jika belum ada
if (!fs.existsSync(TODO_FILE)) {
    fs.writeFileSync(TODO_FILE, JSON.stringify({}));
}

/**
 * Membaca data todo dari file
 */
function loadTodos() {
    try {
        const data = fs.readFileSync(TODO_FILE, 'utf8');
        const todos = JSON.parse(data);
        
        // Convert tanggal dari string ke Date object
        Object.keys(todos).forEach(userId => {
            todos[userId] = todos[userId].map(task => ({
                ...task,
                deadline: new Date(task.deadline),
                createdAt: new Date(task.createdAt),
                completedAt: task.completedAt ? new Date(task.completedAt) : null
            }));
        });
        
        return todos;
    } catch (error) {
        console.error('Error loading todos:', error);
        return {};
    }
}

/**
 * Menyimpan data todo ke file
 */
function saveTodos(todos) {
    try {
        fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

/**
 * Generate ID unik untuk task
 */
function generateTaskId(userId, todos) {
    const userTasks = todos[userId] || [];
    if (userTasks.length === 0) return 1;
    return Math.max(...userTasks.map(t => t.id)) + 1;
}

/**
 * Menambahkan task baru
 */
function addTask(userId, taskData) {
    const todos = loadTodos();
    
    if (!todos[userId]) {
        todos[userId] = [];
    }
    
    const newTask = {
        id: generateTaskId(userId, todos),
        title: taskData.title,
        description: taskData.description || '',
        deadline: taskData.deadline,
        priority: taskData.priority || 'medium',
        status: 'pending',
        createdAt: new Date(),
        completedAt: null
    };
    
    todos[userId].push(newTask);
    saveTodos(todos);
    
    return newTask;
}

/**
 * Mendapatkan semua task user
 */
function getUserTasks(userId) {
    const todos = loadTodos();
    return todos[userId] || [];
}

/**
 * Mendapatkan task berdasarkan ID
 */
function getTaskById(userId, taskId) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    return userTasks.find(task => task.id === taskId);
}

/**
 * Menandai task sebagai selesai
 */
function markTaskDone(userId, taskId) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    const task = userTasks.find(t => t.id === taskId);
    
    if (!task) return false;
    
    task.status = 'done';
    task.completedAt = new Date();
    
    saveTodos(todos);
    return true;
}

/**
 * Menghapus task
 */
function deleteTask(userId, taskId) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    const taskIndex = userTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return false;
    
    userTasks.splice(taskIndex, 1);
    todos[userId] = userTasks;
    
    saveTodos(todos);
    return true;
}

/**
 * Mendapatkan task yang pending
 */
function getPendingTasks(userId) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    const now = new Date();
    
    return userTasks
        .filter(task => task.status === 'pending' && task.deadline >= now)
        .sort((a, b) => a.deadline - b.deadline);
}

/**
 * Mendapatkan task yang overdue
 */
function getOverdueTasks(userId) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    const now = new Date();
    
    return userTasks
        .filter(task => task.status === 'pending' && task.deadline < now)
        .sort((a, b) => a.deadline - b.deadline);
}

/**
 * Mendapatkan status task
 */
function getTaskStatus(task) {
    if (task.status === 'done') return 'done';
    
    const now = new Date();
    if (task.deadline < now) return 'overdue';
    
    return 'pending';
}

/**
 * Edit task
 */
function editTask(userId, taskId, field, value) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    const task = userTasks.find(t => t.id === taskId);
    
    if (!task) return false;
    
    switch (field) {
        case 'title':
        case 'judul':
            task.title = value;
            break;
        case 'deadline':
        case 'tanggal':
            const newDeadline = new Date(value);
            if (isNaN(newDeadline.getTime())) return false;
            task.deadline = newDeadline;
            break;
        case 'priority':
        case 'prioritas':
            const validPriorities = ['low', 'medium', 'high', 'urgent'];
            if (!validPriorities.includes(value.toLowerCase())) return false;
            task.priority = value.toLowerCase();
            break;
        case 'description':
        case 'deskripsi':
            task.description = value;
            break;
        default:
            return false;
    }
    
    saveTodos(todos);
    return true;
}

/**
 * Mendapatkan statistik task user
 */
function getUserStats(userId) {
    const todos = loadTodos();
    const userTasks = todos[userId] || [];
    
    const stats = {
        total: userTasks.length,
        done: userTasks.filter(t => t.status === 'done').length,
        pending: userTasks.filter(t => getTaskStatus(t) === 'pending').length,
        overdue: userTasks.filter(t => getTaskStatus(t) === 'overdue').length
    };
    
    return stats;
}

/**
 * Mendapatkan semua user ID yang memiliki todo
 */
function getAllUsers() {
    const todos = loadTodos();
    return Object.keys(todos);
}

module.exports = {
    addTask,
    getUserTasks,
    getTaskById,
    markTaskDone,
    deleteTask,
    getPendingTasks,
    getOverdueTasks,
    getTaskStatus,
    editTask,
    getUserStats,
    getAllUsers
};
