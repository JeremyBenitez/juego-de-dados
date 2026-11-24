import type { CSSProperties } from "react";
import { FACES, type Face } from "../gameData";

function DieFace({ face }: { face: Face }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 select-none">
      {face.outcome === "win" && face.logo ? (
        <img
          src={face.logo}
          alt={face.name}
          className="w-3/4 h-3/4 object-contain"
          style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.28))" }}
        />
      ) : (
        <span
          role="img"
          aria-label={face.name}
          style={{
            fontSize: "clamp(3.5rem, 11vw, 6.5rem)",
            lineHeight: 1,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
          }}
        >
          {face.emoji || (face.outcome === "retry" ? "🔄" : "😔")}
        </span>
      )}
    </div>
  );
}

function faceStyle(transform: string): CSSProperties {
  return {
    position: "absolute",
    width: "100%",
    height: "100%",
    transform,
    background: "#ffffff",
    border: "3px solid rgba(200,210,230,0.85)",
    borderRadius: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    boxShadow: "inset 0 0 18px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.35)",
    overflow: "hidden",
  };
}

export function Die3D({
  rotX,
  rotY,
  isRolling,
  size = 240,
}: {
  rotX: number;
  rotY: number;
  isRolling: boolean;
  size?: number;
}) {
  const half = size / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        perspective: 900,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d",
          transformOrigin: "50% 50%",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: isRolling
            ? "transform 0.18s linear"
            : "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* FACES[0] -> Frente */}
        <div style={faceStyle(`translateZ(${half}px)`) }>
          <DieFace face={FACES[0]} />
        </div>
        {/* FACES[1] -> Derecha */}
        <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`) }>
          <DieFace face={FACES[1]} />
        </div>
        {/* FACES[2] -> Arriba */}
        <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`) }>
          <DieFace face={FACES[2]} />
        </div>
        {/* FACES[3] -> Izquierda */}
        <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`) }>
          <DieFace face={FACES[3]} />
        </div>
        {/* FACES[4] -> Abajo */}
        <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`) }>
          <DieFace face={FACES[4]} />
        </div>
        {/* FACES[5] -> Atrás */}
        <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`) }>
          <DieFace face={FACES[5]} />
        </div>
      </div>
    </div>
  );
}