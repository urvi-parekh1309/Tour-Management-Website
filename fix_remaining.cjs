const fs = require('fs');

// For each region, we know at least ONE verified working URL from the API run.
// Use these as fallbacks for entries where the API failed.
const regionFallbacks = {
    'delhi2': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Delhi_fort.jpg/500px-Delhi_fort.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Delhi_street_food%2C_chat.jpg/500px-Delhi_street_food%2C_chat.jpg'
    },
    'goa': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Basilica_of_Bom_Jesus-Goa.jpg/500px-Basilica_of_Bom_Jesus-Goa.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/A_fish_curry_from_India.jpg/500px-A_fish_curry_from_India.jpg'
    },
    'gujarat': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Statue_of_Unity.jpg/500px-Statue_of_Unity.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Gujrati_Thali.jpg/500px-Gujrati_Thali.jpg'
    },
    'himachal': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Shimla_from_Jakhoo.jpg/500px-Shimla_from_Jakhoo.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Momos_Nepal.jpg/500px-Momos_Nepal.jpg'
    },
    'kerala': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/A_houseboat_in_Alleppey%2C_Kerala.jpg/500px-A_houseboat_in_Alleppey%2C_Kerala.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Puttu-Kadala.jpg/500px-Puttu-Kadala.jpg'
    },
    'ladakh': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Pangong_Tso.jpg/500px-Pangong_Tso.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Momos_Nepal.jpg/500px-Momos_Nepal.jpg'
    },
    'maharashtra2': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/500px-Mumbai_03-2016_30_Gateway_of_India.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Pav_Bhaji.jpg/500px-Pav_Bhaji.jpg'
    },
    'punjab': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/500px-The_Golden_Temple_of_Amrithsar_7.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Pakistani_Food_Karahi_at_restaurant.jpg/500px-Pakistani_Food_Karahi_at_restaurant.jpg'
    },
    'rajasthan': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Amer_Fort%2C_Jaipur.jpg/500px-Amer_Fort%2C_Jaipur.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/The_delicious_Rajasthani_Food.jpg/500px-The_delicious_Rajasthani_Food.jpg'
    },
    'westbengal': {
        place: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Victoria_Memorial_Kolkata_panorama.jpg/500px-Victoria_Memorial_Kolkata_panorama.jpg',
        food: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Rasgulla_2.jpg/500px-Rasgulla_2.jpg'
    },
};

// These are the VERIFIED working image URLs from the successful API calls
// Check each dataset: if image_url still has old broken URLs (800px from hand-curation), replace with fallback
const files = fs.readdirSync('dataset').filter(f => f.endsWith('.json') && f !== 'db.json' && f !== 'package.json');

let totalFixed = 0;

for (const file of files) {
    const fileKey = file.replace('.json', '');
    const fallback = regionFallbacks[fileKey];
    if (!fallback) continue;
    
    let data;
    try { data = JSON.parse(fs.readFileSync('dataset/' + file)); } catch(e) { continue; }
    
    const items = data.destinations || data.locations || [];
    let fixed = 0;

    for (const dest of items) {
        // Check if image_url contains /800px- (old broken hand-curated URL)
        if (dest.image_url && dest.image_url.includes('/800px-')) {
            dest.image_url = fallback.place;
            fixed++;
        }
        
        // Fix food image too
        if (!dest.food_details) dest.food_details = { famous_food: [] };
        if (!dest.food_details.food_image_url || dest.food_details.food_image_url.includes('/800px-')) {
            dest.food_details.food_image_url = fallback.food;
            fixed++;
        }
    }
    
    if (fixed > 0) {
        fs.writeFileSync('dataset/' + file, JSON.stringify(data, null, 2));
        console.log(`${file}: fixed ${fixed} broken URLs`);
        totalFixed += fixed;
    } else {
        console.log(`${file}: all good ✓`);
    }
}

console.log(`\nTotal fixed: ${totalFixed}`);
