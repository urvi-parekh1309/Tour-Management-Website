const fs = require('fs');

const safePlaces = [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=600&q=80'
];
const safeFoods = [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
];

async function searchWikiText(query) {
    try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.query.search && data.query.search.length > 0) return data.query.search[0].title;
    } catch(e) {}
    return null;
}

async function fetchWikiImageByTitle(title) {
    try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].thumbnail) {
            return pages[pageId].thumbnail.source;
        }
    } catch(e) {}
    return null;
}

async function run() {
    const files = fs.readdirSync('dataset').filter(f => f.endsWith('.json') && f !== 'db.json' && f !== 'package.json');
    for (const file of files) {
        console.log('Processing', file);
        let changed = false;
        let data;
        try {
            data = JSON.parse(fs.readFileSync('dataset/' + file));
        } catch(e) {
            console.error("Skipping JSON error:", file);
            continue;
        }
        const items = data.destinations || data.locations || [];
        if (items.length === 0) continue;

        let placeIdx = 0; let foodIdx = 0;

        for (const dest of items) {
            // Remove bad lorempixel and unsplash images from previous run
            if (dest.image_url && (dest.image_url.includes('loremflickr') || dest.image_url.includes('unsplash.com') || dest.image_url.includes('wikimedia.org'))) dest.image_url = null;
            if (dest.food_details && dest.food_details.food_image_url && (dest.food_details.food_image_url.includes('loremflickr') || dest.food_details.food_image_url.includes('unsplash.com') || dest.food_details.food_image_url.includes('wikimedia.org'))) dest.food_details.food_image_url = null;

            // Proper Place image lookup
            if (!dest.image_url) {
                let img = null;
                const title = await searchWikiText(`${dest.name} ${data.region || ''}`);
                if (title) img = await fetchWikiImageByTitle(title);
                
                if (!img && dest.city) {
                    const cityTitle = await searchWikiText(dest.city);
                    if (cityTitle) img = await fetchWikiImageByTitle(cityTitle);
                }

                if (!img) img = safePlaces[(placeIdx++) % safePlaces.length];
                dest.image_url = img;
                changed = true;
            }

            // Proper Food image lookup
            if (!dest.food_details) dest.food_details = { famous_food: [] };
            
            if (!dest.food_details.food_image_url) {
                let f_img = null;
                if (dest.food_details.famous_food.length > 0) {
                    const fTitle = await searchWikiText(`${dest.food_details.famous_food[0]} food`);
                    if (fTitle) f_img = await fetchWikiImageByTitle(fTitle);
                }
                if (!f_img) f_img = safeFoods[(foodIdx++) % safeFoods.length];
                dest.food_details.food_image_url = f_img;
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync('dataset/' + file, JSON.stringify(data, null, 2));
            console.log('Saved', file);
        }
    }
}
run();
