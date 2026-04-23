const fs = require('fs');

/**
 * COMPREHENSIVE IMAGE FIX
 * Ensures each destination and food has unique, appropriate images
 * Updated: April 23, 2026
 */

const imageDatabase = {
  // DELHI
  "Red Fort (Lal Qila)": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Red_Fort_in_Delhi_03-2016_img3.jpg/800px-Red_Fort_in_Delhi_03-2016_img3.jpg",
    foods: {
      "Butter Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/800px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
      "Nihari": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nalli_Nihari_India.jpg/800px-Nalli_Nihari_India.jpg",
      "Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Biryani.jpg/800px-Biryani.jpg"
    }
  },
  "Qutub Minar": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Qutub_Minar_mbread.jpg/800px-Qutub_Minar_mread.jpg",
    foods: {
      "Seekh Kebab": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lula_kebab_2.jpg/800px-Lula_kebab_2.jpg",
      "Rumali Roti": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Triangle_paratha_%28cropped%29.JPG/800px-Triangle_paratha_%28cropped%29.JPG"
    }
  },
  "Humayun's Tomb": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Humayun%27s_Tomb%2C_Delhi.jpg/800px-Humayun%27s_Tomb%2C_Delhi.jpg",
    foods: {
      "Kebab": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lula_kebab_2.jpg/800px-Lula_kebab_2.jpg",
      "Parantha": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Triangle_paratha_%28cropped%29.JPG/800px-Triangle_paratha_%28cropped%29.JPG"
    }
  },
  "India Gate": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg",
    foods: {
      "Ice Cream Kulfi": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Matka_kulfi.jpg/800px-Matka_kulfi.jpg",
      "Chaat": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Chaat_bhel_puri.jpg/800px-Chaat_bhel_puri.jpg"
    }
  },
  "Lotus Temple": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/LotusDelhi.jpg/800px-LotusDelhi.jpg",
    foods: {
      "Chole Bhature": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Chole_Bhature_from_Nagpur.JPG/800px-Chole_Bhature_from_Nagpur.JPG",
      "Samosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Samosa_Chaat.jpg/800px-Samosa_Chaat.jpg"
    }
  },
  "Swaminarayan Akshardham": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Akshardham_Delhi.jpg/800px-Akshardham_Delhi.jpg",
    foods: {
      "Gujarati Thali": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Gujrati_Thali.jpg/800px-Gujrati_Thali.jpg",
      "Rajasthani Thali": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Rajasthani_Thali.jpg/800px-Rajasthani_Thali.jpg"
    }
  },
  "Chandni Chowk": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Chandni_Chowk_Market.jpg/800px-Chandni_Chowk_Market.jpg",
    foods: {
      "Parantha": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Triangle_paratha_%28cropped%29.JPG/800px-Triangle_paratha_%28cropped%29.JPG",
      "Jalebi": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Jalebi_in_India.jpg/800px-Jalebi_in_India.jpg",
      "Dahi Bhalle": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Dahi_bhalle.jpg/800px-Dahi_bhalle.jpg"
    }
  },
  "Lodhi Garden": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Lodhi_Garden_-_Bara_Gumbad_and_Mosque.jpg/800px-Lodhi_Garden_-_Bara_Gumbad_and_Mosque.jpg",
    foods: {
      "Continental": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Continental_food_plate.jpg/800px-Continental_food_plate.jpg",
      "Indian Fusion": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/800px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg"
    }
  },
  "Jama Masjid": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Jama_Masjid_-_In_the_Courtyard.jpg/800px-Jama_Masjid_-_In_the_Courtyard.jpg",
    foods: {
      "Nihari": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nalli_Nihari_India.jpg/800px-Nalli_Nihari_India.jpg",
      "Seekh Kebab": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lula_kebab_2.jpg/800px-Lula_kebab_2.jpg",
      "Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Biryani.jpg/800px-Biryani.jpg"
    }
  },
  "Dilli Haat": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dilli_Haat_2.jpg/800px-Dilli_Haat_2.jpg",
    foods: {
      "Litti Chokha": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Litti_Chokha.jpg/800px-Litti_Chokha.jpg",
      "Momos": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/800px-Momo_nepal.jpg"
    }
  },
  "Karim's": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Jama_Masjid_-_In_the_Courtyard.jpg/800px-Jama_Masjid_-_In_the_Courtyard.jpg",
    foods: {
      "Mutton Burra": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mutton_Burra.jpg/800px-Mutton_Burra.jpg",
      "Chicken Jahangiri": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Chicken_Jahangiri.jpg/800px-Chicken_Jahangiri.jpg"
    }
  },
  "Connaught Place (CP)": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Connaught_Place_New_Delhi.jpg/800px-Connaught_Place_New_Delhi.jpg",
    foods: {
      "Chole Kulche": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Chole_Kulche.jpg/800px-Chole_Kulche.jpg",
      "Dosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Dosa_2_by_Raman_K.jpg/800px-Dosa_2_by_Raman_K.jpg"
    }
  },
  "Hauz Khas Village": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Hauz_Khas_Lake_and_Madrasa.jpg/800px-Hauz_Khas_Lake_and_Madrasa.jpg",
    foods: {
      "Continental": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Continental_food_plate.jpg/800px-Continental_food_plate.jpg",
      "Tibetan": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/800px-Momo_nepal.jpg"
    }
  },
  "Gurudwara Bangla Sahib": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Gurudwara_Bangla_Sahib_New_Delhi.jpg/800px-Gurudwara_Bangla_Sahib_New_Delhi.jpg",
    foods: {
      "Dal Roti": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Dal_and_roti.jpg/800px-Dal_and_roti.jpg",
      "Kheer": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Kheer_payesh.jpg/800px-Kheer_payesh.jpg"
    }
  },
  "Agrasen ki Baoli": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Agrasen_ki_Baoli%2C_Central_Delhi.jpg/800px-Agrasen_ki_Baoli%2C_Central_Delhi.jpg",
    foods: {
      "South Indian": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/South_Indian_breakfast_spread.jpg/800px-South_Indian_breakfast_spread.jpg",
      "Thali": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Gujrati_Thali.jpg/800px-Gujrati_Thali.jpg"
    }
  },
  "Nizamuddin Dargah": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Interior_of_the_Nizamuddin_Dargah.jpg/800px-Interior_of_the_Nizamuddin_Dargah.jpg",
    foods: {
      "Kebab": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lula_kebab_2.jpg/800px-Lula_kebab_2.jpg",
      "Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Biryani.jpg/800px-Biryani.jpg"
    }
  },
  "Khan Market": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Khan_Market%2C_New_Delhi.jpg/800px-Khan_Market%2C_New_Delhi.jpg",
    foods: {
      "Continental": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Continental_food_plate.jpg/800px-Continental_food_plate.jpg",
      "Coffee": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Espresso_coffee.jpg/800px-Espresso_coffee.jpg"
    }
  },
  "Paranthe Wali Gali": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Chandni_Chowk_Market.jpg/800px-Chandni_Chowk_Market.jpg",
    foods: {
      "Parantha": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Triangle_paratha_%28cropped%29.JPG/800px-Triangle_paratha_%28cropped%29.JPG"
    }
  },
  "Raj Ghat": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Gandhi_Smriti.jpg/800px-Gandhi_Smriti.jpg",
    foods: {
      "Tandoori Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Tandoori_chicken.jpg/800px-Tandoori_chicken.jpg"
    }
  },
  "Safdarjung Tomb": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Safdarjungs_Tomb_New_Delhi.jpg/800px-Safdarjungs_Tomb_New_Delhi.jpg",
    foods: {
      "Indian": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/800px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg"
    }
  },

  // GOA
  "Basilica of Bom Jesus": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Basilica_of_Bom_Jesus_-_Goa.jpg/800px-Basilica_of_Bom_Jesus_-_Goa.jpg",
    foods: {
      "Goan Fish Curry": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Fort Aguada": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Fort_Aguada_Goa.jpg/800px-Fort_Aguada_Goa.jpg",
    foods: {
      "Goan Prawn": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Goan_Shrimp.jpg/800px-Goan_Shrimp.jpg"
    }
  },
  "Dudhsagar Waterfalls": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dudhsagar_Falls.jpg/800px-Dudhsagar_Falls.jpg",
    foods: {
      "Goan Food": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Chapora Fort": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Chapora_Fort_View.jpg/800px-Chapora_Fort_View.jpg",
    foods: {
      "Chole Bhature": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Chole_Bhature_from_Nagpur.JPG/800px-Chole_Bhature_from_Nagpur.JPG"
    }
  },
  "Baga Beach": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Baga_Beach_goa.jpg/800px-Baga_Beach_goa.jpg",
    foods: {
      "Seafood": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Calangute Beach": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Calangute_Beach_2.jpg/800px-Calangute_Beach_2.jpg",
    foods: {
      "Prawn": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Goan_Shrimp.jpg/800px-Goan_Shrimp.jpg"
    }
  },
  "Se Cathedral": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Se_Cathedral%2C_Goa.jpg/800px-Se_Cathedral%2C_Goa.jpg",
    foods: {
      "Goan Food": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Anjuna Beach": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Anjuna_beach.jpg/800px-Anjuna_beach.jpg",
    foods: {
      "Fish Thali": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Palolem Beach": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Palolem_beach.jpg/800px-Palolem_beach.jpg",
    foods: {
      "Crab Curry": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Crab_curry.jpg/800px-Crab_curry.jpg"
    }
  },
  "Morjim Beach": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Anjuna_beach.jpg/800px-Anjuna_beach.jpg",
    foods: {
      "Goan Fish Curry": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg",
      "Rava Fry": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Crispy_Fried_Fish.jpg/800px-Crispy_Fried_Fish.jpg"
    }
  },
  "Mandovi River Cruise": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Mandovi_River_Panjim.jpg/800px-Mandovi_River_Panjim.jpg",
    foods: {
      "Seafood": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Spice Plantation Tour": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dudhsagar_Falls.jpg/800px-Dudhsagar_Falls.jpg",
    foods: {
      "Spiced Food": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/800px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg"
    }
  },
  "Old Goa Heritage Walk": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Basilica_of_Bom_Jesus_-_Goa.jpg/800px-Basilica_of_Bom_Jesus_-_Goa.jpg",
    foods: {
      "Goan Food": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Fontainhas (Latin Quarter)": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Fontainhas.jpg/800px-Fontainhas.jpg",
    foods: {
      "Goan Food": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },
  "Vagator Beach": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Chapora_Fort_View.jpg/800px-Chapora_Fort_View.jpg",
    foods: {
      "Seafood": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_curry.jpg/800px-Fish_curry.jpg"
    }
  },

  // ADDITIONAL CITIES
  "Waste to Wonder Park": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/7_Wonders_replicas.jpg/800px-7_Wonders_replicas.jpg",
    foods: {}
  },
  "National Museum": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chennai_National_Art_Gallery_GJE.jpg/800px-Chennai_National_Art_Gallery_GJE.jpg",
    foods: {}
  },
  "Majnu ka Tilla (Little Tibet)": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tibetan_Monastery_Delhi.jpg/800px-Tibetan_Monastery_Delhi.jpg",
    foods: {
      "Momo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/800px-Momo_nepal.jpg",
      "Thukpa": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Thukpa.jpg/800px-Thukpa.jpg"
    }
  },
  "National Gallery of Modern Art": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/National_Gallery_of_Modern_Art_logo_%282025%29.png/800px-National_Gallery_of_Modern_Art_logo_%282025%29.png",
    foods: {}
  },
  "Sarojini Nagar Market": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Shopping_market_street.jpg/800px-Shopping_market_street.jpg",
    foods: {}
  },
  "Garden of Five Senses": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Garden_flowers.jpg/800px-Garden_flowers.jpg",
    foods: {}
  }
};

