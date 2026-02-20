"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { allStates, buildRoute, getStateFood, getPredictiveBudget, getBudgetBreakdown, getTrafficFactorForInterests, type Destination, type StateInfo, type FoodItem, type BudgetBreakdown } from "@/lib/data/states"
import {
  MapPinIcon,
  IndianRupee,
  CalendarDays,
  Heart,
  Mountain,
  Utensils,
  Camera,
  Building,
  Trees,
  Compass,
  ArrowLeft,
  Star,
  Clock,
  CheckCircle2,
  Navigation,
  LogOut,
  Search,
  AlertCircle,
  Users,
  Wallet,
  Leaf,
  Flame,
  Filter,
  TrendingUp,
  Car,
  Bed,
  CookingPot,
  Ticket,
  BarChart3,
} from "lucide-react"

/* Lazy-load the Leaflet map so SSR doesn't break */
const RouteMap = dynamic(() => import("@/components/route-map"), { ssr: false })

/* ------------------------------------------------------------------ */
/*  Fallback routes for states without JSON data                       */
/* ------------------------------------------------------------------ */
interface FallbackPlace {
  name: string
  desc: string
  duration: string
  type: string
  lat: number
  lng: number
}

const fallbackRoutes: Record<string, FallbackPlace[]> = {
  "uttar-pradesh": [
    { name: "Taj Mahal, Agra", desc: "Crown jewel of India, this ivory-white marble mausoleum is a wonder of the world.", duration: "3 hrs", type: "Heritage", lat: 27.1751, lng: 78.0421 },
    { name: "Agra Fort", desc: "UNESCO-listed red sandstone fortress with palatial halls.", duration: "2.5 hrs", type: "Heritage", lat: 27.1795, lng: 78.0211 },
    { name: "Varanasi Ghats", desc: "Sacred bathing ghats along the Ganges, spiritual heart of India.", duration: "4 hrs", type: "Heritage", lat: 25.3176, lng: 83.0103 },
    { name: "Sarnath", desc: "Where Buddha gave his first sermon, featuring ancient ruins.", duration: "2 hrs", type: "Heritage", lat: 25.3814, lng: 83.0245 },
    { name: "Fatehpur Sikri", desc: "Mughal Emperor Akbar's abandoned capital city.", duration: "2.5 hrs", type: "Heritage", lat: 27.0940, lng: 77.6612 },
  ],
  kerala: [
    { name: "Alleppey Backwaters", desc: "Cruise through serene palm-fringed canals on a traditional houseboat.", duration: "5 hrs", type: "Nature", lat: 9.4981, lng: 76.3388 },
    { name: "Munnar Tea Gardens", desc: "Emerald carpet of tea plantations spread across misty mountains.", duration: "3 hrs", type: "Nature", lat: 10.0889, lng: 77.0595 },
    { name: "Fort Kochi", desc: "Charming colonial quarter with Chinese fishing nets and spice markets.", duration: "3 hrs", type: "Heritage", lat: 9.9658, lng: 76.2421 },
    { name: "Periyar Wildlife Sanctuary", desc: "Boat through a jungle lake spotting wild elephants.", duration: "4 hrs", type: "Nature", lat: 9.4637, lng: 77.1650 },
    { name: "Kovalam Beach", desc: "Crescent-shaped beach flanked by a lighthouse.", duration: "2 hrs", type: "Nature", lat: 8.4004, lng: 76.9783 },
  ],
  goa: [
    { name: "Basilica of Bom Jesus", desc: "UNESCO World Heritage baroque church.", duration: "1.5 hrs", type: "Heritage", lat: 15.5009, lng: 73.9116 },
    { name: "Fort Aguada", desc: "17th-century Portuguese fort with panoramic sea views.", duration: "2 hrs", type: "Heritage", lat: 15.4925, lng: 73.7735 },
    { name: "Dudhsagar Falls", desc: "Spectacular four-tiered waterfall cascading from 310m.", duration: "4 hrs", type: "Adventure", lat: 15.3144, lng: 74.3143 },
    { name: "Anjuna Flea Market", desc: "Vibrant market offering spices and handicrafts.", duration: "2 hrs", type: "Food", lat: 15.5735, lng: 73.7413 },
    { name: "Palolem Beach", desc: "Crescent-shaped paradise perfect for kayaking.", duration: "3 hrs", type: "Nature", lat: 15.0100, lng: 74.0232 },
  ],
  punjab: [
    { name: "Golden Temple, Amritsar", desc: "Holiest Sikh shrine surrounded by the sacred Amrit Sarovar.", duration: "3 hrs", type: "Heritage", lat: 31.6200, lng: 74.8765 },
    { name: "Jallianwala Bagh", desc: "Historic memorial garden commemorating the 1919 massacre.", duration: "1.5 hrs", type: "Heritage", lat: 31.6207, lng: 74.8800 },
    { name: "Wagah Border Ceremony", desc: "Electrifying daily flag-lowering ceremony.", duration: "2 hrs", type: "Heritage", lat: 31.6047, lng: 74.5737 },
    { name: "Partition Museum", desc: "First museum dedicated to the 1947 Partition.", duration: "2 hrs", type: "Heritage", lat: 31.6340, lng: 74.8723 },
    { name: "Langar at Golden Temple", desc: "World's largest free community kitchen.", duration: "1 hr", type: "Food", lat: 31.6200, lng: 74.8765 },
  ],
  ladakh: [
    { name: "Pangong Lake", desc: "Ethereal high-altitude lake with color-changing waters.", duration: "4 hrs", type: "Nature", lat: 33.7590, lng: 78.6720 },
    { name: "Nubra Valley", desc: "Valley of flowers with Bactrian camels and Diskit Monastery.", duration: "5 hrs", type: "Adventure", lat: 34.6870, lng: 77.5560 },
    { name: "Thiksey Monastery", desc: "12-story hilltop monastery resembling Potala Palace.", duration: "2 hrs", type: "Heritage", lat: 33.9133, lng: 77.6665 },
    { name: "Khardung La Pass", desc: "One of the world's highest motorable passes.", duration: "2 hrs", type: "Adventure", lat: 34.2816, lng: 77.6025 },
    { name: "Magnetic Hill", desc: "Mysterious gravity-defying hill.", duration: "1 hr", type: "Adventure", lat: 34.1701, lng: 77.5369 },
  ],
  karnataka: [
    { name: "Mysore Palace", desc: "Grand Indo-Saracenic palace illuminated by 97,000 bulbs.", duration: "3 hrs", type: "Heritage", lat: 12.3051, lng: 76.6551 },
    { name: "Hampi Ruins", desc: "UNESCO ruins of the Vijayanagara Empire among boulders.", duration: "5 hrs", type: "Heritage", lat: 15.3350, lng: 76.4600 },
    { name: "Coorg Coffee Plantations", desc: "Scotland of India with misty coffee estates.", duration: "4 hrs", type: "Nature", lat: 12.3375, lng: 75.8069 },
    { name: "Jog Falls", desc: "India's second-highest plunge waterfall at 253m.", duration: "2 hrs", type: "Nature", lat: 14.2295, lng: 74.8133 },
    { name: "Gol Gumbaz, Bijapur", desc: "World's second-largest dome with a whispering gallery.", duration: "2 hrs", type: "Heritage", lat: 16.8303, lng: 75.7350 },
  ],
  "tamil-nadu": [
    { name: "Meenakshi Temple, Madurai", desc: "Magnificent Dravidian temple with 14 gopurams.", duration: "3 hrs", type: "Heritage", lat: 9.9195, lng: 78.1193 },
    { name: "Marina Beach, Chennai", desc: "India's longest urban beach stretching 13km.", duration: "2 hrs", type: "Nature", lat: 13.0500, lng: 80.2824 },
    { name: "Mahabalipuram Shore Temple", desc: "7th-century UNESCO temple carved from granite.", duration: "2.5 hrs", type: "Heritage", lat: 12.6172, lng: 80.1993 },
    { name: "Ooty Hill Station", desc: "Queen of hill stations with botanical gardens.", duration: "4 hrs", type: "Nature", lat: 11.4102, lng: 76.6950 },
    { name: "Thanjavur Big Temple", desc: "1000-year-old Brihadeeswarar Temple.", duration: "2 hrs", type: "Heritage", lat: 10.7828, lng: 79.1318 },
  ],
  "west-bengal": [
    { name: "Victoria Memorial, Kolkata", desc: "Majestic white marble monument.", duration: "2.5 hrs", type: "Heritage", lat: 22.5448, lng: 88.3426 },
    { name: "Howrah Bridge", desc: "Iconic cantilever bridge over the Hooghly River.", duration: "1 hr", type: "Heritage", lat: 22.5851, lng: 88.3468 },
    { name: "Sundarbans Mangroves", desc: "UNESCO mangrove forest with Royal Bengal Tigers.", duration: "6 hrs", type: "Nature", lat: 21.9497, lng: 88.8996 },
    { name: "Darjeeling Tea Gardens", desc: "Himalayan estates producing world-famous Darjeeling tea.", duration: "3 hrs", type: "Nature", lat: 27.0360, lng: 88.2627 },
    { name: "Dakshineswar Kali Temple", desc: "19th-century temple associated with Ramakrishna.", duration: "2 hrs", type: "Heritage", lat: 22.6548, lng: 88.3578 },
  ],
  gujarat: [
    { name: "Statue of Unity", desc: "World's tallest statue at 182m.", duration: "3 hrs", type: "Heritage", lat: 21.8380, lng: 73.7191 },
    { name: "Rann of Kutch", desc: "Vast white salt desert under the full moon.", duration: "4 hrs", type: "Nature", lat: 23.7337, lng: 69.8597 },
    { name: "Gir National Park", desc: "Last refuge of over 600 Asiatic lions.", duration: "5 hrs", type: "Nature", lat: 21.1243, lng: 70.7938 },
    { name: "Somnath Temple", desc: "One of twelve Jyotirlinga shrines.", duration: "2 hrs", type: "Heritage", lat: 20.8880, lng: 70.4014 },
    { name: "Dwarka", desc: "Ancient city believed to be Lord Krishna's kingdom.", duration: "2 hrs", type: "Heritage", lat: 22.2394, lng: 68.9678 },
  ],
  "madhya-pradesh": [
    { name: "Khajuraho Temples", desc: "UNESCO temples famous for intricate sculptures.", duration: "3 hrs", type: "Heritage", lat: 24.8318, lng: 79.9199 },
    { name: "Bandhavgarh National Park", desc: "India's highest density of tigers.", duration: "5 hrs", type: "Nature", lat: 23.7239, lng: 80.9659 },
    { name: "Sanchi Stupa", desc: "Oldest stone structure commissioned by Ashoka.", duration: "2 hrs", type: "Heritage", lat: 23.4793, lng: 77.7399 },
    { name: "Bhimbetka Rock Shelters", desc: "30,000-year-old prehistoric cave paintings.", duration: "2.5 hrs", type: "Heritage", lat: 22.9373, lng: 77.6112 },
    { name: "Orchha", desc: "Forgotten Bundela capital with stunning cenotaphs.", duration: "3 hrs", type: "Heritage", lat: 25.3519, lng: 78.6415 },
  ],
  "himachal-pradesh": [
    { name: "Shimla Mall Road", desc: "Colonial-era promenade with Christ Church.", duration: "2 hrs", type: "Heritage", lat: 31.1048, lng: 77.1734 },
    { name: "Manali - Solang Valley", desc: "Adventure hub with paragliding and skiing.", duration: "4 hrs", type: "Adventure", lat: 32.3167, lng: 77.1500 },
    { name: "Rohtang Pass", desc: "High mountain pass at 3,978m.", duration: "3 hrs", type: "Adventure", lat: 32.3722, lng: 77.2478 },
    { name: "Dharamshala & McLeod Ganj", desc: "Home of the Dalai Lama.", duration: "3 hrs", type: "Heritage", lat: 32.2190, lng: 76.3234 },
    { name: "Kasol", desc: "Trekkers' paradise in the Parvati Valley.", duration: "3 hrs", type: "Adventure", lat: 32.0103, lng: 77.3143 },
  ],
  odisha: [
    { name: "Konark Sun Temple", desc: "13th-century UNESCO temple shaped as a chariot.", duration: "2.5 hrs", type: "Heritage", lat: 19.8876, lng: 86.0945 },
    { name: "Jagannath Temple, Puri", desc: "Sacred Hindu Char Dham pilgrimage site.", duration: "2 hrs", type: "Heritage", lat: 19.8048, lng: 85.8179 },
    { name: "Puri Beach", desc: "Sacred beach with golden sands.", duration: "2 hrs", type: "Nature", lat: 19.7983, lng: 85.8249 },
    { name: "Chilika Lake", desc: "Asia's largest brackish water lagoon.", duration: "4 hrs", type: "Nature", lat: 19.7267, lng: 85.3190 },
    { name: "Udayagiri Caves", desc: "2nd-century BCE Jain rock-cut caves.", duration: "2 hrs", type: "Heritage", lat: 20.2601, lng: 85.8384 },
  ],
}

