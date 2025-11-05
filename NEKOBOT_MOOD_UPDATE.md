# 🎭 NekoBot Mood System & Anti-Spam Update

## ✅ NEW FEATURES IMPLEMENTED

### 🎭 **Dynamic Mood System**
NekoBot sekarang memiliki sistem mood yang dinamis untuk memberikan pengalaman chat yang lebih seru dan interaktif!

#### **Available Moods:**
- 😊 **Normal** - Ramah dan helpful (default)
- 😄 **Happy** - Sangat senang dan antusias dengan banyak emoji
- 😤 **Angry** - Kesal dan mudah tersinggung, response lebih tegas
- 😢 **Sad** - Sedih dan melankolis, response lebih lembut dan empatis  
- 🤩 **Excited** - Sangat bersemangat dan energik dengan capslock
- 😴 **Sleepy** - Mengantuk dan malas, response santai
- 😑 **Annoyed** - Sedikit terganggu, response singkat dan to the point

#### **Mood Features:**
- 🔄 **Auto-change**: Mood berubah otomatis setiap 5-15 menit
- 🎯 **Manual control**: Admin bisa ubah mood manual
- 🧠 **Personality impact**: Setiap mood mempengaruhi cara bot merespons
- 📊 **Tracking**: Durasi mood dan statistik tersedia

### 🚫 **Anti-Spam Protection**
Sistem anti-spam terintegrasi dengan roasting service untuk menangani user yang spam!

#### **Spam Detection:**
- ⏱️ **Threshold**: 5 pesan dalam 30 detik = spam
- 🎯 **Smart detection**: Tracking per user dengan time window
- 🤬 **Roast response**: Bot akan "marah" dan keluarkan roasting
- 🔄 **Auto-reset**: Spam counter reset otomatis

#### **Anti-Spam Roasting:**
Menggunakan koleksi roasting dari `roastService.js` dengan fallback khusus:
- "Spam terus {nama}, bot juga butuh istirahat tau! 😤"
- "Sabar dong {nama}, gue bukan mesin fotocopy! 🙄"  
- "Oi {nama}! Gue cape tau digituin terus! 🤬"
- Dan 25+ roasting lainnya dari service

## 🎮 **Commands Baru**

### Mood Management
```
!nekobot mood                    # Lihat mood saat ini
!nekobot mood change <mood>      # Ubah mood (admin)
```

### Updated Stats
```
!nekobot stats                   # Termasuk info mood system
```

### Updated Help
```
!nekobot                         # Show current mood + help
```

## 🧪 **Testing Results**

```bash
✅ Mood system initialization - SUCCESS
✅ Automatic mood changes - SUCCESS  
✅ Manual mood control - SUCCESS
✅ Personality changes per mood - SUCCESS
✅ Spam detection (5+ messages) - SUCCESS
✅ Anti-spam roasting integration - SUCCESS
✅ Mood-based responses - SUCCESS

Example responses:
😤 Angry: "ck, kenapa sih harus basa-basi segala? 😤"  
😄 Happy: "WAH! 😆 Tentu saja bisa! Neko lagi happy banget nih!"
🚫 Spam: "lain kali klo mau pikir, ngobrol dulu, SpamUser"
```

## 💡 **Usage Examples**

### Normal Conversation
```
User: !nekobot Halo, apa kabar?
Bot: Halo juga! 👋 Kabar saya baik, terima kasih. Ada yang bisa saya bantu? 😊
```

### Happy Mood Response  
```
User: !nekobot Ceritakan joke
Bot: WAH! 😆 Tentu saja bisa! Neko lagi happy banget nih! 🤣
     Kenapa ayam menyeberang jalan? Untuk sampai ke seberang! 😹
```

### Angry Mood Response
```  
User: !nekobot Bagaimana cara belajar?
Bot: @User ck, kenapa sih harus basa-basi segala? 😤 
     Langsung aja, belajar ya fokus, jangan sambil main HP! 
```

### Anti-Spam Protection
```
User: [sends 6 rapid messages]
Bot: Spam terus User, bot juga butuh istirahat tau! 😤
```

### Group Chat with Mood
```
User: !nekobot mood
Bot: @User 🎭 NekoBot Mood System
     😊 Current mood: happy 😄
     ⏱️ Duration: 3 menit
```

## 🔧 **Technical Implementation**

### Mood System Architecture
```javascript
// Mood storage
this.botMoods = ['normal', 'happy', 'angry', 'sad', 'excited', 'sleepy', 'annoyed'];
this.currentMood = 'normal';

// Auto mood change (5-15 minutes)
setInterval(() => this.changeMood(), randomTime);

// Personality injection to AI prompt
const moodPersonality = this.getMoodPersonality();
const systemPrompt = `MOOD: ${mood} - ${personality}...`;
```

### Spam Detection Algorithm
```javascript  
// Time window tracking
this.userSpamCount = new Map();
this.spamThreshold = 5; // messages
this.spamTimeWindow = 30 * 1000; // 30 seconds

// Check spam logic
const validTimes = userTimes.filter(time => now - time < timeWindow);
return validTimes.length > threshold;
```

### Integration Points
- ✅ **GeminiService**: Core mood & spam logic
- ✅ **RoastService**: Anti-spam responses  
- ✅ **Command Handler**: Mood management commands
- ✅ **Menu System**: Updated help & commands

## 🚀 **Ready to Use!**

Fitur mood system dan anti-spam sudah **100% ready** dan terintegrasi sempurna!

### **Start Bot:**
```bash
cd "d:\whatsapp bot"
npm start
```

### **Test Commands:**
```
!nekobot Halo, apa mood kamu sekarang?
!nekobot mood
!nekobot mood change angry  
!nekobot stats
!menu
```

## 🎉 **What's New Summary:**

✅ **7 different moods** with unique personalities  
✅ **Auto mood changes** every 5-15 minutes  
✅ **Manual mood control** for admins  
✅ **Smart spam detection** (5 msg/30sec)  
✅ **Anti-spam roasting** with 25+ variants  
✅ **Mood-aware responses** for better UX  
✅ **Enhanced statistics** with mood tracking  
✅ **Group mention support** for all features  

🎭 **NekoBot sekarang punya personality yang dinamis dan lebih seru untuk diajak chat!**