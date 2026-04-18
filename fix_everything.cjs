const fs = require('fs');
const delay = ms => new Promise(r => setTimeout(r, ms));

// Get verified image from Wikipedia REST API
async function getWikiImg(query) {
    try {
        // Search for the article
        const sr = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`, 
            { headers: { 'User-Agent': 'SmartTravelPlanner/1.0 (hackathon)' } });
        const sd = await sr.json();
        if (!sd[1] || !sd[1].length) return null;
        
        await delay(250);
        
        // Get the summary with thumbnail
        const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(sd[1][0])}`,
            { headers: { 'User-Agent': 'SmartTravelPlanner/1.0 (hackathon)' } });
        if (r.status !== 200) return null;
        const d = await r.json();
        if (!d.thumbnail?.source) return null;
        return d.thumbnail.source.replace(/\/\d+px-/, '/500px-');
    } catch(e) { return null; }
}

// ==============================
// STEP 1: Build food image cache
// ==============================
async function buildFoodCache() {
    const foodTerms = {
        // Maharashtra
        'Pav Bhaji': 'Pav bhaji',
        'Vada Pav': 'Vada pav',
        'Misal Pav': 'Misal pav',
        'Modak': 'Modak',
        'Puran Poli': 'Puran poli',
        'Bombil Fry': 'Bombay duck',
        'Bhel Puri': 'Bhelpuri',
        'Poha': 'Poha',
        // Delhi
        'Butter Chicken': 'Butter chicken',
        'Chole Bhature': 'Chole bhature',
        'Parantha': 'Paratha',
        'Biryani': 'Biryani',
        'Kebab': 'Kebab',
        'Jalebi': 'Jalebi',
        'Chaat': 'Chaat',
        'Nihari': 'Nihari',
        'Tandoori Chicken': 'Tandoori chicken',
        'Dal Makhani': 'Dal makhani',
        'Kulfi': 'Kulfi',
        'Samosa': 'Samosa',
        // Gujarat
        'Dhokla': 'Dhokla',
        'Fafda': 'Fafda',
        'Thepla': 'Thepla',
        'Gujarati Thali': 'Gujarati cuisine',
        'Dabeli': 'Dabeli',
        'Khichdi': 'Khichdi',
        'Undhiyu': 'Undhiyu',
        // Goa
        'Fish Curry Rice': 'Fish curry',
        'Bebinca': 'Bebinca',
        'Pork Vindaloo': 'Vindaloo',
        'Prawn Balchão': 'Balchão',
        'Xacuti': 'Xacuti',
        'Goan Sausage': 'Goan sausage',
        'Sorpotel': 'Sorpotel',
        // Rajasthan
        'Dal Baati Churma': 'Dal bati churma',
        'Laal Maas': 'Laal maas',
        'Ghevar': 'Ghevar',
        'Pyaaz Kachori': 'Kachori',
        'Ker Sangri': 'Ker sangri',
        'Gatte Ki Sabzi': 'Gatte ki sabzi',
        // Punjab
        'Amritsari Kulcha': 'Kulcha',
        'Lassi': 'Lassi',
        'Sarson Da Saag': 'Sarson da saag',
        'Makki Di Roti': 'Makki di roti',
        'Chole': 'Chole',
        // Kerala
        'Appam': 'Appam',
        'Puttu': 'Puttu',
        'Kerala Fish Curry': 'Fish molee',
        'Banana Chips': 'Banana chip',
        'Sadya': 'Sadhya',
        'Payasam': 'Payasam',
        // West Bengal
        'Rasgulla': 'Rasgulla',
        'Mishti Doi': 'Mishti doi',
        'Kosha Mangsho': 'Kosha mangsho',
        'Kathi Roll': 'Kati roll',
        'Phuchka': 'Panipuri',
        'Luchi': 'Luchi',
        // Himachal
        'Momos': 'Momo (food)',
        'Thukpa': 'Thukpa',
        'Siddu': 'Siddu',
        'Madra': 'Madra (dish)',
        'Dham': 'Himachali Dham',
        // Ladakh
        'Butter Tea': 'Butter tea',
        'Skyu': 'Skyu',
        'Tsampa': 'Tsampa',
    };

    console.log('Building food image cache...');
    const cache = {};
    const entries = Object.entries(foodTerms);
    for (let i = 0; i < entries.length; i++) {
        const [key, search] = entries[i];
        const img = await getWikiImg(search);
        if (img) {
            cache[key.toLowerCase()] = img;
            process.stdout.write('✓');
        } else {
            process.stdout.write('✗');
        }
        await delay(350);
    }
    console.log(`\nCached ${Object.keys(cache).length} food images`);
    return cache;
}

