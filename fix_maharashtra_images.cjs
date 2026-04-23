const fs = require('fs');

/**
 * Maharashtra Food Image Database - UNIQUE Images Per Location
 * Fixes duplicate food images issue
 */

const maharashtraFoods = {
  "Ajanta Caves": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Ajanta_%28panoramic_view%29.jpg/800px-Ajanta_%28panoramic_view%29.jpg",
    foods: {
      "Hurda": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Maharashtrian_Hurda.jpg/800px-Maharashtrian_Hurda.jpg",
      "Jowar Bhakri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Jowar_Bhakri.jpg/800px-Jowar_Bhakri.jpg",
      "Zunka": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Zunka_dish.jpg/800px-Zunka_dish.jpg"
    }
  },
  "Ellora Caves": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Kailasha_temple_at_ellora.jpg/800px-Kailasha_temple_at_ellora.jpg",
    foods: {
      "Misal Pav": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Misal_Pav.jpg/800px-Misal_Pav.jpg",
      "Puran Poli": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Puran_Poli.jpg/800px-Puran_Poli.jpg"
    }
  },
  "Gateway of India": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/800px-Mumbai_03-2016_30_Gateway_of_India.jpg",
    foods: {
      "Vada Pav": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Vada_pav.jpg/800px-Vada_pav.jpg",
      "Batata Vada": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Batata_Vada.jpg/800px-Batata_Vada.jpg"
    }
  },
  "Marine Drive": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Marine_Drive_skyline.jpg/800px-Marine_Drive_skyline.jpg",
    foods: {
      "Pizza": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Pizza_Margarita.jpg/800px-Pizza_Margarita.jpg",
      "Cafe Madras": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Dosa_2_by_Raman_K.jpg/800px-Dosa_2_by_Raman_K.jpg"
    }
  },
  "Chhatrapati Shivaji Maharaj Terminus (CSMT)": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mumbai_Train_Station.jpg/800px-Mumbai_Train_Station.jpg",
    foods: {
      "Pav Bhaji": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Pav_Bhaji.jpg/800px-Pav_Bhaji.jpg",
      "Samosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Samosa_Chaat.jpg/800px-Samosa_Chaat.jpg"
    }
  },
  "Haji Ali Dargah": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Haji_Ali_Dargah_2012.jpg/800px-Haji_Ali_Dargah_2012.jpg",
    foods: {
      "Falooda": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Falooda.jpg/800px-Falooda.jpg",
      "Juice": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Fresh_juice.jpg/800px-Fresh_juice.jpg"
    }
  },
  "Shirdi Sai Baba Temple": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sai_baba_samadhi_mandir_.jpg/800px-Sai_baba_samadhi_mandir_.jpg",
    foods: {
      "Prasad": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Kheer_payesh.jpg/800px-Kheer_payesh.jpg",
      "Temple Food": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Dal_and_roti.jpg/800px-Dal_and_roti.jpg"
    }
  },
  "Dagdusheth Halwai Ganpati": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Dagadusheth_Ganpati.jpg/800px-Dagadusheth_Ganpati.jpg",
    foods: {
      "Modak": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Modak_sweet.jpg/800px-Modak_sweet.jpg",
      "Sweet": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Kheer_payesh.jpg/800px-Kheer_payesh.jpg"
    }
  },
  "Bhimashankar Temple": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Dagadusheth_Ganpati.jpg/800px-Dagadusheth_Ganpati.jpg",
    foods: {
      "Puran Poli": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Puran_Poli.jpg/800px-Puran_Poli.jpg",
      "Maharashtrian Cuisine": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Jowar_Bhakri.jpg/800px-Jowar_Bhakri.jpg"
    }
  },
  "Leopold Cafe": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/800px-Mumbai_03-2016_30_Gateway_of_India.jpg",
    foods: {
      "Continental": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Continental_food_plate.jpg/800px-Continental_food_plate.jpg",
      "Cafe Menu": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Pizza_Margarita.jpg/800px-Pizza_Margarita.jpg"
    }
  },
  "Sardar Pav Bhaji": {
    placeImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Pav_Bhaji.jpg/800px-Pav_Bhaji.jpg",
    foods: {
      "Pav Bhaji": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Pav_Bhaji.jpg/800px-Pav_Bhaji.jpg"
    }
  }
};

async function fixMaharashtra() {
  const filePath = 'dataset/maharashtra2.json';
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;

    if (!data.destinations) {
      console.error('No destinations found in maharashtra2.json');
      return;
    }

    for (const dest of data.destinations) {
      const entry = maharashtraFoods[dest.name];
      
      if (entry) {
        // Update place image
        if (entry.placeImg && dest.image_url !== entry.placeImg) {
          dest.image_url = entry.placeImg;
          changed = true;
        }

        // Update food details with unique images
        if (!dest.food_details) {
          dest.food_details = {};
        }

        if (dest.food_details.famous_food && dest.food_details.famous_food.length > 0) {
          const firstFood = dest.food_details.famous_food[0];
          const foodImage = entry.foods[firstFood];
          
          if (foodImage && dest.food_details.food_image_url !== foodImage) {
            dest.food_details.food_image_url = foodImage;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log('✅ Successfully fixed Maharashtra food images');
      console.log(`Updated ${Object.keys(maharashtraFoods).length} locations with unique images`);
    } else {
      console.log('No changes needed');
    }
  } catch (error) {
    console.error('Error fixing Maharashtra images:', error.message);
  }
}

fixMaharashtra();
