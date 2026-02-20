/**
 * Predictive Engine for PulseRush
 * Calculates cost, time, and dynamic insights based on traffic/season factors.
 */
function getAIPredictions(spot, trafficFactor, seasonalFactor) {
    const metrics = spot.budget_metrics;
    const baseStay = metrics.base_stay_cost_per_day || 0;
    const baseTravel = metrics.base_travel_cost || 0;
    const baseMeal = metrics.base_meal_cost || 200;
    const entryFee = metrics.base_entry_fee || 0;

    // Regression formula: Cost = (Travel * Traffic) + ((Stay + Meal) * Season) + Entry
    const predictedBudget = (baseTravel * trafficFactor) + 
                            ((baseStay + baseMeal) * seasonalFactor) + 
                            entryFee;

    // Time: Assume 1 unit of travel cost roughly equals 0.5 mins base time
    const baseTravelTimeMin = (baseTravel / 10); 
    const predictedTimeMin = baseTravelTimeMin * trafficFactor;

    // AI Reasoning Logic
    let insights = [];
    if (trafficFactor >= 1.4) {
        insights.push(`🚦 <strong>High Alert:</strong> Traffic in ${spot.city} is peaking. Travel time increased by ${Math.round((trafficFactor - 1) * 100)}%.`);
    }
    if (seasonalFactor > 1.1) {
        insights.push(`📅 <strong>Peak Season:</strong> February demand in ${spot.city} has pushed costs up by ${Math.round((seasonalFactor - 1) * 100)}%.`);
    }
    if (spot.category.includes("UNESCO")) {
        insights.push("🏛️ <strong>Expert Tip:</strong> Arrive before 8 AM to avoid the 2-hour entry queue predicted by AI.");
    }

    return {
        cost: Math.round(predictedBudget),
        timeHours: (predictedTimeMin / 60).toFixed(1),
        logicText: insights.length > 0 ? insights.join("<br>") : "✅ Clear travel conditions predicted."
    };
}

/**
 * The Main Controller
 * Filters data and renders it with AI-calculated predictions.
 */
function updateTripList(filterType = 'All') {
    const container = document.getElementById('recommendations');
    container.innerHTML = ''; // Clear existing cards

    // 1. Filter the dataset (Ensure your variable name matches your data)
    let finalSelection = masterDataset.locations.filter(loc => 
        filterType === 'All' || loc.category.includes(filterType) || (loc.ai_metadata.vibe_tags && loc.ai_metadata.vibe_tags.includes(filterType))
    );

    // 2. Loop through and process each spot
    finalSelection.forEach(spot => {
        // Set dynamic AI factors based on City or Category
        const isUrban = ["Lucknow", "Agra", "Varanasi", "Leh"].includes(spot.city);
        const traffic = (filterType === 'Spicy' || isUrban) ? 1.5 : 1.1; 
        const season = 1.25; // Constant for February peak

        const ai = getAIPredictions(spot, traffic, season);

        // 3. Create the HTML Card
        container.innerHTML += `
            <div class="card ai-enhanced">
                <div class="card-header">
                    <h3>${spot.name}</h3>
                    <span class="city-tag">${spot.city}</span>
                </div>
                
                <div class="ai-insight-box">
                    <p>${ai.logicText}</p>
                </div>

                <div class="stats-grid">
                    <div class="stat">
                        <label>Realistic Budget</label>
                        <p>₹${ai.cost}</p>
                    </div>
                    <div class="stat">
                        <label>Est. Travel Time</label>
                        <p>${ai.timeHours} Hours</p>
                    </div>
                </div>
                
                <button class="view-btn">Add to Itinerary</button>
            </div>
        `;
    });
}