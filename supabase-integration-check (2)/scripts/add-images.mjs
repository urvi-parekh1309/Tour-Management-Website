import fs from 'fs';
import path from 'path';

// Map of destination name keywords to relevant Unsplash image URLs
const imageMap = {
  // Rajasthan
  "Amber Palace": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "City Palace": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Mehrangarh": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Jaisalmer Fort": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Pushkar": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Hawa Mahal": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Ranthambore": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80",
  "Lake Palace": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Jantar Mantar": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Nahargarh": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Desert": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
  "Camel": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
  "Mount Abu": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  "Chittorgarh": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Kumbhalgarh": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Umaid Bhawan": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Bhangarh": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  // Maharashtra
  "Ajanta": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Ellora": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Elephanta": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Gateway": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Marine Drive": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Shaniwar": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&q=80",
  "Mahabaleshwar": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Lonavala": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Shirdi": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Raigad": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Sinhagad": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Pratapgad": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Daulatabad": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Bibi Ka": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Chhatrapati": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Aga Khan": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&q=80",
  "Velas": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "Tadoba": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80",
  "Bhandardara": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Kolhapur": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Pandharpur": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Jejuri": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Trimbakeshwar": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
};

// Generic fallback based on category
const categoryFallbacks = {
  "UNESCO": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Heritage": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&q=80",
  "Fort": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Palace": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Nature": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Wildlife": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80",
  "Beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "Temple": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Spiritual": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Food": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "Dining": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "Market": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
  "Shopping": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
  "Hill": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  "Adventure": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  "Museum": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
};

function findImageUrl(name, category) {
  // Try name-based matching first
  for (const [key, url] of Object.entries(imageMap)) {
    if (name.includes(key)) return url;
  }
  // Try category-based matching
  for (const [key, url] of Object.entries(categoryFallbacks)) {
    if (category.includes(key)) return url;
  }
  return categoryFallbacks.default;
}

function addImagesToFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  if (!data.destinations) return;

  let modified = false;
  data.destinations.forEach(dest => {
    if (dest.ai_metadata && !dest.ai_metadata.image_url) {
      dest.ai_metadata.image_url = findImageUrl(dest.name, dest.category || '');
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

const dataDir = path.resolve('./lib/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
files.forEach(f => addImagesToFile(path.join(dataDir, f)));
console.log('Done adding image URLs!');