/* ------------------------------------------------------------------ */
/*  Interests                                                          */
/* ------------------------------------------------------------------ */
const interests = [
  { label: "Adventure", icon: Mountain },
  { label: "Food", icon: Utensils },
  { label: "Photography", icon: Camera },
  { label: "Heritage", icon: Building },
  { label: "Nature", icon: Trees },
]

/* ------------------------------------------------------------------ */
/*  Crowd Level Badge                                                   */
/* ------------------------------------------------------------------ */
function CrowdBadge({ level }: { level?: string }) {
  if (!level) return null
  const l = level.toLowerCase()
  let color = "#138808"
  let bg = "#138808"
  if (l.includes("extreme") || l.includes("extremely high")) { color = "#DC2626"; bg = "#FEE2E2" }
  else if (l.includes("high")) { color = "#D97706"; bg = "#FEF3C7" }
  else if (l.includes("medium")) { color = "#138808"; bg = "#DCFCE7" }
  else if (l.includes("low")) { color = "#6B7280"; bg = "#F3F4F6" }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ color, background: bg }}>
      <Users className="w-3 h-3" />
      {level}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Food Section Component                                              */
/* ------------------------------------------------------------------ */
function FoodSection({ stateId }: { stateId: string }) {
  const food = getStateFood(stateId)
  const [typeFilter, setTypeFilter] = useState<"all" | "veg" | "non-veg" | "jain">("all")
  const [tasteFilter, setTasteFilter] = useState<"all" | "sweet" | "spicy">("all")
  const [catFilter, setCatFilter] = useState<"all" | "famous" | "local">("all")

  if (food.length === 0) return null

  const filtered = food.filter((f) => {
    if (typeFilter === "jain" && !f.is_jain) return false
    if (typeFilter === "veg" && f.type !== "veg") return false
    if (typeFilter === "non-veg" && f.type !== "non-veg") return false
    if (tasteFilter !== "all" && f.taste !== tasteFilter) return false
    if (catFilter !== "all" && f.category !== catFilter) return false
    return true
  })

  return (
    <div className="px-6 py-8 bg-[#FFF8F0]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Utensils className="w-5 h-5 text-[#FF9933]" />
          <h2 className="text-2xl font-serif font-bold text-[#3B2314]">Food Guide</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8B6F5A]" />
            <span className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">Type:</span>
          </div>
          {(["all", "veg", "non-veg", "jain"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                typeFilter === t
                  ? "border-[#FF9933] bg-[#FF9933]/10 text-[#6B4423]"
                  : "border-[#D4C0AA] bg-[#FFF8F0] text-[#8B6F5A] hover:border-[#FF9933]/40"
              }`}
            >
              {t === "all" ? "All" : t === "veg" ? "Veg" : t === "non-veg" ? "Non-Veg" : "Jain"}
            </button>
          ))}

          <div className="w-px h-6 bg-[#D4C0AA] mx-1" />

          <span className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">Taste:</span>
          {(["all", "sweet", "spicy"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTasteFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                tasteFilter === t
                  ? "border-[#FF9933] bg-[#FF9933]/10 text-[#6B4423]"
                  : "border-[#D4C0AA] bg-[#FFF8F0] text-[#8B6F5A] hover:border-[#FF9933]/40"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          <div className="w-px h-6 bg-[#D4C0AA] mx-1" />

          <span className="text-xs font-semibold text-[#8B6F5A] uppercase tracking-wider">Category:</span>
          {(["all", "famous", "local"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCatFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                catFilter === t
                  ? "border-[#FF9933] bg-[#FF9933]/10 text-[#6B4423]"
                  : "border-[#D4C0AA] bg-[#FFF8F0] text-[#8B6F5A] hover:border-[#FF9933]/40"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[#8B6F5A] text-sm">No food items match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f) => (
              <div key={f.id} className="rounded-xl border border-[#D4C0AA]/60 bg-[#F5E6D3]/40 overflow-hidden hover:shadow-md transition-all">
                <div className="relative h-36 bg-[#F5E6D3]">
                  <img
                    src={f.image_url || ""}
                    alt={f.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-[#FFF8F0] ${f.type === "veg" ? "bg-[#138808]" : "bg-[#DC2626]"}`}>
                      {f.type === "veg" ? "VEG" : "NON-VEG"}
                    </span>
                    {f.is_jain && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9933] text-[#FFF8F0]">JAIN</span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-[#FFF8F0] ${f.taste === "sweet" ? "bg-[#D97706]" : "bg-[#DC2626]"}`}>
                      {f.taste === "sweet" ? "Sweet" : "Spicy"}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-serif font-bold text-[#3B2314] leading-tight">{f.name}</h4>
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#6B4423]/10 text-[#6B4423]">
                      {f.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B6F5A] leading-relaxed mb-2">{f.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B6F5A]">{f.location}</span>
                    <span className="text-xs font-bold text-[#138808]">{"\u20B9"}{f.price_range}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AI Budget Breakdown Panel                                           */
/* ------------------------------------------------------------------ */
function BudgetBreakdownPanel({
  destinations,
  interests,
  totalBudget,
}: {
  destinations: Destination[]
  interests: string[]
  totalBudget: number
}) {
  if (destinations.length === 0) return null

  const trafficFactor = getTrafficFactorForInterests(interests)
  const breakdowns = destinations.map((d) => getBudgetBreakdown(d, trafficFactor))
  const totals = breakdowns.reduce(
    (acc, b) => ({
      travel: acc.travel + b.travel,
      stay: acc.stay + b.stay,
      meals: acc.meals + b.meals,
      entryFee: acc.entryFee + b.entryFee,
      crowdSurcharge: acc.crowdSurcharge + b.crowdSurcharge,
      total: acc.total + b.total,
    }),
    { travel: 0, stay: 0, meals: 0, entryFee: 0, crowdSurcharge: 0, total: 0 }
  )

  const withinBudget = totals.total <= totalBudget
  const remaining = totalBudget - totals.total

  const categories = [
    { label: "Travel", value: totals.travel, icon: Car, color: "#FF9933" },
    { label: "Stay", value: totals.stay, icon: Bed, color: "#6B4423" },
    { label: "Meals", value: totals.meals, icon: CookingPot, color: "#138808" },
    { label: "Entry Fees", value: totals.entryFee, icon: Ticket, color: "#D97706" },
  ]

  if (totals.crowdSurcharge > 0) {
    categories.push({ label: "Crowd Surcharge", value: totals.crowdSurcharge, icon: Users, color: "#DC2626" })
  }

  return (
    <div className="px-6 py-8 bg-[#F5E6D3]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5 text-[#FF9933]" />
          <h2 className="text-2xl font-serif font-bold text-[#3B2314]">AI Budget Prediction</h2>
        </div>
        <p className="text-sm text-[#8B6F5A] mb-6 ml-8">
          Dynamic cost prediction using traffic modeling ({`${trafficFactor}x`}) and seasonal surge ({`${(breakdowns[0]?.seasonalMultiplier || 1.15)}x`})
        </p>

        {/* Formula display */}
        <div className="rounded-xl border border-[#D4C0AA]/60 bg-[#FFF8F0] p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8B6F5A] mb-3">Prediction Formula</p>
          <p className="text-sm font-mono text-[#3B2314] leading-relaxed">
            {'Total = (Travel \u00D7 Traffic) + ((Stay + Meal) \u00D7 Season) + Entry Fee + Crowd Surcharge'}
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#FF9933]/10 text-[#FF9933]">
              Traffic: {trafficFactor}x {interests.includes("Food") ? "(Food spots)" : interests.includes("Adventure") ? "(Adventure)" : "(Standard)"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#138808]/10 text-[#138808]">
              Seasonal: {breakdowns[0]?.seasonalMultiplier || 1.15}x
            </span>
            {totals.crowdSurcharge > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#DC2626]/10 text-[#DC2626]">
                Crowd Surcharge Applied
              </span>
            )}
          </div>
        </div>

        {/* Category breakdown bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {categories.map((cat) => {
            const pct = totals.total > 0 ? Math.round((cat.value / totals.total) * 100) : 0
            const Icon = cat.icon
            return (
              <div key={cat.label} className="rounded-xl border border-[#D4C0AA]/60 bg-[#FFF8F0] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    <span className="text-sm font-medium text-[#3B2314]">{cat.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: cat.color }}>{"\u20B9"}{cat.value.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F5E6D3] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: cat.color }}
                  />
                </div>
                <p className="text-[10px] text-[#8B6F5A] mt-1">{pct}% of total</p>
              </div>
            )
          })}
        </div>

        {/* Total + budget comparison */}
        <div className={`rounded-xl border-2 p-5 ${withinBudget ? "border-[#138808] bg-[#138808]/5" : "border-[#D97706] bg-[#D97706]/5"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8B6F5A] mb-1">Predicted Total</p>
              <p className="text-2xl font-serif font-bold text-[#3B2314]">{"\u20B9"}{totals.total.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8B6F5A] mb-1">Your Budget</p>
              <p className="text-2xl font-serif font-bold text-[#3B2314]">{"\u20B9"}{totalBudget.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: withinBudget ? "#138808" : "#D97706" }} />
            <span className="text-sm font-medium" style={{ color: withinBudget ? "#138808" : "#D97706" }}>
              {withinBudget
                ? `Within budget! \u20B9${remaining.toLocaleString("en-IN")} remaining`
                : `\u20B9${Math.abs(remaining).toLocaleString("en-IN")} over budget \u2014 consider fewer stops`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  State Detail View                                                   */
/* ------------------------------------------------------------------ */
function StateDetailView({
  state,
  routeDestinations,
  fallbackPlaces,
  budget,
  duration,
  interests: userInterests,
  onBack,
}: {
  state: StateInfo
  routeDestinations: Destination[]
  fallbackPlaces: FallbackPlace[]
  budget: number
  duration: string
  interests: string[]
  onBack: () => void
}) {
  const hasRealData = routeDestinations.length > 0
  const trafficFactor = getTrafficFactorForInterests(userInterests)
  const places = hasRealData
    ? routeDestinations.map((d) => ({
        name: `${d.name}, ${d.city}`,
        desc: d.ai_metadata.description_ai,
        duration: `${d.avg_duration_hrs} hrs`,
        durationHrs: d.avg_duration_hrs,
        type: d.category.split("/")[0].split("&")[0].trim(),
        lat: parseFloat(d.coordinates.latitude),
        lng: parseFloat(d.coordinates.longitude),
        crowd: d.ai_metadata.crowd_prediction_level,
        imageUrl: d.ai_metadata.image_url,
        entryFee: d.entry_fee || 0,
        budgetPerDay: getPredictiveBudget(d, trafficFactor),
        vibes: d.ai_metadata.vibe_tags,
        bestFor: d.ai_metadata.best_suited_for,
      }))
    : fallbackPlaces.map((p) => ({
        ...p,
        durationHrs: parseFloat(p.duration) || 2,
        crowd: undefined as string | undefined,
        imageUrl: undefined as string | undefined,
        entryFee: 0,
        budgetPerDay: 0,
        vibes: [] as string[],
        bestFor: [] as string[],
      }))

  // Group places into days based on duration
  const durationDays = duration.includes("+") ? 12 : parseInt(duration.split("-")[1] || duration.split("-")[0])
  const totalHrs = places.reduce((sum, p) => sum + p.durationHrs, 0)
  const hrsPerDay = Math.max(6, totalHrs / Math.max(1, durationDays))

  const days: Array<typeof places> = []
  let currentDay: typeof places = []
  let currentHrs = 0

  places.forEach((place) => {
    if (currentHrs + place.durationHrs > hrsPerDay && currentDay.length > 0) {
      days.push(currentDay)
      currentDay = []
      currentHrs = 0
    }
    currentDay.push(place)
    currentHrs += place.durationHrs
  })
  if (currentDay.length > 0) days.push(currentDay)

  // Budget per day
  const totalBudget = places.reduce((sum, p) => sum + p.budgetPerDay, 0) || budget
  const budgetPerDay = Math.round(totalBudget / Math.max(1, days.length))

  return (
    <div className="absolute inset-0 z-20 bg-[#F5E6D3] overflow-y-auto" style={{ animation: "fadeScaleIn 0.5s ease-out forwards" }}>
      {/* ---- Hero section ---- */}
      <div className="relative min-h-[60vh] flex items-center px-6 py-8">
        <button
          onClick={onBack}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF8F0]/90 backdrop-blur-sm border border-[#D4C0AA] text-sm font-medium text-[#3B2314] hover:bg-[#FFF8F0] transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </button>

        <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF8F0]/90 border border-[#D4C0AA] text-[#FF9933]">
            {`Budget: \u20B9${budget.toLocaleString("en-IN")}`}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF8F0]/90 border border-[#D4C0AA] text-[#138808]">
            {`${days.length} Days Itinerary`}
          </span>
        </div>

        {/* Left - State info */}
        <div className="w-[28%] flex flex-col justify-center pr-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8B6F5A] mb-3 font-medium">Explore</p>
          <h2 className="text-4xl font-serif font-bold text-[#3B2314] leading-tight mb-3">{state.name}</h2>
          <p className="text-sm text-[#8B6F5A] leading-relaxed mb-6">{state.description}</p>
          <div className="flex items-center gap-1 text-[#FF9933]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.floor(state.rating) ? "fill-current" : ""}`} />
            ))}
            <span className="ml-2 text-xs text-[#8B6F5A]">{state.rating} / 5</span>
          </div>
        </div>

        {/* Center - Large arch image */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="relative w-full max-w-[380px] h-[420px] overflow-hidden shadow-xl"
            style={{ borderRadius: "50% 50% 4% 4% / 30% 30% 2% 2%" }}
          >
            <Image src={state.image} alt={state.name} fill className="object-cover" sizes="(max-width: 1200px) 40vw, 380px" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#3B2314]/60 to-transparent" />
            <div className="absolute bottom-6 inset-x-0 text-center">
              <p className="text-lg font-serif font-bold text-[#FFF8F0] drop-shadow-lg">
                {places[0]?.name.split(",")[0] || state.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right - Tagline */}
        <div className="w-[25%] flex flex-col justify-center items-end text-right pl-4">
          <p className="text-3xl font-serif italic text-[#6B4423] leading-snug">{state.tagline}</p>
        </div>
      </div>

      {/* Destination chips */}
      <div className="px-6 pb-4">
        <div className="max-w-4xl mx-auto flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {places.map((place) => (
            <div key={place.name} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-[#FFF8F0] border border-[#D4C0AA]/60 text-xs font-medium text-[#6B4423]">
              <MapPinIcon className="w-3 h-3 text-[#FF9933]" />
              {place.name.split(",")[0]}
            </div>
          ))}
        </div>
      </div>

      <div className="h-0.5 mx-6" style={{ background: "linear-gradient(to right, transparent, #D4C0AA, transparent)" }} />

      {/* Live Map */}
      <div className="px-6 py-6 bg-[#F5E6D3]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Navigation className="w-5 h-5 text-[#FF9933]" />
            <h2 className="text-xl font-serif font-bold text-[#3B2314]">Route Map</h2>
            <span className="text-xs text-[#8B6F5A]">Live OpenStreetMap</span>
          </div>
          <div className="rounded-2xl overflow-hidden border-2 border-[#D4C0AA] shadow-lg" style={{ height: 380 }}>
            <RouteMap
              markers={places.map((p, i) => ({ lat: p.lat, lng: p.lng, label: `${i + 1}. ${p.name.split(",")[0]}` }))}
            />
          </div>
        </div>
      </div>

      <div className="h-0.5 mx-6" style={{ background: "linear-gradient(to right, transparent, #D4C0AA, transparent)" }} />

      {/* Day-wise Itinerary */}
      <div className="px-6 py-8 bg-[#F5E6D3]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-5 h-5 text-[#FF9933]" />
            <h2 className="text-2xl font-serif font-bold text-[#3B2314]">Day-wise Itinerary</h2>
          </div>
          <p className="text-sm text-[#8B6F5A] mb-6 ml-8">{`${days.length}-day plan with ${places.length} stops | Approx. \u20B9${budgetPerDay.toLocaleString("en-IN")} / day`}</p>

          {days.map((dayPlaces, dayIdx) => {
            const dayBudget = dayPlaces.reduce((sum, p) => sum + p.budgetPerDay, 0)
            return (
              <div key={dayIdx} className="mb-8" style={{ animation: `slideUp 0.4s ease-out ${dayIdx * 0.1}s both` }}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-[#FFF8F0]" style={{ background: "#FF9933" }}>
                    {`D${dayIdx + 1}`}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold text-[#3B2314]">Day {dayIdx + 1}</h3>
                    <p className="text-xs text-[#8B6F5A]">
                      {dayPlaces.length} {dayPlaces.length === 1 ? "place" : "places"} to visit
                    </p>
                  </div>
                  {dayBudget > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8F0] border border-[#D4C0AA]/60">
                      <Wallet className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span className="text-xs font-bold text-[#6B4423]">{"\u20B9"}{dayBudget.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                {/* Day places */}
                <div className="flex flex-col gap-4 ml-5 pl-8 border-l-2 border-[#D4C0AA]">
                  {dayPlaces.map((place, i) => (
                    <div
                      key={place.name}
                      className="relative rounded-2xl border border-[#D4C0AA]/60 bg-[#FFF8F0] overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[41px] top-6 w-4 h-4 rounded-full border-2 border-[#FF9933] bg-[#FFF8F0] z-10" />

                      <div className="flex">
                        {/* Place Image */}
                        {place.imageUrl && (
                          <div className="relative w-48 min-h-[160px] flex-shrink-0 bg-[#F5E6D3]">
                            <img
                              src={place.imageUrl}
                              alt={place.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#3B2314]/10" />
                          </div>
                        )}

                        {/* Place details */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-base font-serif font-bold text-[#3B2314]">{place.name}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#8B6F5A]" />
                                <span className="text-xs text-[#8B6F5A] font-medium">{place.duration}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-[#8B6F5A] leading-relaxed mb-3">{place.desc}</p>

                          {/* Tags row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#FF9933]/10 text-[#FF9933]">{place.type}</span>
                            {place.crowd && <CrowdBadge level={place.crowd} />}
                            {place.entryFee > 0 && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#6B4423]/10 text-[#6B4423]">
                                Entry: {"\u20B9"}{place.entryFee}
                              </span>
                            )}
                            {place.budgetPerDay > 0 && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#138808]/10 text-[#138808]">
                                Budget: {"\u20B9"}{place.budgetPerDay.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          {/* Vibe tags */}
                          {place.vibes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {place.vibes.slice(0, 4).map((v) => (
                                <span key={v} className="px-2 py-0.5 rounded text-[9px] font-medium bg-[#F5E6D3] text-[#8B6F5A]">
                                  {v.replace(/-/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Route complete */}
          <div className="flex gap-4 mt-4">
            <div className="flex flex-col items-center w-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#138808]">
                <CheckCircle2 className="w-5 h-5 text-[#FFF8F0]" />
              </div>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-sm font-medium text-[#138808]">
                Itinerary Complete! Estimated total: {"\u20B9"}{(totalBudget || budget).toLocaleString("en-IN")} for {days.length} days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-0.5 mx-6" style={{ background: "linear-gradient(to right, transparent, #D4C0AA, transparent)" }} />

      {/* Food Section */}
      <FoodSection stateId={state.id} />

      <div className="h-0.5 mx-6" style={{ background: "linear-gradient(to right, transparent, #D4C0AA, transparent)" }} />

      {/* AI Budget Breakdown */}
      <BudgetBreakdownPanel
        destinations={routeDestinations}
        interests={userInterests}
        totalBudget={budget}
      />

      <style jsx>{`
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */
export function Dashboard() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [budget, setBudget] = useState(10000)
  const [duration, setDuration] = useState("3-5")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Heritage", "Food"])
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null)
  const [routeGenerated, setRouteGenerated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pendingGenerate = useRef(false)

  useEffect(() => {
    if (isAuthenticated && pendingGenerate.current && selectedStateId) {
      pendingGenerate.current = false
      setRouteGenerated(true)
    }
  }, [isAuthenticated, selectedStateId])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const selectedState = allStates.find((s) => s.id === selectedStateId) || null

  // Build route from real data or use fallback
  const routeDestinations = useMemo(() => {
    if (!selectedStateId || !routeGenerated) return []
    const state = allStates.find((s) => s.id === selectedStateId)
    if (!state?.hasData) return []
    return buildRoute(selectedStateId, budget, selectedInterests, duration)
  }, [selectedStateId, routeGenerated, budget, selectedInterests, duration])

  const fallbackPlaces = useMemo(() => {
    if (!selectedStateId || !routeGenerated) return []
    const state = allStates.find((s) => s.id === selectedStateId)
    if (state?.hasData) return []
    return fallbackRoutes[selectedStateId] || []
  }, [selectedStateId, routeGenerated])

  const handleStateClick = (stateId: string) => {
    if (routeGenerated) return
    setSelectedStateId(stateId === selectedStateId ? null : stateId)
  }

  const handleGenerateRoute = () => {
    if (!selectedStateId) return
    if (!isAuthenticated) {
      pendingGenerate.current = true
      setShowAuth(true)
      return
    }
    setRouteGenerated(true)
  }

  const handleBackToMap = () => {
    setRouteGenerated(false)
    setSelectedStateId(null)
  }

  const filteredStates = allStates.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5E6D3" }}>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-3 bg-[#FFF8F0]/80 backdrop-blur-md border-b border-[#D4C0AA] shadow-sm relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FF9933" }}>
            <Compass className="w-5 h-5 text-[#FFF8F0]" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-[#3B2314] leading-tight">Smart Travel Planner</h1>
            <p className="text-[10px] text-[#8B6F5A] tracking-widest uppercase">Ministry of Tourism, Govt. of India</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#FFF8F0]" style={{ background: "#6B4423" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#3B2314] hidden md:inline">{user?.name}</span>
              </div>
              <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-[#8B6F5A] hover:text-[#FF9933] transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="h-9 px-4 rounded-full text-sm font-medium text-[#FFF8F0] transition-colors" style={{ background: "#6B4423" }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Preferences */}
        <aside className="w-[320px] min-w-[320px] bg-[#FFF8F0] border-r border-[#D4C0AA] p-5 overflow-y-auto relative z-10">
          <div className="mb-5">
            <h2 className="text-xl font-serif font-bold text-[#3B2314] mb-1">Plan Your Journey</h2>
            <p className="text-xs text-[#8B6F5A]">Set preferences, pick a state, then generate your route.</p>
          </div>

          {/* Budget */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#3B2314] mb-2">
              <IndianRupee className="w-4 h-4 text-[#FF9933]" /> Budget
            </label>
            <input
              type="range" min={1000} max={100000} step={1000} value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #FF9933 ${((budget - 1000) / 99000) * 100}%, #D4C0AA ${((budget - 1000) / 99000) * 100}%)` }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[#8B6F5A]">{"1,000"}</span>
              <span className="text-sm font-bold text-[#6B4423]">{"\u20B9"}{budget.toLocaleString("en-IN")}</span>
              <span className="text-xs text-[#8B6F5A]">{"1,00,000"}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#3B2314] mb-2">
              <CalendarDays className="w-4 h-4 text-[#FF9933]" /> Duration
            </label>
            <select
              value={duration} onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D4C0AA] bg-[#FFF8F0] text-[#3B2314] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition-all"
            >
              <option value="1-2">1-2 Days (Weekend)</option>
              <option value="3-5">3-5 Days (Short Trip)</option>
              <option value="6-10">6-10 Days (Extended)</option>
              <option value="10+">{"10+ Days (Grand Tour)"}</option>
            </select>
          </div>

          {/* Interests */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#3B2314] mb-2">
              <Heart className="w-4 h-4 text-[#FF9933]" /> Interests
            </label>
            <div className="grid grid-cols-2 gap-2">
              {interests.map(({ label, icon: Icon }) => {
                const isSelected = selectedInterests.includes(label)
                return (
                  <button
                    key={label} onClick={() => toggleInterest(label)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected ? "border-[#FF9933] bg-[#FF9933]/10 text-[#6B4423]" : "border-[#D4C0AA] bg-[#FFF8F0] text-[#8B6F5A] hover:border-[#FF9933]/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected state indicator */}
          {selectedState && !routeGenerated && (
            <div className="mb-4 p-3 rounded-xl border-2 border-[#FF9933] bg-[#FF9933]/5">
              <div className="flex items-center gap-2 mb-1">
                <MapPinIcon className="w-4 h-4 text-[#FF9933]" />
                <span className="text-xs font-semibold text-[#3B2314]">Selected State</span>
                {selectedState.hasData && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#138808]/10 text-[#138808] uppercase">Live Data</span>
                )}
              </div>
              <p className="text-base font-serif font-bold text-[#6B4423] ml-6">{selectedState.name}</p>
              <p className="text-xs text-[#8B6F5A] ml-6">{selectedState.tagline}</p>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerateRoute}
            disabled={!selectedStateId || routeGenerated}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              selectedStateId && !routeGenerated ? "text-[#FFF8F0] hover:shadow-lg active:scale-[0.98]" : "text-[#8B6F5A] cursor-not-allowed"
            }`}
            style={{ background: selectedStateId && !routeGenerated ? "#6B4423" : "#D4C0AA" }}
          >
            {!selectedStateId
              ? "Select a state on the map"
              : routeGenerated
              ? "Route Generated"
              : !isAuthenticated
              ? "Sign In & Generate Route"
              : "Generate Route"}
          </button>

          {routeGenerated && (
            <button
              onClick={handleBackToMap}
              className="w-full mt-3 py-2.5 rounded-xl border border-[#D4C0AA] text-sm font-medium text-[#6B4423] hover:bg-[#F5E6D3] transition-colors"
            >
              Plan Another Trip
            </button>
          )}

          {/* Quick Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: "Destinations", value: "500+" },
              { label: "Routes", value: "2,000+" },
              { label: "Users", value: "50K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2.5 rounded-xl bg-[#F5E6D3]/60 border border-[#D4C0AA]/50">
                <div className="text-base font-bold text-[#6B4423]">{stat.value}</div>
                <div className="text-[9px] text-[#8B6F5A] uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Panel */}
        <main className="flex-1 relative overflow-hidden">
          {routeGenerated && selectedState && (
            <StateDetailView
              state={selectedState}
              routeDestinations={routeDestinations}
              fallbackPlaces={fallbackPlaces}
              budget={budget}
              duration={duration}
              interests={selectedInterests}
              onBack={handleBackToMap}
            />
          )}

          {!routeGenerated && (
            <div className="absolute inset-0 bg-[#FFF8F0] flex flex-col">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-[#D4C0AA] bg-[#FFF8F0]">
                <div className="flex items-center gap-2 flex-1">
                  <MapPinIcon className="w-4 h-4 text-[#FF9933]" />
                  <span className="text-sm font-semibold text-[#3B2314]">Incredible India</span>
                </div>
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B6F5A]" />
                  <input
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search states..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D4C0AA] bg-[#F5E6D3]/50 text-sm text-[#3B2314] placeholder:text-[#D4C0AA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition-all"
                  />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#FF9933]/10 text-[#FF9933]">
                  {allStates.length} states
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
                  <Image src="/images/india-map.webp" alt="" width={600} height={750} className="h-full w-auto object-contain" />
                </div>

                <div className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStates.map((state, i) => {
                    const isSelected = selectedStateId === state.id
                    return (
                      <button
                        key={state.id} onClick={() => handleStateClick(state.id)}
                        className={`group relative text-left rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                          isSelected
                            ? "border-[#FF9933] bg-[#FF9933]/5 shadow-md ring-2 ring-[#FF9933]/20"
                            : "border-[#D4C0AA]/60 bg-[#FFF8F0] hover:border-[#FF9933]/40"
                        }`}
                        style={{ animation: `fadeUp 0.3s ease-out ${i * 0.04}s both` }}
                      >
                        <div className="relative h-28 overflow-hidden">
                          <Image src={state.image} alt={state.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 1200px) 33vw, 25vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#3B2314]/70 via-transparent to-transparent" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF9933] flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-[#FFF8F0]" />
                            </div>
                          )}
                          {state.hasData && (
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#138808] text-[#FFF8F0] uppercase">
                              Live Data
                            </div>
                          )}
                          <div className="absolute bottom-2 left-3 right-3">
                            <p className="text-sm font-serif font-bold text-[#FFF8F0] drop-shadow-lg">{state.name}</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-[#8B6F5A] leading-relaxed mb-2 line-clamp-2">{state.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium italic text-[#6B4423]">{state.tagline}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-[#FF9933] fill-[#FF9933]" />
                              <span className="text-[10px] font-medium text-[#8B6F5A]">{state.rating}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {filteredStates.length === 0 && (
                  <div className="relative z-10 flex flex-col items-center justify-center py-20">
                    <Search className="w-12 h-12 text-[#D4C0AA] mb-4" />
                    <p className="text-sm text-[#8B6F5A]">{"No states found for \""}{searchQuery}{"\""}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#D4C0AA] px-5 py-2.5 bg-[#FFF8F0] flex items-center justify-between">
                <p className="text-xs text-[#8B6F5A]">
                  {selectedStateId
                    ? `${selectedState?.name} selected \u2014 click "Generate Route" to create your itinerary`
                    : "Select a state to plan your trip"}
                </p>
                <p className="text-xs text-[#8B6F5A]">Powered by AI</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
