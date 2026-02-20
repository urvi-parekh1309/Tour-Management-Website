// 1. The Core Regression Engine (Works for everything)
function getPredictiveBudget(spot, trafficFactor, seasonalFactor) {
    const baseStay = spot.budget_metrics.base_stay_cost_per_day || 0;
    const baseTravel = spot.budget_metrics.base_travel_cost || 0;
    const baseMeal = spot.budget_metrics.base_meal_cost || 200; // Default meal cost
    
    // Regression formula: Price = Base + (Traffic * Travel) + (Season * Stay)
    const total = (baseTravel * trafficFactor) + 
                  ((baseStay + baseMeal) * seasonalFactor) + 
                  (spot.entry_fee || 0);
    return Math.round(total);
}

// 2. The Smart Controller
function updateTripList(filterType = 'All') {
    const container = document.getElementById('recommendations');
    container.innerHTML = ''; // Clear the screen

    // STEP A: Decide which data to use
    let finalSelection = [];
    if (filterType === 'All') {
        finalSelection = rajasthanData.destinations; // Show everything
    } else {
        finalSelection = rajasthanData.destinations.filter(res => 
            res.ai_metadata.taste_profile && res.ai_metadata.taste_profile.includes(filterType)
        );
    }

    // STEP B: Apply AI Logic to the selection
    finalSelection.forEach(spot => {
        // AI Logic: Set traffic based on filter or general time
        // If spicy, we assume Old City traffic (1.4). Else, use general (1.1).
        const traffic = (filterType === 'Spicy') ? 1.4 : 1.1; 
        const season = 1.15; // February surge
        
        const budget = getPredictiveBudget(spot, traffic, season);
        
        // STEP C: Render to HTML
        container.innerHTML += `
            <div class="card">
                <h3>${spot.name}</h3>
                <span class="tag">${filterType === 'All' ? spot.category : filterType}</span>
                <p><strong>Predicted Realistic Budget: ₹${budget}</strong></p>
            </div>
        `;
    });
}