// ==============================
// STEP 2: Better search terms for places
// ==============================
const betterSearchTerms = {
    // Maharashtra fixes
    'Ellora Caves': 'Ellora Caves',
    'Chhatrapati Shivaji Maharaj Terminus (CSMT)': 'Chhatrapati Shivaji Terminus',
    'Shirdi Sai Baba Temple': 'Shirdi',
    'Elephanta Caves': 'Elephanta Caves',
    'Raigad Fort': 'Raigad fort',
    'Gateway of India': 'Gateway of India',
    'Marine Drive': 'Marine Drive Mumbai',
    'Haji Ali Dargah': 'Haji Ali Dargah',
    'Dagdusheth Halwai Ganpati': 'Dagdusheth Halwai Ganapati Temple',
    'Aga Khan Palace': 'Aga Khan Palace',
    'Lonar Meteorite Lake': 'Lonar crater lake',
    // Delhi fixes
    'Swaminarayan Akshardham': 'Akshardham Delhi',
    'Jama Masjid': 'Jama Masjid Delhi',
    'Red Fort (Lal Qila)': 'Red Fort',
    'Qutub Minar': 'Qutb Minar',
    'India Gate': 'India Gate',
    'Lotus Temple': 'Lotus Temple',
    'Chandni Chowk': 'Chandni Chowk',
    'Connaught Place (CP)': 'Connaught Place',
    'Hauz Khas Village': 'Hauz Khas Complex',
    // Gujarat fixes  
    'Rann of Kutch': 'Rann of Kutch',
    'Ahmedabad': 'Ahmedabad',
    'Statue of Unity': 'Statue of Unity',
    // Goa fixes
    'Bhagwan Mahavir Sanctuary': 'Bhagwan Mahavir Wildlife Sanctuary',
    'Basilica of Bom Jesus': 'Basilica of Bom Jesus',
    'Bom Jesus Basilica Complex': 'Basilica of Bom Jesus',
    'Fontainhas (Latin Quarter)': 'Fontainhas',
    "Mum's Kitchen": 'Goa cuisine restaurant',
    'Anjuna Flea Market': 'Anjuna flea market',
    'Netravali Sanctuary': 'Netravali Wildlife Sanctuary',
    'Cotigao Sanctuary': 'Cotigao Wildlife Sanctuary',
    'Morjim Turtle Nesting Site': 'Morjim Beach',
    'Baga Beach': 'Baga Beach',
    'Palolem Beach': 'Palolem',
    'Calangute Beach Market': 'Calangute Beach',
    'Fort Aguada': 'Fort Aguada',
    'Chapora Fort': 'Chapora Fort',
    'Dudhsagar Falls': 'Dudhsagar Falls',
    // Himachal
    'Shimla Ridge & Mall Road': 'Shimla',
    'Manali Old Village': 'Manali Himachal Pradesh',
    'Dharamshala & McLeod Ganj': 'McLeod Ganj',
    'Spiti Valley': 'Spiti Valley',
    'Bir Billing': 'Bir Billing paragliding',
    'Khajjiar (Mini Switzerland)': 'Khajjiar',
    // Kerala
    'Munnar Tea Gardens': 'Munnar',
    'Alleppey Backwaters': 'Alleppey houseboat',
    'Fort Kochi': 'Fort Kochi',
    'Athirappilly Waterfalls': 'Athirappilly Falls',
    // Ladakh
    'Pangong Tso': 'Pangong Lake',
    'Nubra Valley': 'Nubra Valley',
    'Leh Palace': 'Leh Palace',
    'Thiksey Monastery': 'Thiksey Monastery',
    // Punjab
    'Golden Temple (Harmandir Sahib)': 'Golden Temple Amritsar',
    'Wagah Border': 'Wagah border ceremony',
    'Jallianwala Bagh': 'Jallianwala Bagh',
    'Rock Garden': 'Rock Garden Chandigarh',
    // Rajasthan
    'Amber Palace (Amer Fort)': 'Amer Fort',
    'Mehrangarh Fort': 'Mehrangarh',
    'Jaisalmer Fort': 'Jaisalmer Fort',
    'Hawa Mahal': 'Hawa Mahal',
    'Lake Pichola': 'Lake Pichola',
    'City Palace': 'City Palace Jaipur',
    // West Bengal
    'Victoria Memorial': 'Victoria Memorial Kolkata',
    'Howrah Bridge': 'Howrah Bridge',
    'Darjeeling Mall Road': 'Darjeeling',
    'Sundarbans National Park': 'Sundarbans',
    'Dakshineswar Kali Temple': 'Dakshineswar Kali Temple',
};

