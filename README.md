# WhatsApp Bot

Bot WhatsApp sederhana menggunakan whatsapp-web.js dengan login QR Code.

## 📁 Struktur Folder

```
whatsapp-bot/
├── src/
│   ├── commands/              # Folder untuk semua command
│   │   ├── ping.js            # Command ping
│   │   ├── todo.js            # Command todo/task manager
│   │   ├── reminder.js        # Command reminder manual
│   │   └── uptime.js          # Command uptime/status bot
│   ├── handlers/              # Folder untuk handlers
│   │   └── commandHandler.js  # Main command router
│   ├── services/              # Folder untuk services
│   │   └── todoService.js     # Service untuk mengelola todo
│   └── schedulers/            # Folder untuk schedulers
│       └── reminderScheduler.js  # Auto reminder scheduler
├── data/                      # Folder penyimpanan data
│   └── todos.json             # Database todo list
├── index.js                   # File utama bot
├── package.json
└── README.md
```

## 🚀 Instalasi

1. Install dependencies:

```bash
npm install
```

2. Jalankan bot:

```bash
npm start
```

3. Scan QR code yang muncul di terminal dengan WhatsApp Anda:
   - Buka WhatsApp di HP
   - Tap Menu (titik tiga) > Perangkat Tertaut
   - Tap "Tautkan Perangkat"
   - Scan QR code di terminal

## 📝 Command yang Tersedia

### Basic Commands

| Command     | Deskripsi                                         |
| ----------- | ------------------------------------------------- |
| `!menu`     | Tampilkan menu utama dengan semua command         |
| `!help`     | Panduan lengkap cara menggunakan bot              |
| `!ping`     | Mengecek apakah bot aktif dan menampilkan latency |
| `!uptime`   | Lihat waktu hidup bot/server dan status sistem    |
| `!reminder` | Cek reminder manual untuk task mendatang          |

### 🔥 Fun Commands - Maki-Maki

| Command          | Deskripsi                                      |
| ---------------- | ---------------------------------------------- |
| `!maki [nama]`   | Maki-maki/ejek teman dengan lucu (70+ variasi) |
| `!maki @mention` | Tag orang dan bot akan mention balik saat maki |
| `!maki stats`    | Lihat statistik makian                         |
| `!maki reset`    | Reset history makian                           |

**Fitur Maki-Maki:**

- ✅ 70+ kata-kata makian lucu (Sunda & Indonesia)
- ✅ **Support Mention/Tag** - Tag orang dan bot akan tag balik! 🏷️
- ✅ Anti-duplicate system (tidak keluar berturut-turut)
- ✅ Random selection
- ✅ Progress tracking
- ✅ Auto-reset setelah semua terpakai

**Cara Pakai Mention:**

```
**Cara Pakai Mention:**

```

!maki @NamaOrang

```
Bot akan reply sambil mention orangnya! 🔥

### 🐱 Fun Commands - Neko (Anime)
| Command | Deskripsi                                         |
| ------- | ------------------------------------------------- |
| `!neko` | Kirim neko random dari API nekos.best |
| `!neko [kategori]` | Kirim gambar/GIF dari kategori tertentu |
| `!neko list` | Lihat semua kategori yang tersedia (46 kategori!) |
| `!neko help` | Bantuan neko command |

**Fitur Neko:**
- ✅ 4 kategori gambar PNG (husbando, kitsune, neko, waifu) 🖼️
- ✅ 42 kategori GIF animasi 🎬
- ✅ Dari API nekos.best
- ✅ Info artist & anime name
- ✅ Kualitas tinggi
- ✅ Random selection

**Contoh Penggunaan:**
```

!neko → Neko random
!neko hug → GIF pelukan
!neko pat → GIF elus-elus
!neko waifu → Gambar waifu
!neko kiss → GIF ciuman
!neko happy → GIF senang

```

**Kategori GIF Populer:**
hug, pat, kiss, cuddle, happy, smile, wink, cry, angry, sleep, dance, wave, highfive, thumbsup, dan masih banyak lagi!

---

### � Admin Commands - HideTag

| Command              | Deskripsi                                        |
| -------------------- | ------------------------------------------------ |
| `!hidetag [pesan]`   | Tag semua member grup dengan mention tersembunyi |
| `!tagall [pesan]`    | Alias untuk hidetag                              |

**Fitur HideTag:**

- ✅ Tag semua member grup secara hidden 👥
- ✅ Mention tidak terlihat di pesan 🔇
- ✅ **Support reply message** - Kirim ulang pesan yang di-reply 🔁
- ✅ Khusus untuk admin grup 👑
- ✅ Berguna untuk pengumuman penting 📢
- ✅ Hanya bisa digunakan di grup

**Cara Pakai:**

```

