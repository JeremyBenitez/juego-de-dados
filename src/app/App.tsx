import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, X, Dices, RotateCcw } from "lucide-react";
import { Die3D } from "./components/Die3D";
import { Confetti } from "./components/Confetti";
import { StageConfirm } from "./components/StageConfirm";
import { StageFollow } from "./components/StageFollow";
import { FACE_ROTATIONS, FACES, type Face } from "./gameData";
import { obtenerPremioDisponible, descontarPremio, obtenerStock } from "../utils/gameLogic";

const BACKGROUND_STYLE = {
  background: "radial-gradient(ellipse at 50% 25%, #0e2a6e 0%, #07101f 70%)",
  fontFamily: "'Nunito', sans-serif",
};

const EVENT_STORAGE_KEY = "tio_ammi_evento_6h_v1";
const EVENT_DURATION_MS = 6 * 60 * 60 * 1000; // 6 horas (360 minutos)
const TOTAL_EVENT_PRIZES = 5;
const WIN_CHANCE_EARLY_PRIZES = 0.35; // 1.er y 2.º premio
const WIN_CHANCE_LATE_PRIZES = 0.20;  // 3.er, 4.º y 5.º premio (un poco más difícil)
const RETRY_CHANCE_PER_ROLL = 0.25;

interface EventScheduleState {
  startTime: number;
  awardedCount: number;
}

function getWinChanceForCurrentPrize(awardedCount: number): number {
  return awardedCount < 2 ? WIN_CHANCE_EARLY_PRIZES : WIN_CHANCE_LATE_PRIZES;
}