// ==============================
// STEP 3: Main processing
// ==============================
async function run() {
    // Build food image cache first
    const foodCache = await buildFoodCache();
    
    // Default food fallbacks per region
    const defaultFoodImgs = {
        'delhi2': foodCache['butter chicken'] || foodCache['biryani'],
        'goa': foodCache['fish curry rice'] || foodCache['bebinca'],
        'gujarat': foodCache['dhokla'] || foodCache['gujarati thali'],
        'himachal': foodCache['momos'] || foodCache['thukpa'],
        'kerala': foodCache['appam'] || foodCache['puttu'],
        'ladakh': foodCache['momos'] || foodCache['butter tea'],
        'maharashtra2': foodCache['pav bhaji'] || foodCache['vada pav'],
        'punjab': foodCache['amritsari kulcha'] || foodCache['lassi'],
        'rajasthan': foodCache['dal baati churma'] || foodCache['laal maas'],
        'westbengal': foodCache['rasgulla'] || foodCache['mishti doi'],
    };

    const files = fs.readdirSync('dataset').filter(f => f.endsWith('.json') && f !== 'db.json' && f !== 'package.json' && f !== 'updateddelhi.json');

    for (const file of files) {
        const fileKey = file.replace('.json', '');
        console.log(`\n=== ${file} ===`);
        
        let data;
        try { data = JSON.parse(fs.readFileSync('dataset/' + file)); } catch(e) { console.log('  SKIP (parse error)'); continue; }
        
        const items = data.destinations || data.locations || [];
        if (!items.length) { console.log('  SKIP (empty)'); continue; }

        for (const dest of items) {
            // --- Fix place image ---
            const searchTerm = betterSearchTerms[dest.name] || dest.name;
            const placeImg = await getWikiImg(searchTerm);
            if (placeImg) {
                dest.image_url = placeImg;
                process.stdout.write('P');
            } else {
                // Try with "India" appended
                const placeImg2 = await getWikiImg(searchTerm + ' India');
                if (placeImg2) {
                    dest.image_url = placeImg2;
                    process.stdout.write('p');
                } else {
                    process.stdout.write('.');
                }
            }
            await delay(300);

            // --- Fix food image (per-place, not per-region) ---
            if (!dest.food_details) dest.food_details = { famous_food: [] };
            const foods = dest.food_details.famous_food || [];
            let foodImgSet = false;
            
            // Try to find a cached food image matching this place's famous foods
            for (const food of foods) {
                const key = food.toLowerCase();
                if (foodCache[key]) {
                    dest.food_details.food_image_url = foodCache[key];
                    foodImgSet = true;
                    break;
                }
                // Try partial match
                for (const [cacheKey, cacheUrl] of Object.entries(foodCache)) {
                    if (key.includes(cacheKey) || cacheKey.includes(key)) {
                        dest.food_details.food_image_url = cacheUrl;
                        foodImgSet = true;
                        break;
                    }
                }
                if (foodImgSet) break;
            }
            
            // If no specific food image found, use regional default
            if (!foodImgSet && defaultFoodImgs[fileKey]) {
                dest.food_details.food_image_url = defaultFoodImgs[fileKey];
            }
        }

        fs.writeFileSync('dataset/' + file, JSON.stringify(data, null, 2));
        console.log(`\n  ✓ Saved ${file} (${items.length} places)`);
    }

    console.log('\n=== ALL DONE ===');
    console.log('Food cache entries:', Object.keys(foodCache).length);
}

run();