# Cara 1: Kirim pesan biasa dengan hidden tag

!hidetag Halo semua! Ada pengumuman penting
!tagall Meeting jam 3 sore ya guys

# Cara 2: Reply pesan + kirim ulang dengan hidden tag

1. Reply ke pesan yang mau di-broadcast
2. Ketik: !hidetag
3. Bot akan kirim ulang pesan itu + tag semua member (hidden)

# Cara 3: Reply pesan + tambah teks

1. Reply ke pesan
2. Ketik: !hidetag [teks tambahan]
3. Bot kirim pesan asli + teks tambahan + hidden tag

```

**Catatan:**

- ⚠️ Hanya admin grup yang bisa menggunakan command ini
- ⚠️ Command hanya bekerja di grup, tidak di private chat
- 📢 Semua member akan ter-mention tapi tidak terlihat

---

### �📋 Todo List - Project Reminder & Task Tracker

#### Menambah Task

```

!todo add [judul] | [tanggal] | [prioritas] | [deskripsi]

```

**Contoh:**

```

!todo add Meeting Client | 2025-11-01 | high | Presentasi Q4
!todo add Belajar JavaScript | 2025-11-15 | medium

```

#### Melihat Task

| Command             | Deskripsi               |
| ------------------- | ----------------------- |
| `!todo list`        | Semua task              |
| `!todo pending`     | Task yang belum selesai |
| `!todo overdue`     | Task yang terlambat     |
| `!todo detail [id]` | Detail task spesifik    |

#### Mengelola Task

| Command                                 | Deskripsi           |
| --------------------------------------- | ------------------- |
| `!todo done [id]`                       | Tandai task selesai |
| `!todo delete [id]`                     | Hapus task          |
| `!todo edit [id] \| [field] \| [value]` | Edit task           |

**Contoh Edit:**

```

!todo edit 1 | title | Judul Baru
!todo edit 1 | deadline | 2025-12-01
!todo edit 1 | priority | urgent
!todo edit 1 | description | Deskripsi baru

```

#### Prioritas Task

- 🟢 **low** - Prioritas rendah
- 🟡 **medium** - Prioritas sedang (default)
- 🟠 **high** - Prioritas tinggi
- 🔴 **urgent** - Sangat mendesak

#### Format Tanggal

Gunakan format: `YYYY-MM-DD`

- Contoh: `2025-11-01` untuk 1 November 2025

## 💡 Cara Menambahkan Command Baru

1. Buat file baru di folder `src/commands/`, contoh: `hello.js`
2. Tulis fungsi command di file tersebut
3. Tambahkan case baru di `src/handlers/commandHandler.js`

## 🔧 Konfigurasi

Bot ini menggunakan:

- **Prefix**: `!` (bisa diubah di commandHandler.js)
- **Auth Strategy**: LocalAuth (sesi tersimpan otomatis)

## 📦 Dependencies

- `whatsapp-web.js`: Library untuk berinteraksi dengan WhatsApp Web
- `qrcode-terminal`: Menampilkan QR code di terminal

## 💾 Penyimpanan Data

- Data todo list disimpan dalam file JSON di folder `data/`
- Setiap user memiliki data terpisah
- Data tersimpan secara persistent dan tidak hilang saat bot restart

## 🎯 Fitur Todo List

✅ **Fitur Lengkap:**

- Simpan task dengan judul, deadline, prioritas, dan deskripsi
- Tracking status task (pending, done, overdue)
- Notifikasi task yang terlambat
- Edit task yang sudah dibuat
- Filter task berdasarkan status
- Detail informasi setiap task
- Perhitungan sisa waktu otomatis
- Sistem prioritas 4 level

## ⚠️ Catatan

- Pastikan WhatsApp Anda terhubung ke internet
- Jangan logout dari perangkat tertaut agar bot tetap aktif
- Session akan tersimpan di folder `.wwebjs_auth`
```
