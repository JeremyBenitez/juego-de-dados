export function StageConfirm({ onStartPlay }: { onStartPlay: () => void }) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl rounded-[2.5rem] border border-white/15 bg-white/10 p-16 shadow-2xl shadow-slate-950/40 backdrop-blur-xl text-center">
        <p
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(4rem, 10vw, 7rem)",
            color: "#fff",
            lineHeight: 1.02,
          }}
        >
          Ya nos sigues
        </p>
        <p className="mt-8 text-xl uppercase tracking-[0.24em] text-slate-200/85">
          Prepárate para ganar!.
        </p>

        <div
          className="mx-auto my-12 flex items-center justify-center rounded-full shadow-[0_0_80px_rgba(230,26,26,0.5)]"
          style={{ width: 'min(40vh, 350px)', height: 'min(40vh, 350px)', background: 'linear-gradient(135deg, #032f4b 0%, #D5242D 100%)' }}
        >
          <div className="flex items-center justify-center rounded-full bg-slate-950/95 text-white shadow-inner shadow-black/30" style={{ width: 'min(36vh, 310px)', height: 'min(36vh, 310px)' }}>
            <span style={{ fontSize: 'clamp(5rem, 12vh, 8rem)' }}>🎲</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartPlay}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#032f4b] via-[#4a1c22] to-[#D5242D] px-16 py-7 text-2xl font-bold uppercase tracking-[0.18em] text-white shadow-xl transition hover:brightness-110 hover:scale-105 active:scale-95"
        >
          Ir al sorteo
        </button>
      </div>
    </div>
  );
}