function getEventScheduleState(): EventScheduleState {
  const saved = localStorage.getItem(EVENT_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as EventScheduleState;
      if (typeof parsed.startTime === "number" && typeof parsed.awardedCount === "number") {
        return parsed;
      }
    } catch {
      // Si el JSON guardado es inválido, se inicializa de nuevo
    }
  }
  const initial: EventScheduleState = { startTime: Date.now(), awardedCount: 0 };
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function markEventPrizeAwarded(): EventScheduleState {
  const current = getEventScheduleState();
  const next: EventScheduleState = {
    ...current,
    awardedCount: Math.min(TOTAL_EVENT_PRIZES, current.awardedCount + 1),
  };
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function canAwardPrizeNow(now = Date.now()): boolean {
  const { startTime, awardedCount } = getEventScheduleState();
  if (awardedCount >= TOTAL_EVENT_PRIZES) return false;

  const elapsed = Math.max(0, now - startTime);
  if (elapsed >= EVENT_DURATION_MS) {
    return true;
  }

  const progress = elapsed / EVENT_DURATION_MS;
  const allowedByElapsedTime = Math.min(
    TOTAL_EVENT_PRIZES,
    Math.floor(progress * TOTAL_EVENT_PRIZES) + 1
  );

  return awardedCount < allowedByElapsedTime;
}

function calculateDieSize(): number {
  const widthBased = Math.round(window.innerWidth * 0.37);
  return Math.min(410, Math.max(160, widthBased));
}

function StarField({
  stars,
}: {
  stars: { size: string; left: string; top: string; opacity: number }[];
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [rotX, setRotX] = useState(-20);
  const [rotY, setRotY] = useState(25);
  const [isRolling, setIsRolling] = useState(false);
  const [lockIdleMotion, setLockIdleMotion] = useState(false);
  const [winner, setWinner] = useState<Face | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [stage, setStage] = useState<"follow" | "confirm" | "play">("follow");
  const rollCountRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const [dieSize, setDieSize] = useState(calculateDieSize);

  const clearScheduledTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearScheduledTimers();
  }, []);

  useEffect(() => {
    const onResize = () => setDieSize(calculateDieSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (showModal && winner?.outcome === "win") {
      setConfetti(true);
      const id = window.setTimeout(() => setConfetti(false), 4000);
      timersRef.current.push(id);
      return () => window.clearTimeout(id);
    }
  }, [showModal, winner]);

  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        size: `${1 + Math.random() * 2}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0.15 + Math.random() * 0.45,
      })),
    []
  );

  const instagramUrl = "https://www.instagram.com/tioammioficial";

  const roll = () => {
    if (isRolling) return;
    clearScheduledTimers();
    setStage("play");
    setIsRolling(true);
    setLockIdleMotion(true);
    setShowModal(false);
    setConfetti(false);
    setWinner(null);

    const winIndices = FACES.map((f, idx) => (f.outcome === "win" ? idx : -1)).filter(
      (idx) => idx !== -1
    );
    const loseIndices = FACES.map((f, idx) => (f.outcome === "lose" ? idx : -1)).filter(
      (idx) => idx !== -1
    );
    const retryIndices = FACES.map((f, idx) => (f.outcome === "retry" ? idx : -1)).filter(
      (idx) => idx !== -1
    );

    let targetFaceIndex = loseIndices[Math.floor(Math.random() * loseIndices.length)];
    let isWinner = false;

    const currentSchedule = getEventScheduleState();
    const eligibleBySchedule = canAwardPrizeNow();
    const winChance = getWinChanceForCurrentPrize(currentSchedule.awardedCount);
    const rollSample = Math.random();

    if (eligibleBySchedule && rollSample < winChance && winIndices.length > 0) {
      const premioDisponible = obtenerPremioDisponible();

      if (premioDisponible && descontarPremio(premioDisponible)) {
        targetFaceIndex = winIndices[Math.floor(Math.random() * winIndices.length)];
        const updatedSchedule = markEventPrizeAwarded();
        isWinner = true;

        console.log("¡Ganador TIO AMMI!", {
          premio: premioDisponible,
          entregados: updatedSchedule.awardedCount,
          de: TOTAL_EVENT_PRIZES,
          probabilidadAplicada: winChance,
          stockRestante: obtenerStock(),
        });
      }
    } else if (
      rollSample >= winChance &&
      rollSample < winChance + RETRY_CHANCE_PER_ROLL &&
      retryIndices.length > 0
    ) {
      targetFaceIndex = retryIndices[Math.floor(Math.random() * retryIndices.length)];
      console.log("Resultado: Tienes otra oportunidad", {
        winChance,
        rollSample,
      });
    } else {
      console.log("Resultado: Perdiste", {
        eligibleBySchedule,
        winChance,
        rollSample,
        estadoEvento: currentSchedule,
      });
    }

    const target = FACE_ROTATIONS[targetFaceIndex];
    rollCountRef.current += 1;
    const thisRoll = rollCountRef.current;
    const tumbleSteps = 12 + Math.floor(Math.random() * 3);
    let step = 0;

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    const tumble = () => {
      if (rollCountRef.current !== thisRoll) return;
      if (step < tumbleSteps) {
        setRotX((current) => current + 90);
        setRotY((current) => current + 90);
        step += 1;
        schedule(tumble, 160);
      } else {
        setRotX((current) => {
          const base = Math.ceil(current / 360) * 360 + 360;
          return base + target.x;
        });
        setRotY((current) => {
          const base = Math.ceil(current / 360) * 360 + 360;
          return base + target.y;
        });
        setIsRolling(false);

        schedule(() => {
          if (rollCountRef.current !== thisRoll) return;
          setWinner(FACES[targetFaceIndex]);

          schedule(() => {
            if (rollCountRef.current !== thisRoll) return;
            setShowModal(true);
            if (isWinner) {
              setConfetti(true);
              schedule(() => setConfetti(false), 4000);
            }
          }, 550);
        }, 800);
      }
    };

    schedule(tumble, 50);
  };

  const handleRetryRoll = () => {
    clearScheduledTimers();
    setShowModal(false);
    setWinner(null);
    const id = window.setTimeout(() => {
      roll();
    }, 180);
    timersRef.current.push(id);
  };

  const handleGoHome = () => {
    clearScheduledTimers();
    setShowModal(false);
    setConfetti(false);
    setWinner(null);
    setIsRolling(false);
    setLockIdleMotion(false);
    setRotX(-20);
    setRotY(25);
    setStage("follow");
  };

  useEffect(() => {
    if (isRolling || lockIdleMotion || winner !== null) return;

    let frame = 0;
    let time = 0;
    const animate = () => {
      time += 0.008;
      setRotX(-20 + Math.sin(time * 0.7) * 8);
      setRotY(25 + Math.sin(time) * 12);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isRolling, lockIdleMotion, winner]);

  if (stage === "follow" || stage === "confirm") {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center overflow-x-hidden"
        style={BACKGROUND_STYLE}
      >
        <StarField stars={stars} />
        {stage === "follow" ? (
          <StageFollow instagramUrl={instagramUrl} onConfirmed={() => setStage("confirm")} />
        ) : (
          <StageConfirm onStartPlay={() => setStage("play")} />
        )}
      </div>
    );
  }

  const outcome = winner?.outcome ?? "lose";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between overflow-x-hidden px-6 py-12"
      style={{ ...BACKGROUND_STYLE, fontFamily: "'Montserrat', sans-serif" }}
    >
      <StarField stars={stars} />
      <Confetti active={confetti} />

      {/* Título arriba */}
      <header className="relative z-10 w-full flex flex-col items-center pt-6 px-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Star className="w-10 h-10 fill-[#e61a1a] text-[#e61a1a] shrink-0" />
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(6rem, 13.5vw, 10.5rem)",
              background:
                "linear-gradient(135deg, #ffe600 0%, #e61a1a 45%, #aae0ed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.02,
              letterSpacing: "0.03em",
            }}
          >
            Participa y Gana
          </h1>
          <Star className="w-10 h-10 fill-[#1a56db] text-[#3974f3] shrink-0" />
        </div>
        <p
          className="text-2xl md:text-3xl tracking-widest uppercase font-semibold"
          style={{ color: "#8fafd4" }}
        >
          ¡Lanza el dado y descubre si ganaste!
        </p>
      </header>

      {/* Dado en el centro y botón bien separado abajo */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-grow w-full px-4 gap-36 md:gap-44">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full blur-3xl opacity-45"
            style={{
              width: dieSize * 1.4,
              height: dieSize * 0.5,
              bottom: -24,
              background:
                "radial-gradient(ellipse, #1a56db 0%, #e61a1a 60%, transparent 100%)",
            }}
          />
          <div
            style={{
              filter: isRolling
                ? "drop-shadow(0 0 34px #e61a1a) drop-shadow(0 0 65px #1a56db)"
                : "drop-shadow(0 14px 42px rgba(26,86,219,0.55)) drop-shadow(0 4px 18px rgba(230,26,26,0.45))",
              transition: "filter 0.4s ease",
            }}
          >
            <Die3D rotX={rotX} rotY={rotY} isRolling={isRolling} size={dieSize} />
          </div>
        </div>

        <motion.button
          onClick={roll}
          disabled={isRolling}
          whileHover={!isRolling ? { scale: 1.04 } : {}}
          whileTap={!isRolling ? { scale: 0.96 } : {}}
          className="relative overflow-hidden rounded-2xl px-16 py-6 font-extrabold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-12 mb-6"
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: "clamp(2.1rem, 4.6vw, 2.9rem)",
            background: isRolling
              ? "#13223d"
              : "linear-gradient(135deg, #ef1c1c 0%, #1d5eff 100%)",
            border: "1.5px solid rgba(255, 255, 255, 0.22)",
            color: "#ffffff",
            boxShadow: isRolling
              ? "0 6px 20px rgba(13, 28, 53, 0.4)"
              : "0 12px 32px rgba(29, 94, 255, 0.35), 0 6px 18px rgba(239, 28, 28, 0.35)",
          }}
        >
          {isRolling ? (
            <span className="flex items-center gap-4">Lanzando...</span>
          ) : (
            <span className="flex items-center gap-4">
              <Dices className="w-9 h-9" /> ¡Lanzar Dado!
            </span>
          )}
        </motion.button>
      </main>

      {/* Equilibrio inferior para centrar ópticamente el bloque dado + botón en 1920px de alto */}
      <div className="h-16 shrink-0 pointer-events-none" />

      <AnimatePresence>
        {showModal && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-[2rem] p-12 flex flex-col items-center gap-8 max-w-2xl w-full text-center"
              style={{
                background: `linear-gradient(145deg, #0d1c35 0%, ${winner.color}28 100%)`,
                border: `2px solid ${winner.color}`,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 rounded-full p-1 opacity-50 hover:opacity-100 text-white"
              >
                <X className="w-6 h-6" />
              </button>

              {outcome === "win" && winner.logo ? (
                <img
                  src={winner.logo}
                  alt="TIO AMMI"
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div style={{ fontSize: "6rem", lineHeight: 1 }}>
                  {outcome === "retry" ? "🔄" : "😔"}
                </div>
              )}

              <div>
                <div
                  className="text-2xl uppercase tracking-widest font-bold mb-2"
                  style={{
                    color:
                      outcome === "win"
                        ? "#ffe600"
                        : outcome === "retry"
                        ? "#60a5fa"
                        : "#94a3b8",
                  }}
                >
                  {outcome === "win"
                    ? "¡GANASTE UN PREMIO!"
                    : outcome === "retry"
                    ? "TIENES OTRA OPORTUNIDAD"
                    : "SUERTE LA PRÓXIMA"}
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: "2.1rem",
                    color: "#fff",
                  }}
                >
                  {outcome === "win"
                    ? "¡Felicidades!"
                    : outcome === "retry"
                    ? "¡Vuelve a lanzar el dado!"
                    : "¡Gracias por participar!"}
                </div>
              </div>

              <div className="flex w-full gap-4 mt-4">
                <button
                  onClick={handleGoHome}
                  className="flex-1 rounded-2xl py-4 text-xl font-bold bg-[#152340] text-[#8fafd4] hover:bg-[#1c3057]"
                >
                  Ir al Inicio
                </button>

                {outcome === "retry" && (
                  <button
                    onClick={handleRetryRoll}
                    className="flex-1 rounded-2xl py-4 text-xl font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" /> Volver a lanzar
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}