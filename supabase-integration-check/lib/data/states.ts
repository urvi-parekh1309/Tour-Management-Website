import delhiData from "./delhi.json"
import maharashtraData from "./maharashtra.json"
import rajasthanData from "./rajasthan.json"
import punjabData from "./punjab.json"
import keralaData from "./kerala.json"
import goaData from "./goa.json"
import himachalData from "./himachal.json"
import gujaratData from "./gujarat.json"
import ladakhData from "./ladakh.json"
import westbengalData from "./westbengal.json"
import uttarpradeshData from "./uttarpradesh.json"

export interface Destination {
  id: string
  name: string
  city: string
  category: string
  coordinates: { latitude: string; longitude: string }
  budget_metrics: {
    base_stay_cost_per_day: number
    base_travel_cost: number
    seasonal_surge_factor: number
    traffic_delay_weight: number
  }
  entry_fee?: number
  avg_duration_hrs: number
  ai_metadata: {
    vibe_tags: string[]
    sentiment_score: number
    crowd_prediction_level?: string
    historical_significance_weight?: number
    best_suited_for: string[]
    description_ai: string
    image_url?: string
  }
}

export interface FoodItem {
  id: string
  name: string
  location: string
  type: "veg" | "non-veg"
  taste: "sweet" | "spicy"
  category: "famous" | "local"
  price_range: string
  description: string
  is_jain: boolean
  image_url?: string
}

export interface StateData {
  state: string
  destinations: Destination[]
  food?: FoodItem[]
}

export interface StateInfo {
  id: string
  name: string
  tagline: string
  image: string
  description: string
  rating: number
  color: string
  hasData: boolean
}

// States with full JSON data
const statesWithData: Record<string, StateData> = {
  delhi: delhiData as StateData,
  maharashtra: maharashtraData as StateData,
  rajasthan: rajasthanData as StateData,
  punjab: punjabData as StateData,
  kerala: keralaData as StateData,
  goa: goaData as StateData,
  "himachal-pradesh": himachalData as StateData,
  gujarat: gujaratData as StateData,
  ladakh: ladakhData as StateData,
  "west-bengal": westbengalData as StateData,
  "uttar-pradesh": uttarpradeshData as StateData,
}

export function getStateData(stateId: string): StateData | null {
  return statesWithData[stateId] || null
}

export function getStateFood(stateId: string): FoodItem[] {
  const data = getStateData(stateId)
  return data?.food || []
}

/**
 * Dynamic Cost Prediction ("AI" Logic)
 *
 * The formula:
 *   Total = (Travel x Traffic) + ((Stay + Meal) x Season) + Entry Fee
 *
 * Traffic Modeling: If interest is "Food" (local/busy spots), traffic factor bumps by 1.4x.
 * Seasonal Surges: Applies a seasonal_surge_factor (default 1.15, ~15% markup for peak seasons).
 * Crowd surcharge: High-crowd spots get extra 10-20% markup.
 */
export interface BudgetBreakdown {
  travel: number
  stay: number
  meals: number
  entryFee: number
  trafficMultiplier: number
  seasonalMultiplier: number
  crowdSurcharge: number
  total: number
}

export function getPredictiveBudget(
  dest: Destination,
  trafficFactor?: number,
  seasonalFactor?: number,
): number {
  return getBudgetBreakdown(dest, trafficFactor, seasonalFactor).total
}

