# 🎉 CHANGELOG - Fitur AFK

## Tanggal: 05 November 2025

### ✨ FITUR BARU: AFK (Away From Keyboard)

#### 📝 Perubahan File

**File Baru:**

1. `src/commands/afk.js` - Command handler untuk fitur AFK
2. `src/commands/README_AFK.md` - Dokumentasi lengkap fitur AFK
3. `test_afk.js` - Test file dan contoh penggunaan

**File yang Dimodifikasi:**

1. `index.js` - Menambahkan handler AFK pada message listener
2. `src/handlers/commandHandler.js` - Menambahkan routing untuk command !afk
3. `src/commands/menu.js` - Menambahkan info command AFK di menu
4. `package.json` - Menambahkan dependency moment-timezone

#### 🚀 Fitur yang Ditambahkan

**1. Set Status AFK**

```
!afk [alasan]
!afk           (tanpa alasan)
```

- User dapat mengatur status AFK dengan alasan opsional
- Bot akan menyimpan waktu mulai AFK
- Menampilkan konfirmasi AFK telah diaktifkan

**2. Auto-Reply saat Di-Tag**

- Bot otomatis membalas ketika user yang AFK di-tag/mention di grup
- Menampilkan:
  - Nama user yang AFK
  - Alasan AFK
  - Durasi sudah AFK
  - Waktu mulai AFK

**3. Auto-Reply saat Di-Reply**

- Bot otomatis membalas ketika pesan dari user AFK di-reply
- Menampilkan informasi yang sama seperti saat di-tag

**4. Auto-Detect Kembali Aktif**

- Bot otomatis mendeteksi saat user AFK mengirim pesan
- Menonaktifkan status AFK secara otomatis
- Menampilkan welcome back message dengan:
  - Total durasi AFK
  - Waktu mulai AFK
  - Alasan AFK sebelumnya

**5. Manual Nonaktifkan AFK**

```
!afk off
!afk disable
```

- User dapat menonaktifkan AFK secara manual
- Menampilkan total durasi AFK

#### 🛠️ Teknologi yang Digunakan

**Dependencies Baru:**

- `moment-timezone` - Untuk format waktu Indonesia (WIB)

**Fitur Teknis:**

- In-memory storage menggunakan Map
- Timezone: Asia/Jakarta (WIB)
- Format waktu: DD/MM/YYYY HH:mm:ss
- Format durasi: jam, menit, detik

#### 📊 Workflow

```
1. User mengaktifkan AFK
   ↓
2. Bot menyimpan data AFK (alasan, timestamp, waktu)
   ↓
3. Saat ada yang mention/reply user AFK:
   → Bot mengirim notifikasi otomatis
   ↓
4. Saat user AFK mengirim pesan:
   → Bot mendeteksi user aktif kembali
   → Bot menghapus status AFK
   → Bot mengirim welcome back message
```

#### 🎯 Command Aliases

**Mengaktifkan AFK:**

- `!afk`
- `!away`

**Menonaktifkan AFK:**

- `!afk off`
- `!afk disable`
- `!away off`
- `!away disable`
- Otomatis saat mengirim pesan apa saja

#### 📱 Contoh Penggunaan

**Mengaktifkan:**

```
User: !afk Sedang makan siang
Bot: 🌙 AFK Mode Diaktifkan
     📝 Alasan: Sedang makan siang
     🕒 Waktu: 05/11/2025 14:30:00
```

**Saat Di-Tag:**

```
UserB: @UserA halo ada info?
Bot: 💤 User sedang AFK
     👤 User: @628xxx
     📝 Alasan: Sedang makan siang
     ⏱️ Sudah AFK selama: 15 menit, 30 detik
     🕒 Sejak: 05/11/2025 14:30:00
```

**Welcome Back:**

```
User: [mengirim pesan]
Bot: 👋 Welcome Back!
     @628xxx sudah tidak AFK lagi!
     ⏱️ Durasi AFK: 1 jam, 25 menit, 15 detik
     🕒 Sejak: 05/11/2025 13:05:00
     📝 Alasan sebelumnya: Sedang makan siang
```

#### ⚠️ Known Limitations

1. **Data tidak persistent**

   - Data AFK disimpan di memory
   - Akan hilang jika bot di-restart

2. **Satu status AFK per user**

   - User hanya bisa memiliki satu status AFK aktif

3. **Tidak ada limit waktu**
   - Tidak ada batas maksimal durasi AFK

#### 🔮 Future Enhancements

- [ ] Persistent storage (simpan ke file JSON)
- [ ] Maksimal waktu AFK
- [ ] Statistik AFK (total kali AFK, durasi, dll)
- [ ] Custom timezone per user
- [ ] AFK schedule (auto AFK di waktu tertentu)
- [ ] AFK history

#### 📚 Dokumentasi

Dokumentasi lengkap tersedia di:

- `src/commands/README_AFK.md` - Dokumentasi fitur
- `test_afk.js` - Contoh penggunaan dan test cases

#### 🎨 UI/UX

Semua pesan menggunakan emoji dan formatting untuk:

- Lebih mudah dibaca
- Lebih menarik secara visual
- Informasi lebih jelas dan terstruktur

#### 🔧 Instalasi

```bash
# Install dependency baru
npm install moment-timezone

# Restart bot
npm start
```

#### ✅ Testing

Fitur sudah ditest untuk:

- ✅ Set AFK dengan alasan
- ✅ Set AFK tanpa alasan
- ✅ Auto-reply saat di-tag di grup
- ✅ Auto-reply saat pesan di-reply
- ✅ Auto-detect aktif kembali
- ✅ Manual nonaktifkan AFK
- ✅ Format durasi waktu
- ✅ Format waktu Indonesia

---

**Dibuat oleh:** GitHub Copilot  
**Tanggal:** 05 November 2025  
**Versi:** 1.0.0
