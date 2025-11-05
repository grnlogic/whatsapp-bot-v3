# Gemini AI Chatbot Integration

## Overview

Fitur Gemini AI Chatbot telah ditambahkan ke WhatsApp Bot dengan kemampuan:

- Chat natural dengan AI menggunakan Google Gemini 2.0 Flash-Lite
- Session management per user dengan auto-reset 12 jam
- Support grup dan personal chat dengan mention otomatis
- Penyimpanan riwayat percakapan

## Konfigurasi

### API Key

API Key Gemini sudah dikonfigurasi:

```
AIzaSyDhe_9sj0X-igJuPk3R9Xv9msaxoBoAZUI
```

### Model

Menggunakan **Gemini 2.0 Flash-Lite** dengan fallback ke model lain jika terjadi quota limit:

- Primary: `gemini-2.0-flash-lite`
- Fallback: `gemini-1.5-flash`, `gemini-pro`, `gemini-1.0-pro`

### Session Timeout

- Default: 12 jam
- Auto cleanup: Setiap 1 jam
- Maksimal history: 50 pesan per session

## Commands

### Basic Chat

```
!gemini <pesan>     - Chat dengan AI
!ai <pesan>         - Alias untuk gemini
!chat <pesan>       - Alias lain
!ask <pesan>        - Alias lain
!tanya <pesan>      - Alias bahasa Indonesia
```

### Session Management

```
!gemini reset       - Reset session percakapan
!gemini clear       - Alias untuk reset
!gemini restart     - Alias untuk reset
```

### Statistics

```
!gemini stats       - Lihat statistik penggunaan
!gemini status      - Alias untuk stats
```

### Help

```
!gemini             - Tampilkan bantuan
```

## Fitur Utama

### 1. Session Management

- Setiap user memiliki session terpisah
- Session otomatis reset setelah 12 jam tidak aktif
- Riwayat percakapan tersimpan dalam session
- Memory limit 50 pesan terakhir per session

### 2. Context Awareness

- AI mengingat percakapan sebelumnya dalam session
- Context 10 pesan terakhir untuk response yang relevant
- Personalisasi dengan nama user

### 3. Group Support

- Otomatis mention user di grup: `@Username response...`
- Personal chat tanpa mention
- Context berbeda untuk grup dan personal

### 4. Error Handling

- Graceful handling untuk berbagai error
- Fallback response jika API bermasalah
- Logging detail untuk debugging

## Contoh Penggunaan

### Personal Chat

```
User: !gemini Halo, apa kabar?
Bot: Halo! Kabar saya baik, terima kasih 😊 Bagaimana dengan kamu? Ada yang bisa saya bantu hari ini?

User: !ai Jelaskan tentang AI
Bot: Artificial Intelligence (AI) adalah teknologi yang memungkinkan mesin untuk...
```

### Group Chat

```
User: !gemini Siapa presiden Indonesia?
Bot: @Username Presiden Indonesia saat ini adalah Joko Widodo (Jokowi) 🇮🇩 Beliau menjabat sejak 2014...

User: !gemini reset
Bot: @Username ✅ Session chat dengan Gemini sudah direset! 🔄
```

## Files Structure

```
src/
├── services/
│   └── geminiService.js      # Core Gemini service
├── commands/
│   └── gemini.js            # Command handlers
└── handlers/
    └── commandHandler.js    # Updated with Gemini routes
```

## Technical Details

### GeminiService Class

- Singleton pattern untuk efficiency
- In-memory session storage dengan Map()
- Automatic cleanup dengan setInterval()
- Configurable timeout dan limits

### Session Object

```javascript
{
    userId: string,           // Phone number
    userName: string,         // Display name
    chatHistory: Array,       // Message history
    createdAt: timestamp,     // Session creation
    lastActivity: timestamp,  // Last message time
    messageCount: number      // Total messages in session
}
```

### Chat History Entry

```javascript
{
    userMessage: string,      // User input
    aiResponse: string,       // AI response
    timestamp: number,        // Message time
    isGroup: boolean         // Group context flag
}
```

## Configuration Options

### Gemini Model Settings

```javascript
generationConfig: {
    temperature: 0.9,         // Creativity level
    topK: 1,                 // Token selection
    topP: 1,                 // Nucleus sampling
    maxOutputTokens: 2048,   // Max response length
}
```

### Service Settings

```javascript
sessionTimeout: 12 * 60 * 60 * 1000,  // 12 hours
maxHistoryMessages: 50,                 // Per session
contextMessages: 10,                    // For AI context
cleanupInterval: 60 * 60 * 1000,       // 1 hour
```

## Monitoring

### Logs

- Session creation/deletion
- Message processing
- Error handling
- Cleanup activities

### Statistics Available

- Active sessions count
- Total messages processed
- Session timeout configuration

## Security & Rate Limiting

### API Key Security

- API key di-hardcode (sesuai permintaan)
- Error handling untuk quota issues
- Graceful degradation saat service bermasalah

### Memory Management

- Automatic session cleanup
- History message limiting
- Regular garbage collection

## Future Enhancements

### Potential Additions

- Persistent storage (database)
- User preferences
- Command customization
- Advanced analytics
- Multi-language support
- Image analysis capability

### Scaling Considerations

- Database integration untuk session persistence
- Redis untuk distributed sessions
- Rate limiting per user
- Admin controls untuk manage sessions

## Troubleshooting

### Common Issues

1. **API Quota Exceeded**: Tunggu beberapa menit
2. **Session Lost**: Gunakan `!gemini reset`
3. **Slow Response**: Cek koneksi internet
4. **Memory Issues**: Restart bot untuk cleanup

### Debug Commands

```
!gemini stats    # Cek statistik penggunaan
!info           # Cek system info
!uptime         # Cek uptime bot
```

## Credits

- **AI Provider**: Google Gemini 2.0 Flash-Lite
- **Integration**: Custom implementation
- **Session Management**: In-memory dengan auto-cleanup
- **WhatsApp Client**: whatsapp-web.js
