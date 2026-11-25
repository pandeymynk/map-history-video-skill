import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { W, H, ease, prog, cueTime, Word } from "../lib/anim";
import { Person, Hat, Mood } from "../components/Person";
import { Bubble } from "../components/Overlays";

export type RoomCharacter = { name: string; hat?: Hat; coat?: string; x: number; enter?: boolean; swords?: boolean; mood?: Mood; flip?: boolean };
export type Dialogue = { who: string; text: string; cue?: string; at?: number; hold?: number };
export type RoomEvent = { type: "ships" | "sweat" | "mood"; who?: string; cue?: string; at?: number; mood?: Mood };

export type RoomSceneProps = {
  characters: RoomCharacter[]; dialogue?: Dialogue[]; events?: RoomEvent[]; words: Word[]; duration: number; idx: number;
};

const FLOOR = 860, SCALE = 2.2, FEET_OFFSET = 192 * SCALE; // character origin = neck; feet sit on the floor

const Ship: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-60,0 L60,0 L48,18 L-50,18Z" fill="#1b1b1b" />
    <rect x={-6} y={-26} width={12} height={26} fill="#1b1b1b" />
    <line x1={-34} y1={0} x2={-34} y2={-40} stroke="#1b1b1b" strokeWidth={3} />
    <line x1={30} y1={0} x2={30} y2={-36} stroke="#1b1b1b" strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => {
      const ph = (t * 0.6 + i * 0.25) % 1;
      return <circle key={i} cx={-4 - ph * 40} cy={-32 - ph * 40} r={6 + ph * 10} fill="#555" opacity={0.8 * (1 - ph)} />;
    })}
  </g>
);

export const RoomScene: React.FC<RoomSceneProps> = ({ characters, dialogue = [], events = [], words, duration, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = (e: { cue?: string; at?: number }) => e.at ?? cueTime(words, e.cue, 0);

  // window
  const wx = 690, wy = 170, ww = 560, wh = 350;
  const shipsEv = events.find((e) => e.type === "ships");
  const sp = shipsEv ? ease(prog(t, at(shipsEv), at(shipsEv) + 2.2)) : 0;

  // active bubbles
  const bubbles = dialogue.map((d) => {
    const a = at(d), b = a + (d.hold ?? 2);
    return { ...d, a, b, k: prog(t, a, a + 0.3) * (1 - prog(t, b, b + 0.2)) };
  });

  // camera: slow push-in over the whole scene, gliding toward whoever spoke last
  let camX = W / 2;
  for (const b of [...bubbles].sort((p, q) => p.a - q.a)) {
    const c = characters.find((c) => c.name === b.who);
    if (c) camX += (W / 2 + (c.x - W / 2) * 0.3 - camX) * ease(prog(t, b.a, b.a + 0.8));
  }
  const zoom = 1 + 0.07 * ease(t / Math.max(duration, 1));
  const camY = FLOOR - 200;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#e9dcbc" />
      <g transform={`translate(${W / 2},${camY}) scale(${zoom}) translate(${-camX},${-camY})`}>
      <rect x={-400} y={0} width={W + 800} height={H} fill="#e9dcbc" />
      <rect x={-400} y={FLOOR} width={W + 800} height={H} fill="#a97c50" />
      <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#a97c50" />
      <line x1={-400} y1={FLOOR} x2={W + 400} y2={FLOOR} stroke="#6e4b2a" strokeWidth={8} />
      <rect x={-400} y={90} width={W + 800} height={24} fill="#7b5532" />
      {[180, 1740].map((px) => <rect key={px} x={px - 12} y={90} width={24} height={FLOOR - 90} fill="#7b5532" />)}
      <defs><clipPath id={`win-${idx}`}><rect x={wx} y={wy} width={ww} height={wh} /></clipPath></defs>
      <g clipPath={`url(#win-${idx})`}>
        <rect x={wx} y={wy} width={ww} height={wh} fill="#a8d8f0" />
        <rect x={wx} y={wy + 190} width={ww} height={wh} fill="#3d7ea6" />
        {shipsEv && [[0, 0, 1.3], [160, 26, 1.45], [310, 6, 1.15], [-110, 30, 1.05]].map(([ox, oy, s], i) => (
          <Ship key={i} x={wx + ww + 180 - sp * (450 - ox)} y={wy + 196 + oy * 0.4} s={s} t={t + i} />
        ))}
      </g>
      <rect x={wx} y={wy} width={ww} height={wh} fill="none" stroke="#7b5532" strokeWidth={16} />
      <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#7b5532" strokeWidth={10} />

      {characters.map((c, i) => {
        const enterP = c.enter ? ease(prog(t, 0.1, 1.5)) : 1;
        const x = c.enter ? W + 300 - (W + 300 - c.x) * enterP : c.x;
        const walking = c.enter && t > 0.1 && t < 1.5;
        const bob = walking ? -9 * Math.abs(Math.sin(t * 9)) : 5 * Math.sin(t * 2.2 + i);
        const speaking = bubbles.some((b) => b.who === c.name && t >= b.a && t < b.b);
        const sweatEv = events.find((e) => e.type === "sweat" && e.who === c.name);
        const moodEv = [...events].reverse().find((e) => e.type === "mood" && e.who === c.name && t >= at(e));
        const mood: Mood = moodEv?.mood ?? (sweatEv && t >= at(sweatEv) ? "worried" : c.mood ?? (c.swords ? "stern" : "normal"));
        return (
          <Person key={c.name} scale={SCALE} x={x} y={FLOOR - FEET_OFFSET + bob} hat={c.hat} coat={c.coat} swords={c.swords} flip={c.flip}
            talk={speaking && Math.floor(t * 8) % 2 === 0} blink={((t + i * 1.3) % 3.1) < 0.12}
            mood={mood} sweat={sweatEv ? prog(t, at(sweatEv), at(sweatEv) + 1) : 0} />
        );
      })}
      {bubbles.map((b, i) => {
        const c = characters.find((c) => c.name === b.who);
        return c ? <Bubble key={i} x={c.x} y={FLOOR - FEET_OFFSET - 250} text={b.text} k={b.k} /> : null;
      })}
      </g>
    </svg>
  );
};