export function getBudgetBreakdown(
  dest: Destination,
  trafficFactor?: number,
  seasonalFactor?: number,
): BudgetBreakdown {
  const baseTravel = dest.budget_metrics.base_travel_cost || 0
  const baseStay = dest.budget_metrics.base_stay_cost_per_day || 0
  const baseMeal = 200 * Math.ceil(dest.avg_duration_hrs / 2) // one meal per ~2 hrs on-site

  const traffic = trafficFactor || dest.budget_metrics.traffic_delay_weight || 1.1
  const season = seasonalFactor || dest.budget_metrics.seasonal_surge_factor || 1.15
  const entryFee = dest.entry_fee || 0

  // Crowd surcharge: high/extremely high gets 10-20%
  let crowdMult = 1
  const crowd = (dest.ai_metadata.crowd_prediction_level || "").toLowerCase()
  if (crowd.includes("extremely")) crowdMult = 1.2
  else if (crowd.includes("high")) crowdMult = 1.1

  const travelCost = Math.round(baseTravel * traffic)
  const stayCost = Math.round(baseStay * season * 0.15) // 15% of daily stay rate for the visit duration
  const mealCost = Math.round(baseMeal * season)
  const crowdSurcharge = Math.round((travelCost + stayCost + mealCost) * (crowdMult - 1))
  const total = travelCost + stayCost + mealCost + entryFee + crowdSurcharge

  return {
    travel: travelCost,
    stay: stayCost,
    meals: mealCost,
    entryFee,
    trafficMultiplier: traffic,
    seasonalMultiplier: season,
    crowdSurcharge,
    total,
  }
}

/**
 * Personalized Content Filtering based on "Taste Profile".
 * Maps user-selected interests + a taste vibe to keywords, then scores
 * destinations to create a curated experience.
 */
export type TasteVibe = "Heritage" | "Spicy" | "Nature" | "Adventure" | "Photography" | "Food"

export function getVibeKeywords(vibes: TasteVibe[]): string[] {
  const map: Record<TasteVibe, string[]> = {
    Heritage: ["Heritage", "UNESCO", "Historical", "Palaces", "Forts", "Mughal", "Temple", "Independence", "Military", "Spiritual", "Religious", "Architectural"],
    Food: ["Dining", "Cafe", "Bakery", "Food", "Irani", "Street", "Legendary", "Regional"],
    Spicy: ["Street", "Local", "Bustling", "Crowded", "Market", "Bazaar", "Chandni"],
    Adventure: ["Adventure", "Wildlife", "Safari", "Waterfalls", "Nature", "Beaches", "Coastal"],
    Photography: ["Scenic", "Photography", "Art", "Prehistoric", "Cultural", "Panoramic"],
    Nature: ["Nature", "Wildlife", "Waterfalls", "Beaches", "Coastal", "Eco", "National Park", "Garden"],
  }
  return vibes.flatMap((v) => map[v] || [])
}

/**
 * Get the recommended traffic factor for given interests.
 * If user likes "Food" or "Spicy" (local/busy spots), bump traffic to 1.4x.
 */
export function getTrafficFactorForInterests(interests: string[]): number {
  const busyInterests = ["Food", "Spicy"]
  if (interests.some((i) => busyInterests.includes(i))) return 1.4
  if (interests.includes("Adventure")) return 1.2
  return 1.1
}

/**
 * Build an optimized route from real destination data.
 * Picks top-rated destinations that match user interests, budget, AND duration.
 * Filters to keep total route cost within the user's budget.
 * Uses geographic proximity (greedy nearest-neighbour) for ordering.
 */
