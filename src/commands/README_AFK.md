# 🌙 Fitur AFK (Away From Keyboard)

## Deskripsi
Fitur AFK memungkinkan user untuk mengatur status "sedang tidak ada" dengan alasan tertentu. Bot akan otomatis memberitahu orang lain yang mencoba menghubungi user tersebut.

## Cara Penggunaan

### 1. Mengaktifkan AFK
```
!afk [alasan]
```
**Contoh:**
- `!afk Sedang makan`
- `!afk Meeting penting`
- `!afk` (tanpa alasan)

### 2. Menonaktifkan AFK
```
!afk off
```
atau
```
!afk disable
```

**Atau otomatis:**
- Kirim pesan apa saja dan bot akan otomatis menonaktifkan AFK

## Fitur

### ✅ Auto-Reply saat di-Tag
Ketika user yang sedang AFK di-tag/mention di grup:
```
💤 User sedang AFK

👤 User: @628xxx
📝 Alasan: Sedang makan
⏱️ Sudah AFK selama: 15 menit, 30 detik
🕒 Sejak: 05/11/2025 14:30:00
```

### ✅ Auto-Reply saat di-Reply
Ketika seseorang membalas pesan dari user yang sedang AFK:
```
💤 User sedang AFK

👤 User: @628xxx
📝 Alasan: Meeting penting
⏱️ Sudah AFK selama: 1 jam, 5 menit
🕒 Sejak: 05/11/2025 13:25:00
```

### ✅ Welcome Back Notification
Ketika user AFK kembali aktif (mengirim pesan):
```
👋 Welcome Back!

@628xxx sudah tidak AFK lagi!

⏱️ Durasi AFK: 2 jam, 15 menit, 45 detik
🕒 Sejak: 05/11/2025 12:15:00
📝 Alasan sebelumnya: Sedang istirahat
```

## Informasi Teknis

### Storage
- Data AFK disimpan di memory (Map)
- Data akan hilang jika bot di-restart
- Setiap user memiliki satu status AFK

### Timezone
- Menggunakan timezone Asia/Jakarta (WIB)
- Format waktu: DD/MM/YYYY HH:mm:ss

### Format Durasi
- Menampilkan jam, menit, dan detik
- Contoh: "2 jam, 15 menit, 30 detik"
- Otomatis menyesuaikan (tidak menampilkan 0 jam jika kurang dari 1 jam)

## Alias Command
- `!afk`
- `!away`

## Kategori
Utility

## Update Log
- **v1.0.0** (05/11/2025)
  - ✅ Fitur set AFK dengan alasan
  - ✅ Auto-reply saat di-tag di grup
  - ✅ Auto-reply saat pesan di-reply
  - ✅ Auto-detect aktif kembali
  - ✅ Notifikasi durasi AFK
  - ✅ Format waktu Indonesia

## Known Limitations
- Data AFK tidak persistent (hilang saat restart)
- Hanya support WhatsApp Web.js library
- Tidak ada limit waktu AFK

## Future Enhancements
- [ ] Persistent storage (simpan ke JSON file)
- [ ] Maksimal waktu AFK
- [ ] Statistik AFK (berapa kali AFK, total durasi, dll)
- [ ] Custom timezone per user
- [ ] AFK schedule (auto AFK di waktu tertentu)
