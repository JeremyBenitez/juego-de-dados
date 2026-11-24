import { Instagram } from "lucide-react";
import qrImage from "../../assets/logos/qrtio2.jpeg";
export function StageFollow({ instagramUrl, onConfirmed }: { instagramUrl: string; onConfirmed: () => void }) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-3">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/15 bg-white/10 p-12 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="mb-10 text-center">
          <p
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem, 8vw, 5rem)",
              color: "#fff",
              textShadow: "0 0 20px rgba(255,255,255,0.2)",
              lineHeight: 1.05,
            }}
          >
            Síguenos y gana!
          </p>
          <p className="mt-6 text-lg uppercase tracking-[0.2em] text-slate-200/85">
            Escanea el QR o abre Instagram para seguirnos.
          </p>
        </div>

        <div className="mx-auto mb-10 rounded-3xl border border-white/20 bg-slate-950/90 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)]" style={{ width: 'min(40vh, 400px)' }}>
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden bg-white/5">
            <img
              src={qrImage}
              alt="QR Tio Ammi"
              className="w-full h-full object-contain mix-blend-screen"
            />
          </a>
        </div>

        <div className="mb-10 text-center text-2xl text-slate-200/90">
          Al tocar el botón, se abrirá Instagram. Después pulsa "Ya los seguí" para continuar.
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:justify-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#032f4b] via-[#4a1c22] to-[#D5242D] px-10 py-5 text-lg font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-black/30 transition hover:brightness-110"
          >
            <Instagram className="mr-3 h-5 w-5" />@tioammioficial
          </a>
          <button
            type="button"
            onClick={onConfirmed}
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-10 py-5 text-lg font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
          >
            Participa
          </button>
        </div>
      </div>
    </div>
  );
}
