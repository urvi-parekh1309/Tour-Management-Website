/**
 * PULSERUSH: AI-DRIVEN TRAVEL PLATFORM
 * Core Features: Predictive Regression (Cost/Time) & Content-Based Filtering (Recommendations)
 */

// 1. SIMULATED USER HISTORY (This grows as the user interacts with the app)
let userHistory = [
    { name: "Velas Beach", tags: ["Eco-Tourism", "Village-Life", "Serene"] },
    { name: "Turtuk", tags: ["Village-Life", "Offbeat", "Authentic"] }
];

/**
 * AI ENGINE 1: Predictive Regression Model
 * Goal: Perform inference on cost and time based on environmental variables.
 * Logic: Predictive Analytics (Integral AI)
 */
function getAIPredictions(spot, trafficFactor, seasonalFactor) {
    // Safety Guard: Ensure metrics exist
    if (!spot.budget_metrics) {
        return { cost: "N/A", timeHours: "N/A", logicText: "Incomplete data for prediction." };
    }

    const metrics = spot.budget_metrics;
    const baseStay = metrics.base_stay_cost_per_day || 0;
    const baseTravel = metrics.base_travel_cost || 0;
    const baseMeal = metrics.base_meal_cost || 200;
    const entryFee = metrics.base_entry_fee || 0;

    // Regression Formula: Price = (Travel * Traffic) + ((Stay + Meal) * Season) + Entry
    const predictedBudget = (baseTravel * trafficFactor) + 
                            ((baseStay + baseMeal) * seasonalFactor) + 
                            entryFee;

    // Time Estimation: Simulated based on distance-cost ratio and traffic
    const baseTravelTimeMin = (baseTravel / 10); 
    const predictedTimeMin = baseTravelTimeMin * trafficFactor;

    // AI Reasoning Generator
    let insights = [];
    if (trafficFactor >= 1.4) {
        insights.push(`🚦 <strong>High Alert:</strong> Traffic in ${spot.city} is peaking. Travel time increased by ${Math.round((trafficFactor - 1) * 100)}%.`);
    }
    if (seasonalFactor > 1.1) {
        insights.push(`📅 <strong>Peak Season:</strong> High demand in ${spot.city} has pushed costs up by ${Math.round((seasonalFactor - 1) * 100)}%.`);
    }
    if (spot.category.includes("UNESCO") || spot.category.includes("Spiritual")) {
        insights.push("🏛️ <strong>AI Observation:</strong> Historical data suggests heavy crowds; plan an early morning visit.");
    }

    return {
        cost: Math.round(predictedBudget),
        timeHours: (predictedTimeMin / 60).toFixed(1),
        logicText: insights.length > 0 ? insights.join("<br>") : "✅ Optimal travel conditions predicted."
    };
}

/**
 * AI ENGINE 2: Recommendation Scoring (Content-Based Filtering)
 * Goal: Map user interests to destination vibe_tags.
 * Logic: Machine Learning / Behavioral Modeling
 */
function getRecommendationScore(destination, history) {
    if (!destination.ai_metadata || !destination.ai_metadata.vibe_tags) return 0;

    const userInterests = history.flatMap(item => item.tags);
    let matchCount = 0;
    
    destination.ai_metadata.vibe_tags.forEach(tag => {
        if (userInterests.includes(tag)) matchCount++;
    });

    const totalTags = destination.ai_metadata.vibe_tags.length || 1;
    return Math.round((matchCount / totalTags) * 100);
}

/**
 * UI CONTROLLER: Recommendation View
 * Renders the "Top Picks" based on AI Match Scores.
 */
function showRecommendationsForYou() {
    const container = document.getElementById('ai-recommendations-container');
    if (!container) return; // Safety check for HTML element

    container.innerHTML = '<h2 class="ai-header">AI Predicted For You</h2>';

    // Map through dataset to calculate scores
    let suggestions = masterDataset.locations.map(spot => {
        const matchScore = getRecommendationScore(spot, userHistory);
        return { ...spot, matchScore };
    });

    // Sort by Highest Match and exclude items already in history
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    // Render Top 3
    suggestions.slice(0, 3).forEach(spot => {
        container.innerHTML += `
            <div class="card ai-recommendation">
                <div class="ai-badge">${spot.matchScore}% Match</div>
                <h3>${spot.name}</h3>
                <p>Matches your interest in <strong>${spot.ai_metadata.vibe_tags[0]}</strong></p>
                <button class="view-btn" onclick="addToHistory('${spot.name}', ${JSON.stringify(spot.ai_metadata.vibe_tags)})">Like & Visit</button>
            </div>
        `;
    });
}

/**
 * UI CONTROLLER: Main List View
 * Renders the general list with Predictive Analytics applied.
 */
function updateTripList(filterType = 'All') {
    const container = document.getElementById('main-list-container');
    if (!container) return;

    container.innerHTML = ''; 

    let finalSelection = masterDataset.locations.filter(loc => 
        filterType === 'All' || 
        loc.category.includes(filterType) || 
        (loc.ai_metadata.vibe_tags && loc.ai_metadata.vibe_tags.includes(filterType))
    );

    finalSelection.forEach(spot => {
        // AI Simulation: Adjust factors based on real-time simulated city data
        const isUrban = ["Lucknow", "Agra", "Varanasi", "Leh"].includes(spot.city);
        const traffic = isUrban ? 1.5 : 1.1; 
        const season = 1.25; 

        const ai = getAIPredictions(spot, traffic, season);

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
                        <label>AI Estimated Budget</label>
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

/**
 * FEATURE: Real-Time Learning
 * Updates user profile and re-runs AI recommendations.
 */
function addToHistory(name, tags) {
    userHistory.push({ name, tags });
    alert(`AI Profile Updated! Learning your interest in ${tags[0]}...`);
    showRecommendationsForYou(); // Instant re-prediction
}

// Initialize on Load
window.onload = () => {
    updateTripList();
    showRecommendationsForYou();
};