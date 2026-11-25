import React from "react";
import { INK } from "../lib/anim";

export type Hat = "none" | "topknot" | "bicorne" | "crown" | "helmet" | "tophat" | "cap" | "explorer";
export type Mood = "normal" | "stern" | "worried" | "happy" | "surprised";

export type PersonProps = {
  x: number; y: number; scale?: number;
  hat?: Hat; coat?: string; skin?: string; hair?: string;
  talk?: boolean; blink?: boolean; mood?: Mood; sweat?: number; swords?: boolean; flip?: boolean;
};

const L = (x1: number, y1: number, x2: number, y2: number, w = 5, c = INK) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" />
);

/** One reusable cartoon person. Origin = centre of the neck. Designed at ~300px tall, scale as needed. */
export const Person: React.FC<PersonProps> = ({
  x, y, scale = 1.5, hat = "none", coat = "#4a5d7a", skin = "#f6d7b5", hair = "#1d1d1d",
  talk = false, blink = false, mood = "normal", sweat = 0, swords = false, flip = false,
}) => {
  const r = 40, hy = -12, ey = hy - 2, my = hy + r * 0.42;
  const brow = mood === "worried"
    ? [L(-20, ey - 11, -7, ey - 17, 3), L(20, ey - 11, 7, ey - 17, 3)] // inner ends raised = anxious
    : mood === "stern" ? [L(-21, ey - 14, -6, ey - 8, 3.5), L(21, ey - 14, 6, ey - 8, 3.5)]
    : mood === "surprised" ? [L(-21, ey - 17, -8, ey - 20, 3), L(21, ey - 17, 8, ey - 20, 3)] : null;
  const mouth = talk ? <ellipse cx={0} cy={my} rx={7} ry={8} fill="#7a2a20" stroke={INK} strokeWidth={2.5} />
    : mood === "surprised" ? <ellipse cx={0} cy={my + 2} rx={8} ry={11} fill="#7a2a20" stroke={INK} strokeWidth={2.5} />
    : mood === "worried" ? <path d={`M-9,${my + 3} Q0,${my - 5} 9,${my + 3}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    : mood === "happy" ? <path d={`M-10,${my - 2} Q0,${my + 9} 10,${my - 2}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    : L(-8, my, 8, my, 3);
  const eyes = blink ? [L(-20, ey, -8, ey, 3), L(8, ey, 20, ey, 3)]
    : [<circle key="a" cx={-14} cy={ey} r={4.5} fill={INK} />, <circle key="b" cx={14} cy={ey} r={4.5} fill={INK} />];

  const hats: Record<Hat, React.ReactNode> = {
    none: <path d={`M-40,${hy - 6} Q-38,${hy - 46} 0,${hy - 42} Q38,${hy - 46} 40,${hy - 6} Q20,${hy - 28} 0,${hy - 28} Q-20,${hy - 28} -40,${hy - 6}Z`} fill={hair} />,
    topknot: <>
      <path d={`M-40,${hy - 6} Q-38,${hy - 46} 0,${hy - 42} Q38,${hy - 46} 40,${hy - 6} Q20,${hy - 28} 0,${hy - 28} Q-20,${hy - 28} -40,${hy - 6}Z`} fill={hair} />
      <ellipse cx={0} cy={hy - 50} rx={9} ry={14} fill={hair} />
    </>,
    bicorne: <>
      <path d={`M-60,${hy - 28} Q0,${hy - 98} 60,${hy - 28} Q0,${hy - 46} -60,${hy - 28}Z`} fill="#161616" stroke={INK} strokeWidth={2} />
      <circle cx={0} cy={hy - 50} r={7} fill="#e8b93a" />
    </>,
    crown: <path d={`M-32,${hy - 30} L-32,${hy - 70} L-16,${hy - 52} L0,${hy - 78} L16,${hy - 52} L32,${hy - 70} L32,${hy - 30}Z`} fill="#e8b93a" stroke={INK} strokeWidth={3} strokeLinejoin="round" />,
    helmet: <path d={`M-44,${hy - 8} Q-44,${hy - 60} 0,${hy - 62} Q44,${hy - 60} 44,${hy - 8}Z`} fill="#8d969e" stroke={INK} strokeWidth={3} />,
    tophat: <>
      <rect x={-28} y={hy - 100} width={56} height={64} fill="#161616" />
      <rect x={-44} y={hy - 40} width={88} height={8} rx={4} fill="#161616" />
    </>,
    explorer: <>
      <path d={`M-58,${hy - 22} Q0,${hy - 36} 58,${hy - 22} Q0,${hy - 12} -58,${hy - 22}Z`} fill="#c9a96e" stroke={INK} strokeWidth={3} />
      <path d={`M-38,${hy - 26} Q-36,${hy - 74} 0,${hy - 74} Q36,${hy - 74} 38,${hy - 26}Z`} fill="#e3c78f" stroke={INK} strokeWidth={3} />
      <path d={`M-37,${hy - 34} Q0,${hy - 42} 37,${hy - 34}`} fill="none" stroke="#8a5a2b" strokeWidth={7} />
    </>,
    cap: <path d={`M-40,${hy - 14} Q-38,${hy - 52} 0,${hy - 52} Q38,${hy - 52} 40,${hy - 14}Z M30,${hy - 18} L62,${hy - 14} L40,${hy - 8}Z`} fill={coat} stroke={INK} strokeWidth={3} />,
  };

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      {/* legs */}
      {L(-12, 120, -14, 190)}{L(12, 120, 14, 190)}
      <ellipse cx={-18} cy={192} rx={12} ry={6} fill={INK} /><ellipse cx={18} cy={192} rx={12} ry={6} fill={INK} />
      {/* body */}
      <path d="M-42,130 L-30,30 Q0,20 30,30 L42,130 Z" fill={coat} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {hat === "bicorne" && [0, 1, 2, 3].map((i) => <circle key={i} cx={0} cy={46 + i * 20} r={4} fill="#e8b93a" stroke={INK} strokeWidth={1.5} />)}
      {hat === "topknot" && <path d="M-16,28 L0,62 L16,28" fill="none" stroke="#f3eee2" strokeWidth={6} />}
      {swords && <>
        <rect x={-38} y={78} width={76} height={12} fill="#2b2b2b" />
        {L(20, 84, 78, 60, 7, "#1d1d1d")}{L(20, 90, 66, 76, 6, "#1d1d1d")}
      </>}
      {/* arms */}
      {L(-30, 40, -48, 100)}{L(30, 40, 44, 96)}
      {/* head */}
      <circle cx={0} cy={hy} r={r} fill={skin} stroke={INK} strokeWidth={3} />
      {eyes}{brow}{mouth}
      {hats[hat]}
      {sweat > 0 && <path d={`M46,${-30 + 30 * sweat} q-7,12 0,16 q7,-4 0,-16Z`} fill="#7cc4f0" stroke={INK} strokeWidth={2} />}
    </g>
  );
};
