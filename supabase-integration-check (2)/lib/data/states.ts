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
