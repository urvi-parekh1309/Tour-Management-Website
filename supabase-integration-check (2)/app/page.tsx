"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Dashboard } from "@/components/dashboard"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import {
  Compass,
  ChevronDown,
  MapPinIcon,
  Sparkles,
  Route,
  Wallet,
  TreePalm,
  Star,
  Phone,
  Mail,
  MapPin as MapPinLucide,
  ArrowRight,
} from "lucide-react"

type Phase = "landing" | "zooming" | "dashboard"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Itinerary",
    desc: "Smart algorithms craft personalized routes based on your preferences and budget.",
  },
  {
    icon: Wallet,
    title: "Budget Optimization",
    desc: "Get the most out of every rupee with cost-effective travel suggestions.",
  },
  {
    icon: TreePalm,
    title: "Local Experiences",
    desc: "Discover hidden gems and authentic cultural experiences off the beaten path.",
  },
  {
    icon: Route,
    title: "Smart Routing",
    desc: "Optimized travel sequences that save time and cover the best landmarks.",
  },
]

const destinations = [
  { name: "Rajasthan", tagline: "Land of Kings", color: "#FF9933", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80" },
  { name: "Kerala", tagline: "God's Own Country", color: "#138808", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80" },
  { name: "Goa", tagline: "Sun, Sand & Heritage", color: "#FF9933", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80" },
  { name: "Ladakh", tagline: "Land of High Passes", color: "#138808", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80" },
  { name: "Tamil Nadu", tagline: "Temple of Wonders", color: "#FF9933", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80" },
  { name: "Himachal Pradesh", tagline: "Snow-Capped Paradise", color: "#138808", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80" },
]

const steps = [
  { step: "01", title: "Set Preferences", desc: "Choose your budget, duration, and interests to personalize your trip." },
  { step: "02", title: "Pick Your State", desc: "Select a destination on our interactive India map to explore." },
  { step: "03", title: "Get Your Route", desc: "Receive an AI-generated itinerary with famous places and optimal paths." },
]

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    quote: "The AI planner created the perfect Rajasthan itinerary. Every stop was incredible and within my budget!",
    rating: 5,
  },
  {
    name: "Arjun Patel",
    location: "Mumbai",
    quote: "I discovered hidden gems in Kerala I never would have found on my own. This tool is a game-changer.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    location: "Bangalore",
    quote: "Planning a 10-day trip used to take weeks. With Smart Travel Planner, it took minutes!",
    rating: 4,
  },
]

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing")
  const [showAuth, setShowAuth] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleGetStarted = () => {
    setPhase("zooming")
    setTimeout(() => {
      setPhase("dashboard")
    }, 1000)
  }

  const scrollToContent = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (phase === "dashboard") {
    return (
      <div className="animate-fade-in">
        <Dashboard />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5E6D3" }}>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative h-screen overflow-hidden">
        {/* Header */}
        <header className="relative z-40 flex items-center justify-between px-6 md:px-10 py-4 bg-[#FFF8F0]/70 backdrop-blur-md border-b border-[#D4C0AA]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: "#FF9933" }}>
              <Compass className="w-5 h-5 text-[#FFF8F0]" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-[#3B2314] leading-tight">Smart Travel Planner</h1>
              <p className="text-[10px] text-[#8B6F5A] tracking-widest uppercase">Ministry of Tourism, Govt. of India</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-[#6B4423] font-medium hover:text-[#FF9933] transition-colors">Features</a>
            <a href="#destinations" className="text-sm text-[#6B4423] font-medium hover:text-[#FF9933] transition-colors">Destinations</a>
            <a href="#contact" className="text-sm text-[#6B4423] font-medium hover:text-[#FF9933] transition-colors">Contact</a>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#FFF8F0]" style={{ background: "#6B4423" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={signOut} className="text-sm text-[#8B6F5A] hover:text-[#FF9933] transition-colors">Sign Out</button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="h-9 px-5 rounded-full text-sm font-medium text-[#FFF8F0] transition-all hover:shadow-lg hover:scale-105"
                style={{ background: "#6B4423" }}
              >
                Sign In
              </button>
            )}
          </nav>
        </header>

        {/* Zoom overlay */}
        {phase === "zooming" && (
          <div className="absolute inset-0 z-[60] animate-zoom-fade" />
        )}

        {/* Main hero content - Girl on LEFT, text on RIGHT */}
        <div
          className={`relative flex h-[calc(100%-64px)] transition-all duration-700 ${
            phase === "zooming" ? "opacity-0 scale-90" : "opacity-100"
          }`}
        >
          {/* Left side - Traveler image, anchored to bottom */}
          <div className="relative w-[40%] h-full flex items-end justify-start">
            <Image
              src="/images/traveler.png"
              alt="Traveler with backpack ready to explore India"
              width={500}
              height={700}
              className="h-[85%] w-auto object-contain drop-shadow-xl relative z-10 ml-4 md:ml-10"
              priority
            />
            {/* Stats below the girl - stacked vertically */}
            <div className="absolute bottom-8 left-4 md:left-6 flex flex-col gap-3 z-20">
              {[
                { value: "500+", label: "Destinations" },
                { value: "AI", label: "Powered Routes" },
                { value: "50K+", label: "Happy Travelers" },
              ].map((badge, i) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#FFF8F0]/90 backdrop-blur-sm border border-[#D4C0AA]/60 shadow-sm w-56"
                  style={{ animation: `slideInUp 0.6s ease-out ${0.3 + i * 0.15}s both` }}
                >
                  <span className="text-base font-bold text-[#FF9933]">{badge.value}</span>
                  <span className="text-sm text-[#8B6F5A] font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compass star decoration - top right */}
          <div className="absolute top-6 right-10 z-10 opacity-20">
            <svg width="100" height="100" viewBox="0 0 80 80" fill="none">
              <path d="M40 0L42 38L80 40L42 42L40 80L38 42L0 40L38 38Z" fill="#8B6F5A" />
              <path d="M40 12L41 38L68 40L41 42L40 68L39 42L12 40L39 38Z" fill="#6B4423" />
            </svg>
          </div>

          {/* Right side - Text content, right-aligned */}
          <div className="flex-1 flex flex-col justify-center items-end text-right px-8 md:px-14 pb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[#8B6F5A] mb-5 font-medium">Incredible India</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-[#3B2314] leading-tight mb-6 text-balance">
              Plan Your{" "}
              <br className="hidden md:block" />
              Smart{" "}
              <span className="text-[#FF9933] italic">Journey</span>
            </h2>
            <p className="text-base md:text-lg text-[#8B6F5A] mb-10 leading-relaxed max-w-md">
              AI-powered personalized travel planning across Incredible India. Discover hidden gems, optimize routes, and travel smarter.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-[#FFF8F0] font-semibold text-base transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                style={{ background: "#6B4423" }}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        {phase === "landing" && (
          <button
            onClick={scrollToContent}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-[#8B6F5A] hover:text-[#6B4423] transition-colors"
          >
            <span className="text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        )}
      </section>

      {/* ===== SCROLLABLE SECTIONS ===== */}
      {phase === "landing" && (
        <>
          {/* Features Section */}
          <section id="features" ref={scrollRef} className="py-20 px-6 md:px-12 lg:px-20" style={{ background: "#FFF8F0" }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs uppercase tracking-[0.3em] text-[#FF9933] font-semibold mb-3">Why Choose Us</p>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2314] mb-4 text-balance">
                  Smart Features for Smart Travelers
                </h3>
                <p className="text-[#8B6F5A] max-w-2xl mx-auto leading-relaxed">
                  Our AI-powered platform transforms how you plan trips across India with intelligent tools designed for every kind of traveler.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className="p-6 rounded-2xl border border-[#D4C0AA]/60 bg-[#F5E6D3]/40 hover:bg-[#F5E6D3]/80 hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: i % 2 === 0 ? "#FF9933" : "#6B4423" }}
                    >
                      <f.icon className="w-6 h-6 text-[#FFF8F0]" />
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[#3B2314] mb-2">{f.title}</h4>
                    <p className="text-sm text-[#8B6F5A] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Destinations */}
          <section id="destinations" className="py-20 px-6 md:px-12 lg:px-20" style={{ background: "#F5E6D3" }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs uppercase tracking-[0.3em] text-[#FF9933] font-semibold mb-3">Top Picks</p>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2314] mb-4 text-balance">
                  Popular Destinations
                </h3>
                <p className="text-[#8B6F5A] max-w-2xl mx-auto leading-relaxed">
                  Explore the most loved travel destinations across Incredible India, each offering a unique cultural experience.
                </p>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {destinations.map((d) => (
                  <div
                    key={d.name}
                    className="flex-shrink-0 w-56 rounded-2xl overflow-hidden border border-[#D4C0AA]/60 bg-[#FFF8F0] hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="h-36 relative overflow-hidden">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3B2314]/30 to-transparent" />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#FFF8F0]" style={{ background: d.color }}>
                        Trending
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-serif font-bold text-[#3B2314] mb-1">{d.name}</h4>
                      <p className="text-xs text-[#8B6F5A]">{d.tagline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-20 px-6 md:px-12 lg:px-20" style={{ background: "#FFF8F0" }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs uppercase tracking-[0.3em] text-[#FF9933] font-semibold mb-3">Sneak Peek</p>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2314] mb-4 text-balance">
                  How It Works
                </h3>
                <p className="text-[#8B6F5A] max-w-2xl mx-auto leading-relaxed">
                  Three simple steps to your perfect Indian adventure. Our intelligent planner handles the complexity.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((s, i) => (
                  <div key={s.step} className="relative text-center">
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-[#D4C0AA]" />
                    )}
                    <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-[#D4C0AA] bg-[#F5E6D3]/60 relative z-10">
                      <span className="text-2xl font-serif font-bold text-[#FF9933]">{s.step}</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[#3B2314] mb-2">{s.title}</h4>
                    <p className="text-sm text-[#8B6F5A] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-[#FFF8F0] font-semibold text-base transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{ background: "#6B4423" }}
                >
                  Try It Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 px-6 md:px-12 lg:px-20" style={{ background: "#F5E6D3" }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs uppercase tracking-[0.3em] text-[#FF9933] font-semibold mb-3">Testimonials</p>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2314] mb-4 text-balance">
                  What Travelers Say
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <div key={t.name} className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#D4C0AA]/60 shadow-sm">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? "text-[#FF9933] fill-[#FF9933]" : "text-[#D4C0AA]"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-[#6B4423] leading-relaxed mb-5 italic">
                      {`"${t.quote}"`}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#FFF8F0]" style={{ background: "#6B4423" }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3B2314]">{t.name}</p>
                        <p className="text-xs text-[#8B6F5A]">{t.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact & Footer */}
          <section id="contact" className="py-20 px-6 md:px-12 lg:px-20" style={{ background: "#3B2314" }}>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FF9933" }}>
                      <Compass className="w-5 h-5 text-[#FFF8F0]" />
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[#FFF8F0]">Smart Travel Planner</h4>
                  </div>
                  <p className="text-sm text-[#D4C0AA] leading-relaxed mb-4">
                    An initiative by the Ministry of Tourism, Government of India. Promoting responsible and smart tourism across Incredible India.
                  </p>
                  <p className="text-xs text-[#8B6F5A]">Developed under Digital India Programme</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#FFF8F0] uppercase tracking-wider mb-4">Quick Links</h4>
                  <ul className="flex flex-col gap-3">
                    {["Home", "Destinations", "Plan a Trip", "About Us", "Privacy Policy"].map((link) => (
                      <li key={link}>
                        <a href="#" className="text-sm text-[#D4C0AA] hover:text-[#FF9933] transition-colors">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#FFF8F0] uppercase tracking-wider mb-4">Contact Us</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#FF9933]" />
                      <span className="text-sm text-[#D4C0AA]">1800-111-363 (Toll Free)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#FF9933]" />
                      <span className="text-sm text-[#D4C0AA]">contact@smarttravel.gov.in</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-4 h-4 text-[#FF9933] mt-0.5" />
                      <span className="text-sm text-[#D4C0AA]">Transport Bhawan, Parliament Street, New Delhi - 110001</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-0.5 w-full mb-6" style={{ background: "linear-gradient(to right, #FF9933, #FFFFFF, #138808)" }} />
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#8B6F5A]">2026 Smart Travel Planner. Ministry of Tourism, Government of India.</p>
                <p className="text-xs text-[#8B6F5A]">Made with care for Incredible India</p>
              </div>
            </div>
          </section>
        </>
      )}

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          0% { opacity: 0; background: #3B2314; }
          40% { opacity: 1; background: #3B2314; }
          100% { opacity: 1; background: transparent; }
        }
        .animate-zoom-fade {
          animation: zoomFade 1s ease-in-out forwards;
        }
        @keyframes zoomFade {
          0% { background: transparent; }
          50% { background: rgba(59, 35, 20, 0.5); }
          100% { background: #3B2314; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