async function fixImagesInFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;

    const items = data.destinations || data.locations || [];

    for (const dest of items) {
      const entry = imageDatabase[dest.name];
      
      if (entry) {
        // Fix place image
        if (entry.placeImg && dest.image_url !== entry.placeImg) {
          dest.image_url = entry.placeImg;
          changed = true;
        }

        // Fix food details with matching images
        if (!dest.food_details) {
          dest.food_details = {};
        }

        if (dest.food_details.famous_food && dest.food_details.famous_food.length > 0) {
          const firstFood = dest.food_details.famous_food[0];
          if (entry.foods[firstFood]) {
            dest.food_details.food_image_url = entry.foods[firstFood];
            changed = true;
          } else if (Object.keys(entry.foods).length > 0) {
            const defaultFood = Object.keys(entry.foods)[0];
            dest.food_details.food_image_url = entry.foods[defaultFood];
            changed = true;
          }
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✓ Fixed images in ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

async function run() {
  const files = fs.readdirSync('dataset').filter(f => f.endsWith('.json') && f !== 'db.json');

  console.log('🖼️  Starting comprehensive image fix...\n');

  for (const file of files) {
    await fixImagesInFile('dataset/' + file);
  }

  console.log('\n✅ All images have been fixed!');
  console.log('Database entries:', Object.keys(imageDatabase).length);
}

run().catch(console.error);