export function buildRoute(
  stateId: string,
  budget: number,
  interests: string[],
  duration: string = "3-5",
  maxStops: number = 8
): Destination[] {
  const data = getStateData(stateId)
  if (!data) return []

  // Determine max stops from duration
  let durationDays: number
  if (duration.includes("+")) {
    durationDays = 12
  } else {
    const parts = duration.split("-").map(Number)
    durationDays = parts[1] || parts[0]
  }

  // Scale stops: 1-2 days -> 3 stops, 3-5 -> 5, 6-10 -> 8, 10+ -> 12
  const stopsForDuration = durationDays <= 2 ? 3 : durationDays <= 5 ? 5 : durationDays <= 10 ? 8 : 12
  const effectiveMax = Math.min(stopsForDuration, maxStops, data.destinations.length)

  // Map our interest labels to likely category/vibe keywords
  const interestKeywords: Record<string, string[]> = {
    Heritage: ["Heritage", "UNESCO", "Historical", "Palaces", "Forts", "Mughal", "Temple", "Independence", "Military", "Spiritual", "Religious", "Architectural"],
    Food: ["Dining", "Cafe", "Bakery", "Food", "Irani", "Street", "Legendary", "Regional"],
    Adventure: ["Adventure", "Wildlife", "Safari", "Waterfalls", "Nature", "Beaches", "Coastal"],
    Photography: ["Scenic", "Photography", "Art", "Prehistoric", "Cultural"],
    Nature: ["Nature", "Wildlife", "Waterfalls", "Beaches", "Coastal", "Eco", "National Park"],
  }

  const keywords = interests.flatMap((i) => interestKeywords[i] || [])

  // Dynamic traffic factor based on interests
  const trafficFactor = getTrafficFactorForInterests(interests)

  // Score each destination
  const scored = data.destinations.map((d) => {
    let score = d.ai_metadata.sentiment_score * 10

    // Interest match bonus
    const catLower = d.category.toLowerCase()
    const vibeLower = d.ai_metadata.vibe_tags.map((v) => v.toLowerCase())
    for (const kw of keywords) {
      if (catLower.includes(kw.toLowerCase())) score += 5
      if (vibeLower.some((v) => v.includes(kw.toLowerCase()))) score += 3
    }

    // Budget match - strongly prefer cheaper places when budget is low
    const visitCost = getPredictiveBudget(d, trafficFactor)
    if (visitCost <= budget / effectiveMax) score += 8
    else if (visitCost <= budget / (effectiveMax / 2)) score += 3
    else score -= 5

    // Historical significance bonus
    if (d.ai_metadata.historical_significance_weight) {
      score += d.ai_metadata.historical_significance_weight * 0.5
    }

    return { destination: d, score, visitCost }
  })

  // Sort by score
  scored.sort((a, b) => b.score - a.score)

  // Greedily pick top places until budget is exhausted
  const picked: Destination[] = []
  let remaining = budget

  for (const item of scored) {
    if (picked.length >= effectiveMax) break
    if (item.visitCost <= remaining) {
      picked.push(item.destination)
      remaining -= item.visitCost
    }
  }

  // If we got very few picks, add cheapest remaining up to effectiveMax
  if (picked.length < Math.min(3, effectiveMax)) {
    const cheapest = scored
      .filter((s) => !picked.includes(s.destination))
      .sort((a, b) => a.visitCost - b.visitCost)
    for (const item of cheapest) {
      if (picked.length >= effectiveMax) break
      picked.push(item.destination)
    }
  }

  // Sort by nearest-neighbour greedy (latitude-based for simplicity)
  const sorted: Destination[] = []
  const remainingDests = [...picked]
  let current = remainingDests.shift()!
  if (!current) return []
  sorted.push(current)

  while (remainingDests.length > 0) {
    let nearestIdx = 0
    let nearestDist = Infinity
    for (let i = 0; i < remainingDests.length; i++) {
      const dist = Math.sqrt(
        Math.pow(parseFloat(remainingDests[i].coordinates.latitude) - parseFloat(current.coordinates.latitude), 2) +
        Math.pow(parseFloat(remainingDests[i].coordinates.longitude) - parseFloat(current.coordinates.longitude), 2)
      )
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = i
      }
    }
    current = remainingDests.splice(nearestIdx, 1)[0]
    sorted.push(current)
  }

  return sorted
}

/**
 * Get Unsplash image URL for any destination.
 * Uses the destination's ai_metadata.image_url if available,
 * otherwise generates a deterministic Unsplash search URL from the place name.
 */
export function getDestinationImageUrl(dest: Destination): string {
  if (dest.ai_metadata.image_url) return dest.ai_metadata.image_url
  // Construct an Unsplash source URL from the place name + city
  const query = encodeURIComponent(`${dest.name} ${dest.city} India landmark`)
  return `https://source.unsplash.com/800x600/?${query}`
}

/**
 * Get an image URL for a fallback place (no structured data).
 */
export function getFallbackPlaceImageUrl(name: string): string {
  const query = encodeURIComponent(`${name} India tourism landmark`)
  return `https://source.unsplash.com/800x600/?${query}`
}

