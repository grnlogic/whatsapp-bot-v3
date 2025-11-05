// Test untuk Natural Mood System
const geminiService = require('./src/services/geminiService');

async function testNaturalMood() {
    console.log('🧪 Testing Natural Mood System...\n');
    
    try {
        // Test 1: Check initial mood
        console.log('Test 1: Check initial mood');
        let stats = geminiService.getSessionStats();
        console.log(`Current mood: ${stats.currentMood} ${stats.moodEmoji}`);
        console.log(`Mood duration: ${stats.moodDuration}`);
        console.log('');
        
        // Test 2: Simulate automatic mood change
        console.log('Test 2: Triggering automatic mood change');
        geminiService.changeMood(); // This should be the only way to change mood
        stats = geminiService.getSessionStats();
        console.log(`New mood: ${stats.currentMood} ${stats.moodEmoji}`);
        console.log('');
        
        // Test 3: Chat with current mood
        console.log('Test 3: Chat dengan mood natural');
        const response = await geminiService.chat(
            '628111111111', 
            'Halo NekoBot, gimana mood kamu hari ini?', 
            'TestUser', 
            false
        );
        console.log('Response:', response.substring(0, 200) + (response.length > 200 ? '...' : ''));
        console.log('');
        
        // Test 4: Verify no manual mood control exists
        console.log('Test 4: Verify manual mood control removed');
        if (typeof geminiService.setMood === 'function') {
            console.log('❌ Manual mood control still exists!');
        } else {
            console.log('✅ Manual mood control successfully removed');
        }
        console.log('');
        
        // Test 5: Show statistics
        console.log('Test 5: Natural mood statistics');
        stats = geminiService.getSessionStats();
        console.log('Available moods:', stats.availableMoods);
        console.log(`Current: ${stats.currentMood} ${stats.moodEmoji}`);
        console.log(`Duration: ${stats.moodDuration}`);
        console.log('');
        
        console.log('✅ Natural mood system tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Natural mood test failed:', error.message);
    }
}

// Run test
testNaturalMood();