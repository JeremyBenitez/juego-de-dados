import { FACES } from "../gameData";

export function SponsorCarousel() {
  const sponsors = [...FACES, ...FACES];

  return (
    <section className="relative z-10 w-full py-6 mt-2 mb-4">
      <p
        className="text-center text-xl uppercase tracking-widest font-semibold mb-4"
        style={{ color: "#8fafd4" }}
      >
        Patrocinadores Oficiales
      </p>
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            gap: 1.2rem;
            width: max-content;
            animation: marquee 20s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }
          .sponsor-card {
            transition: transform 0.2s ease;
          }
          .sponsor-card:hover { transform: scale(1.08) translateY(-2px); }
        `}</style>
        <div className="marquee-track mb-110">
          {sponsors.map((f, i) => (
            <div
              key={i}
              className="sponsor-card flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-6 py-5 gap-2 cursor-default select-none"
              style={{
                background: `${f.color}18`,
                border: `1.5px solid ${f.color}55`,
                minWidth: "178px",
              }}
            >
              {f.logo ? (
                <img src={f.logo} alt={f.name} className="w-28 h-28 object-contain" />
              ) : (
                <span style={{ fontSize: "8rem", lineHeight: 1.8 }}>{f.emoji}</span>
              )}
              <span className="text-xl font-bold whitespace-nowrap" style={{ color: f.color }}>
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