// Curated image map for well-known Indian destinations (Unsplash direct links for reliable loading)
const curatedImages: Record<string, string> = {
  // Rajasthan
  "Amber Palace": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
  "City Palace": "https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800&q=80",
  "Mehrangarh Fort": "https://images.unsplash.com/photo-1586183189334-4c0e578091ec?w=800&q=80",
  "Jaisalmer Fort": "https://images.unsplash.com/photo-1621427639021-6d5b1f9f91d3?w=800&q=80",
  "Pushkar Lake": "https://images.unsplash.com/photo-1602508990787-2be1b05013fa?w=800&q=80",
  "Hawa Mahal": "https://images.unsplash.com/photo-1590080874088-3d8af75bccb6?w=800&q=80",
  "Ranthambore": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&q=80",
  "Chittorgarh": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  "Sam Sand Dunes": "https://images.unsplash.com/photo-1516477266410-9e31559ec1f4?w=800&q=80",
  "Nahargarh": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  "Kumbhalgarh": "https://images.unsplash.com/photo-1610025083553-5d8061c29e37?w=800&q=80",
  "Lake Pichola": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  "Dilwara": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
  "Junagarh Fort": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Ranakpur": "https://images.unsplash.com/photo-1590766940554-634b0e84a678?w=800&q=80",
  // Maharashtra
  "Gateway of India": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Ajanta Caves": "https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80",
  "Ellora Caves": "https://images.unsplash.com/photo-1590766940554-634b0e84a678?w=800&q=80",
  "Shaniwar Wada": "https://images.unsplash.com/photo-1564507592735-c96163e7ce42?w=800&q=80",
  "Marine Drive": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
  "Elephanta Caves": "https://images.unsplash.com/photo-1544735716-ea9ef790fcec?w=800&q=80",
  "Mahabaleshwar": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Lonar": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Sindhudurg": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Sula Vineyards": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
  "Tadoba": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
  "Bibi Ka Maqbara": "https://images.unsplash.com/photo-1585845526048-5da081af3ea3?w=800&q=80",
  // Fallback places - UP
  "Taj Mahal": "https://images.unsplash.com/photo-1564507592735-c96163e7ce42?w=800&q=80",
  "Varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
  "Agra Fort": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
  "Sarnath": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Fatehpur Sikri": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  // Kerala
  "Alleppey": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
  "Munnar": "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80",
  "Fort Kochi": "https://images.unsplash.com/photo-1580225469554-d4c9eb0a9e4e?w=800&q=80",
  "Periyar": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Kovalam": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  // Goa
  "Basilica of Bom Jesus": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Fort Aguada": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Dudhsagar": "https://images.unsplash.com/photo-1432405972618-c6b0cfba8624?w=800&q=80",
  "Palolem": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  // Punjab
  "Golden Temple": "https://images.unsplash.com/photo-1518929458119-e5bf444a2fb4?w=800&q=80",
  "Jallianwala Bagh": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Wagah": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  // Ladakh
  "Pangong": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
  "Nubra Valley": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Thiksey": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Khardung La": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  // West Bengal
  "Victoria Memorial": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80",
  "Howrah Bridge": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80",
  "Sundarbans": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Darjeeling": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  // Gujarat
  "Statue of Unity": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
  "Rann of Kutch": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Gir National Park": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
  "Somnath": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  // Himachal
  "Shimla": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Manali": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Rohtang": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Dharamshala": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Kasol": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  // Karnataka
  "Mysore Palace": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Hampi": "https://images.unsplash.com/photo-1590766940554-634b0e84a678?w=800&q=80",
  "Coorg": "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80",
  // Tamil Nadu
  "Meenakshi Temple": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Marina Beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "Ooty": "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80",
  // General
  "Konark": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Jagannath": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
  "Khajuraho": "https://images.unsplash.com/photo-1590766940554-634b0e84a678?w=800&q=80",
  "Sanchi": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80",
}

/**
 * Lookup curated image for a destination by partial name match.
 */
export function getCuratedImage(name: string): string | null {
  for (const [key, url] of Object.entries(curatedImages)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return url
  }
  return null
}

