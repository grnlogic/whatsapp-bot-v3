# NSFW Commands

⚠️ **WARNING: This folder contains adult content (18+) commands**

## Configuration

Edit `nsfwConfig.js` to manage access control:

### NSFW Modes:

- `disabled` - Semua command NSFW tidak dapat diakses (default)
- `whitelist` - Hanya user/grup dalam whitelist yang bisa akses
- `admin_only` - Hanya admin grup yang bisa akses
- `blacklist` - Semua bisa akses kecuali yang di-blacklist

### Setup:

1. **Enable NSFW** - Ubah `NSFW_MODE` di `nsfwConfig.js`
2. **Whitelist User** - Tambahkan nomor ke `NSFW_WHITELIST`
3. **Whitelist Group** - Tambahkan group ID ke `NSFW_ALLOWED_GROUPS`

## Commands Available:

- `/nekopoi <url>` - Download dari Nekopoi (18+)
- `/nhentai <code>` - Get nhentai doujin info (18+)

## Important Notes:

⚠️ **Legal Disclaimer:**

- Konten ini hanya untuk pengguna dewasa (18+)
- Penggunaan konten ini adalah tanggung jawab pengguna
- Pastikan mematuhi hukum setempat

🔒 **Security:**

- Gunakan sistem whitelist untuk kontrol ketat
- Monitor penggunaan command ini
- Jangan aktifkan di grup publik

## Example Configuration:

```javascript
// nsfwConfig.js

const NSFW_MODE = "whitelist"; // Enable with whitelist

const NSFW_WHITELIST = [
  "628123456789@c.us", // Add trusted users
];

const NSFW_ALLOWED_GROUPS = [
  "1234567890-1234567890@g.us", // Private group only
];
```
