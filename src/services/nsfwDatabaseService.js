const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/nsfw_users.json');

// Inisialisasi database jika belum ada
async function initDatabase() {
    try {
        await fs.access(DB_PATH);
    } catch (error) {
        const initialData = {
            pending: [],
            approved: [],
            rejected: []
        };
        await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

// Baca database
async function readDatabase() {
    await initDatabase();
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Simpan database
async function saveDatabase(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Cek apakah user sudah terdaftar (di status manapun)
async function isUserRegistered(userId) {
    const db = await readDatabase();
    const allUsers = [...db.pending, ...db.approved, ...db.rejected];
    return allUsers.find(u => u.id === userId);
}

// Cek apakah user sudah diapprove
async function isUserApproved(userId) {
    const db = await readDatabase();
    return db.approved.find(u => u.id === userId);
}

// Register user baru (status: pending)
async function registerUser(userId, name, registeredFrom) {
    const db = await readDatabase();
    
    // Cek apakah sudah terdaftar
    const existing = await isUserRegistered(userId);
    if (existing) {
        return { success: false, message: 'User sudah terdaftar', status: existing.status };
    }
    
    const newUser = {
        id: userId,
        name: name,
        registeredAt: new Date().toISOString(),
        registeredFrom: registeredFrom,
        status: 'pending'
    };
    
    db.pending.push(newUser);
    await saveDatabase(db);
    
    return { success: true, message: 'Registrasi berhasil, menunggu verifikasi admin', user: newUser };
}

// Approve user (pindah dari pending ke approved)
async function approveUser(userId, approvedBy) {
    const db = await readDatabase();
    
    // Cari di pending
    const pendingIndex = db.pending.findIndex(u => u.id === userId);
    if (pendingIndex === -1) {
        // Cek apakah sudah approved
        const alreadyApproved = db.approved.find(u => u.id === userId);
        if (alreadyApproved) {
            return { success: false, message: 'User sudah diapprove sebelumnya' };
        }
        return { success: false, message: 'User tidak ditemukan di pending list' };
    }
    
    // Pindah dari pending ke approved
    const user = db.pending.splice(pendingIndex, 1)[0];
    user.status = 'approved';
    user.approvedAt = new Date().toISOString();
    user.approvedBy = approvedBy;
    
    db.approved.push(user);
    await saveDatabase(db);
    
    return { success: true, message: 'User berhasil diapprove', user };
}

// Reject user (pindah dari pending ke rejected)
async function rejectUser(userId, rejectedBy, reason) {
    const db = await readDatabase();
    
    const pendingIndex = db.pending.findIndex(u => u.id === userId);
    if (pendingIndex === -1) {
        return { success: false, message: 'User tidak ditemukan di pending list' };
    }
    
    const user = db.pending.splice(pendingIndex, 1)[0];
    user.status = 'rejected';
    user.rejectedAt = new Date().toISOString();
    user.rejectedBy = rejectedBy;
    user.reason = reason || 'No reason provided';
    
    db.rejected.push(user);
    await saveDatabase(db);
    
    return { success: true, message: 'User berhasil direject', user };
}

// Hapus user dari approved list
async function removeUser(userId, removedBy) {
    const db = await readDatabase();
    
    const approvedIndex = db.approved.findIndex(u => u.id === userId);
    if (approvedIndex === -1) {
        return { success: false, message: 'User tidak ditemukan di approved list' };
    }
    
    const user = db.approved.splice(approvedIndex, 1)[0];
    await saveDatabase(db);
    
    return { success: true, message: 'User berhasil dihapus dari approved list', user };
}

// Get semua pending users
async function getPendingUsers() {
    const db = await readDatabase();
    return db.pending;
}

// Get semua approved users
async function getApprovedUsers() {
    const db = await readDatabase();
    return db.approved;
}

// Get semua rejected users
async function getRejectedUsers() {
    const db = await readDatabase();
    return db.rejected;
}

// Get stats
async function getStats() {
    const db = await readDatabase();
    return {
        pending: db.pending.length,
        approved: db.approved.length,
        rejected: db.rejected.length,
        total: db.pending.length + db.approved.length + db.rejected.length
    };
}

module.exports = {
    isUserRegistered,
    isUserApproved,
    registerUser,
    approveUser,
    rejectUser,
    removeUser,
    getPendingUsers,
    getApprovedUsers,
    getRejectedUsers,
    getStats
};
