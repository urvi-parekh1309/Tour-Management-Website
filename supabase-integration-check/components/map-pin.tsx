"use client"

export function MapPin({
  visible,
  zooming,
  onClick,
}: {
  visible: boolean
  zooming: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!visible}
      aria-label="Explore the travel dashboard"
      className={`
        absolute right-[8%] top-[28%] z-40
        transition-all ease-out cursor-pointer origin-center
        ${visible && !zooming ? "scale-100 opacity-100 duration-700" : ""}
        ${!visible && !zooming ? "scale-0 opacity-0 duration-700" : ""}
        ${zooming ? "pin-expand" : ""}
      `}
    >
      <div className="relative flex flex-col items-center">
        {/* Glow ring */}
        {!zooming && (
          <div
            className={`
              absolute -inset-4 rounded-full
              transition-opacity duration-1000
              ${visible ? "animate-ping-slow opacity-30" : "opacity-0"}
            `}
            style={{ background: "radial-gradient(circle, #138808 0%, transparent 70%)" }}
          />
        )}

        {/* Pin shape */}
        <svg width="64" height="88" viewBox="0 0 64 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          {!zooming && <ellipse cx="32" cy="84" rx="14" ry="4" fill="#3B2314" opacity="0.15" />}
          {/* Pin body */}
          <path
            d="M32 0C14.327 0 0 14.327 0 32c0 24 32 52 32 52s32-28 32-52C64 14.327 49.673 0 32 0z"
            fill="#FF9933"
          />
          {/* Inner highlight */}
          <path
            d="M32 4C16.536 4 4 16.536 4 32c0 6.5 3 14 8 22"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.3"
            fill="none"
            strokeLinecap="round"
          />
          {/* White circle center */}
          <circle cx="32" cy="30" r="14" fill="white" />
          {/* Inner accent */}
          <circle cx="32" cy="30" r="8" fill="#FF9933" opacity="0.3" />
          {/* Small India tricolor hint inside */}
          <rect x="28" y="24" width="8" height="2.5" rx="1" fill="#FF9933" opacity="0.6" />
          <rect x="28" y="27.5" width="8" height="2.5" rx="1" fill="white" opacity="0.8" />
          <rect x="28" y="31" width="8" height="2.5" rx="1" fill="#138808" opacity="0.6" />
        </svg>

        {/* Label below pin */}
        {!zooming && (
          <span className="mt-1 text-xs font-semibold text-[#6B4423] tracking-wide whitespace-nowrap animate-pulse">
            Exploring...
          </span>
        )}
      </div>

      <style jsx>{`
        .pin-expand {
          animation: pinExpand 1.2s ease-in-out forwards;
        }

        @keyframes pinExpand {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          40% {
            transform: scale(3);
            opacity: 1;
          }
          70% {
            transform: scale(8);
            opacity: 0.8;
          }
          100% {
            transform: scale(20);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}
