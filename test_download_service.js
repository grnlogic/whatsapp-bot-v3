/**
 * Test file untuk download service
 */

const { downloadTikTok, downloadInstagram, downloadYouTube } = require('./src/services/downloadService');

// Test URLs
const testURLs = {
    tiktok: 'https://www.tiktok.com/@adzkia_1314/video/7558057783304768779',
    instagram: 'https://www.instagram.com/reel/DQoRViIk61T/',
    youtube: 'https://youtu.be/5fGXpbv8za0' // Video pendek untuk testing
};

/**
 * Run all tests
 */
async function runTests() {
    console.log('🚀 Starting Download Service Tests...\n');
    console.log('=' .repeat(60));
    
    const results = {
        tiktok: false,
        instagram: false,
        youtube: false
    };
    
    // Test TikTok
    console.log('\n🧪 Testing TikTok Download...');
    console.log('URL:', testURLs.tiktok);
    try {
        const result = await downloadTikTok(testURLs.tiktok);
        if (result.success) {
            console.log('✅ Success!');
            console.log('Title:', result.title);
            console.log('Author:', result.author);
            console.log('Video URL:', result.videoUrl.substring(0, 100) + '...');
            results.tiktok = true;
        } else {
            console.log('❌ Failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    // Test Instagram
    console.log('\n🧪 Testing Instagram Download...');
    console.log('URL:', testURLs.instagram);
    try {
        const result = await downloadInstagram(testURLs.instagram);
        if (result.success) {
            console.log('✅ Success!');
            console.log('Title:', result.title);
            console.log('Author:', result.author);
            console.log('Video URL:', result.videoUrl.substring(0, 100) + '...');
            results.instagram = true;
        } else {
            console.log('❌ Failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    // Test YouTube
    console.log('\n🧪 Testing YouTube Download...');
    console.log('URL:', testURLs.youtube);
    try {
        const result = await downloadYouTube(testURLs.youtube);
        if (result.success) {
            console.log('✅ Success!');
            console.log('Title:', result.title);
            console.log('Author:', result.author);
            console.log('Video URL:', result.videoUrl.substring(0, 100) + '...');
            results.youtube = true;
        } else {
            console.log('❌ Failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary:\n');
    console.log('TikTok:', results.tiktok ? '✅ PASSED' : '❌ FAILED');
    console.log('Instagram:', results.instagram ? '✅ PASSED' : '❌ FAILED');
    console.log('YouTube:', results.youtube ? '✅ PASSED' : '❌ FAILED');
    console.log('\n' + '='.repeat(60));
    
    const passedCount = Object.values(results).filter(r => r === true).length;
    console.log(`\n✅ ${passedCount}/3 tests passed`);
    
    if (passedCount === 3) {
        console.log('\n🎉 All tests passed! Download service is ready to use.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }
}

// Run tests
runTests().catch(console.error);
