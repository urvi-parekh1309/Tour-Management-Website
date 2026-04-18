const fs = require('fs');

// Delay helper
const delay = ms => new Promise(r => setTimeout(r, ms));

// Get a VERIFIED working thumbnail URL from Wikipedia REST API
async function getWikiImage(searchTerm) {
    try {
        // First, search for the correct article title
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchTerm)}&limit=1&format=json`;
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'SmartTravelPlanner/1.0 (Hackathon project)' } });
        const searchData = await searchRes.json();
        
        if (!searchData[1] || searchData[1].length === 0) return null;
        const title = searchData[1][0];
        
        await delay(200);
        
        // Get page summary with verified thumbnail
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'SmartTravelPlanner/1.0 (Hackathon project)' } });
        
        if (summaryRes.status !== 200) return null;
        const summaryData = await summaryRes.json();
        
        if (summaryData.thumbnail && summaryData.thumbnail.source) {
            // The REST API returns ~330px thumbnails. Scale up to 500px
            let url = summaryData.thumbnail.source;
            url = url.replace(/\/\d+px-/, '/500px-');
            return url;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// Region-specific food search terms
const regionFoodSearch = {
    'delhi2': 'Indian cuisine Delhi',
    'goa': 'Goan cuisine',
    'gujarat': 'Gujarati cuisine',
    'himachal': 'Himachali cuisine',
    'kerala': 'Kerala cuisine',
    'ladakh': 'Ladakhi cuisine',
    'maharashtra2': 'Maharashtrian cuisine',
    'punjab': 'Punjabi cuisine',
    'rajasthan': 'Rajasthani cuisine',
    'westbengal': 'Bengali cuisine',
};

async function run() {
    const files = fs.readdirSync('dataset').filter(f => f.endsWith('.json') && f !== 'db.json' && f !== 'package.json');

    // First, get a regional food image for each state
    const regionFoodImgs = {};
    console.log('=== Getting regional food images ===');
    for (const [key, search] of Object.entries(regionFoodSearch)) {
        const img = await getWikiImage(search);
        if (img) {
            regionFoodImgs[key] = img;
            console.log(`  ${key}: ${img.substring(0, 80)}...`);
        }
        await delay(400);
    }

    for (const file of files) {
        const fileKey = file.replace('.json', '');
        console.log(`\n=== Processing ${file} ===`);
        
        let data;
        try {
            data = JSON.parse(fs.readFileSync('dataset/' + file));
        } catch (e) {
            console.error("  Skipping (JSON error):", file);
            continue;
        }

        const items = data.destinations || data.locations || [];
        if (items.length === 0) { console.log("  No items, skipping"); continue; }

        let changed = false;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < items.length; i++) {
            const dest = items[i];
            
            // Get place image from Wikipedia
            const placeImg = await getWikiImage(dest.name);
            if (placeImg) {
                dest.image_url = placeImg;
                successCount++;
                process.stdout.write('✓');
            } else {
                // Try with city name appended
                const placeImg2 = await getWikiImage(dest.name + ' India');
                if (placeImg2) {
                    dest.image_url = placeImg2;
                    successCount++;
                    process.stdout.write('✓');
                } else {
                    failCount++;
                    process.stdout.write('✗');
                }
            }
            changed = true;
            
            // Set food image to regional food image  
            if (!dest.food_details) dest.food_details = { famous_food: [] };
            if (regionFoodImgs[fileKey]) {
                dest.food_details.food_image_url = regionFoodImgs[fileKey];
            }
            
            // Ensure restaurants exist
            if (!dest.restaurants || dest.restaurants.length === 0) {
                dest.restaurants = ["Popular local eateries"];
            }
            
            // Rate limit: 400ms between requests
            await delay(400);
        }

        console.log(`\n  Results: ${successCount} found, ${failCount} fallback`);

        if (changed) {
            fs.writeFileSync('dataset/' + file, JSON.stringify(data, null, 2));
            console.log(`  ✓ Saved ${file}`);
        }
    }
}

run().then(() => console.log('\n=== ALL DONE ==='));