// All state info for the dashboard grid
export const allStates: StateInfo[] = [
  { id: "delhi", name: "Delhi", tagline: "Heart of India", image: "/images/landmarks/uttar-pradesh.jpg", description: "India's capital with Mughal heritage, bustling markets, and world-class museums.", rating: 4.8, color: "#FF9933", hasData: true },
  { id: "rajasthan", name: "Rajasthan", tagline: "Land of Kings", image: "/images/landmarks/rajasthan.jpg", description: "Home to magnificent forts, palaces, and the golden Thar Desert.", rating: 4.9, color: "#FF9933", hasData: true },
  { id: "maharashtra", name: "Maharashtra", tagline: "Where Dreams Take Flight", image: "/images/landmarks/maharashtra.jpg", description: "From Mumbai's skyline to Ajanta's ancient caves and lush Western Ghats.", rating: 4.7, color: "#FF9933", hasData: true },
  { id: "uttar-pradesh", name: "Uttar Pradesh", tagline: "Timeless Wonder", image: "/images/landmarks/uttar-pradesh.jpg", description: "Home to the Taj Mahal, sacred Varanasi, and Mughal heritage.", rating: 4.8, color: "#6B4423", hasData: true },
  { id: "kerala", name: "Kerala", tagline: "God's Own Country", image: "/images/landmarks/kerala.jpg", description: "Serene backwaters, tea gardens, and tropical beaches.", rating: 4.9, color: "#138808", hasData: true },
  { id: "goa", name: "Goa", tagline: "Sun, Sand & Heritage", image: "/images/landmarks/goa.jpg", description: "Beautiful beaches, Portuguese churches, and vibrant nightlife.", rating: 4.6, color: "#FF9933", hasData: true },
  { id: "punjab", name: "Punjab", tagline: "The Golden Land", image: "/images/landmarks/punjab.jpg", description: "The Golden Temple, Wagah Border, and rich Sikh heritage.", rating: 4.7, color: "#FF9933", hasData: true },
  { id: "ladakh", name: "Ladakh", tagline: "Land of High Passes", image: "/images/landmarks/ladakh.jpg", description: "High-altitude lakes, monasteries, and breathtaking mountain passes.", rating: 4.9, color: "#138808", hasData: true },
  { id: "karnataka", name: "Karnataka", tagline: "One State, Many Worlds", image: "/images/landmarks/karnataka.jpg", description: "Mysore Palace, Hampi ruins, and Coorg coffee estates.", rating: 4.7, color: "#6B4423", hasData: false },
  { id: "tamil-nadu", name: "Tamil Nadu", tagline: "Temple of Wonders", image: "/images/landmarks/tamil-nadu.jpg", description: "Ancient Dravidian temples, Marina Beach, and hill stations.", rating: 4.6, color: "#FF9933", hasData: false },
  { id: "west-bengal", name: "West Bengal", tagline: "City of Joy", image: "/images/landmarks/west-bengal.jpg", description: "Colonial Kolkata, Sundarbans mangroves, and Darjeeling tea.", rating: 4.5, color: "#138808", hasData: true },
  { id: "gujarat", name: "Gujarat", tagline: "Land of Legends", image: "/images/landmarks/gujarat.jpg", description: "Home to the world's tallest statue, white desert of Kutch, and Gir lions.", rating: 4.8, color: "#6B4423", hasData: true },
  { id: "madhya-pradesh", name: "Madhya Pradesh", tagline: "Heart of India", image: "/images/landmarks/madhya-pradesh.jpg", description: "Khajuraho temples, tiger reserves, and prehistoric cave art.", rating: 4.6, color: "#FF9933", hasData: false },
  { id: "himachal-pradesh", name: "Himachal Pradesh", tagline: "Snow-Capped Paradise", image: "/images/landmarks/himachal-pradesh.jpg", description: "Hill stations, adventure sports, and Himalayan monasteries.", rating: 4.8, color: "#138808", hasData: true },
  { id: "odisha", name: "Odisha", tagline: "Soul of India", image: "/images/landmarks/odisha.jpg", description: "Konark Sun Temple, Jagannath Puri, and pristine beaches.", rating: 4.5, color: "#6B4423", hasData: false },
]
