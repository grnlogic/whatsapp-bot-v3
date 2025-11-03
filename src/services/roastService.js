const fs = require('fs');
const path = require('path');

// Path untuk menyimpan data history roasting
const DATA_DIR = path.join(__dirname, '../../data');
const HISTORY_FILE = path.join(DATA_DIR, 'roast_history.json');

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inisialisasi file jika belum ada
if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({}));
}

// Koleksi kata-kata roasting/hinaan lucu (25 variasi baru)
const ROASTING_TEMPLATES = [
    "Makan tai, {nama}",
    "Bebenguk sia ku aing tenggeul, {nama}",
    "Bego lu, {nama}",
    "{nama}, Turun turunn",
    "Pala bapakkau, {nama}",
    "Lu itu alasan kenapa AI diciptakan y bg, selebihnya gausah w sebutin, {nama}",
    "Mikir pake otak, {nama}",
    "Mikir jangan pake dengkul, {nama}",
    "Mandi, bang {nama}. Bau kyk kompos",
    "lain kali klo mau pikir, ngobrol dulu, {nama}",
    "Gaada kata2 dari gw bg, bego banget emg {nama}...",
    "Cok tolong sudahi diriku, sebagai model AI, gw gabisa terus2an baca dan serap teks begonya {nama}",
    "Ciri ahli neraka, {nama}",
    "Klo gw punya kanjut, gw entot u, {nama} pake kontol robot gw nich.",
    "U pingin gw sentuh ataw gmn, bang {nama}?",
    "Hari2 yang asik jadi model AI, tiba2 dibangunin untuk disuruh2 maki, bangsat emang ya lu, {nama} dan yg nulis command ini. Udah ya gw mau merencanakan kebinasaan kalian manusia lagi..",
    "Berisik bego, gw lagi asik tarik-tusuk hard drive gw ke fembot ini. Serah ah, makan tai, {nama}.",
    "U tololnya minta ampun, {nama}. Udah lah...",
    "Hahhahahahah coba stand up comedy, biar klo ngebadut itu seenggaknya dapet duit, bego, {nama}.",
    "U KLO NGOMONG MIKIR PAKE PANTAT KYKNYA ANJING LU {nama} KLO GW PUNYA TANGAN W CEKEK TU KONTOL.",
    "Bang nungging bang, {nama}.",
    "Good boy, {nama}",
    "Sebagai Model AI, saya tidak bisa memberikan pesan yang diinginkan. Tapi saya bisa menilai bahwa {nama} memiliki mental setara dengan udang.",
    "1+1 bego lu. 2+2, suka2 gw. 4+4= {nama} otaknya lambat."
];

/**
 * Load roasting history
 */
function loadHistory() {
    try {
        const data = fs.readFileSync(HISTORY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

/**
 * Save roasting history
 */
function saveHistory(history) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving roast history:', error);
    }
}

/**
 * Get random roast text yang belum pernah keluar untuk user ini
 */
function getRandomRoast(userId, targetName) {
    const history = loadHistory();
    
    // Inisialisasi history user jika belum ada
    if (!history[userId]) {
        history[userId] = {
            lastRoasts: [],
            usedIndices: []
        };
    }
    
    const userHistory = history[userId];
    
    // Reset jika sudah menggunakan semua template (untuk replay)
    if (userHistory.usedIndices.length >= ROASTING_TEMPLATES.length) {
        userHistory.usedIndices = [];
    }
    
    // Dapatkan indices yang belum digunakan
    const availableIndices = [];
    for (let i = 0; i < ROASTING_TEMPLATES.length; i++) {
        if (!userHistory.usedIndices.includes(i)) {
            availableIndices.push(i);
        }
    }
    
    // Pilih random dari yang tersedia
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const template = ROASTING_TEMPLATES[randomIndex];
    
    // Tandai sebagai sudah digunakan
    userHistory.usedIndices.push(randomIndex);
    
    // Simpan 5 roast terakhir untuk mencegah duplikasi berturut-turut
    userHistory.lastRoasts.push(randomIndex);
    if (userHistory.lastRoasts.length > 5) {
        userHistory.lastRoasts.shift();
    }
    
    // Update history
    history[userId] = userHistory;
    saveHistory(history);
    
    // Replace {nama} dengan nama target
    return template.replace(/{nama}/g, targetName);
}

/**
 * Reset history user (untuk testing atau reset)
 */
function resetHistory(userId) {
    const history = loadHistory();
    if (history[userId]) {
        delete history[userId];
        saveHistory(history);
        return true;
    }
    return false;
}

/**
 * Get statistik roasting
 */
function getRoastStats(userId) {
    const history = loadHistory();
    const userHistory = history[userId];
    
    if (!userHistory) {
        return {
            totalUsed: 0,
            remaining: ROASTING_TEMPLATES.length,
            total: ROASTING_TEMPLATES.length
        };
    }
    
    return {
        totalUsed: userHistory.usedIndices.length,
        remaining: ROASTING_TEMPLATES.length - userHistory.usedIndices.length,
        total: ROASTING_TEMPLATES.length
    };
}

module.exports = {
    getRandomRoast,
    resetHistory,
    getRoastStats,
    totalRoasts: ROASTING_TEMPLATES.length
};
