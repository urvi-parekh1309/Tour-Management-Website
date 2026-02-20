"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Marker {
  lat: number
  lng: number
  label: string
}

export default function RouteMap({ markers }: { markers: Marker[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
    })

    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]))

    // Create numbered markers
    markers.forEach((m, i) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:${i === 0 ? "#FF9933" : "#6B4423"};
          color:#FFF8F0;font-size:12px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          border:2px solid #FFF8F0;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${i + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`<b style="font-size:13px">${m.label}</b>`)
    })

    // Draw route polyline
    if (markers.length > 1) {
      const latlngs: L.LatLngExpression[] = markers.map((m) => [m.lat, m.lng])
      L.polyline(latlngs, {
        color: "#FF9933",
        weight: 3,
        opacity: 0.8,
        dashArray: "8, 6",
      }).addTo(map)
    }

    map.fitBounds(bounds, { padding: [40, 40] })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [markers])

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
}
