import TIO from "../assets/logos/LOGO VECTOR con lineas.png";

export type FaceOutcome = "win" | "lose" | "retry";

export type Face = {
  id: number;
  name: string;
  outcome: FaceOutcome;
  color: string;
  logo?: string;
  emoji?: string;
};

export const FACES: Face[] = [
  { id: 1, name: "TIO AMMI", outcome: "win", color: "#e61a1a", logo: TIO },
  { id: 2, name: "Perdiste", outcome: "lose", color: "#64748b", emoji: "😔" },
  { id: 3, name: "Tienes otra oportunidad", outcome: "retry", color: "#2563eb", emoji: "🔄" },
  { id: 4, name: "TIO AMMI", outcome: "win", color: "#e61a1a", logo: TIO },
  { id: 5, name: "Perdiste", outcome: "lose", color: "#64748b", emoji: "😔" },
  { id: 6, name: "Tienes otra oportunidad", outcome: "retry", color: "#2563eb", emoji: "🔄" },
];

// Ángulos exactos para dejar cada cara de FACES[i] completamente de frente
export const FACE_ROTATIONS = [
  { x: 0, y: 0 },     // FACES[0] -> Frente (TIO AMMI)
  { x: 0, y: -90 },   // FACES[1] -> Derecha (Perdiste)
  { x: -90, y: 0 },   // FACES[2] -> Arriba (Tienes otra oportunidad)
  { x: 0, y: 90 },    // FACES[3] -> Izquierda (TIO AMMI)
  { x: 90, y: 0 },    // FACES[4] -> Abajo (Perdiste)
  { x: 0, y: 180 },   // FACES[5] -> Atrás (Tienes otra oportunidad)
];