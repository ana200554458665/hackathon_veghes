"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number };

// —————— Geometrie utilitară ——————
function pointToSegmentDistance(p: Pt, a: Pt, b: Pt) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const wx = p.x - a.x, wy = p.y - a.y;
  const len2 = vx * vx + vy * vy || 1e-9;
  let t = (wx * vx + wy * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * vx, y: a.y + t * vy };
  const dx = p.x - proj.x, dy = p.y - proj.y;
  return { dist: Math.hypot(dx, dy), t };
}

function progressOnPolyline(p: Pt, pts: Pt[]) {
  let best = { dist: Infinity, segIndex: 0, t: 0 };
  const cum: number[] = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    total += d;
    cum.push(total);
  }
  for (let i = 1; i < pts.length; i++) {
    const { dist, t } = pointToSegmentDistance(p, pts[i - 1], pts[i]);
    if (dist < best.dist) best = { dist, segIndex: i - 1, t };
  }
  const segLen = cum[best.segIndex + 1] - cum[best.segIndex];
  const traveled = cum[best.segIndex] + best.t * segLen;
  return { ratio: total ? traveled / total : 0, dist: best.dist };
}

// —————— Set de 12 pattern-uri scalabile (w,h) → Pt[] ——————
type PatternGen = (w: number, h: number) => Pt[];
const m = 40; // margine
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const serpentine: PatternGen = (w, h) => [
  { x: m, y: h / 2 },
  { x: w * 0.20, y: h * 0.20 },
  { x: w * 0.35, y: h * 0.70 },
  { x: w * 0.50, y: h * 0.30 },
  { x: w * 0.65, y: h * 0.80 },
  { x: w * 0.80, y: h * 0.35 },
  { x: w - m, y: h / 2 },
];

const zigzag: PatternGen = (w, h) => {
  const pts: Pt[] = [];
  const cols = 6;
  for (let i = 0; i <= cols; i++) {
    const x = lerp(m, w - m, i / cols);
    const y = i % 2 === 0 ? h * 0.25 : h * 0.75;
    pts.push({ x, y });
  }
  return pts;
};

const smoothS: PatternGen = (w, h) => [
  { x: m, y: h * 0.65 },
  { x: w * 0.20, y: h * 0.80 },
  { x: w * 0.40, y: h * 0.30 },
  { x: w * 0.60, y: h * 0.70 },
  { x: w * 0.80, y: h * 0.20 },
  { x: w - m, y: h * 0.35 },
];

const arches: PatternGen = (w, h) => [
  { x: m, y: h * 0.65 },
  { x: w * 0.18, y: h * 0.35 },
  { x: w * 0.36, y: h * 0.65 },
  { x: w * 0.54, y: h * 0.35 },
  { x: w * 0.72, y: h * 0.65 },
  { x: w - m, y: h * 0.45 },
];

const tallWave: PatternGen = (w, h) => [
  { x: m, y: h * 0.50 },
  { x: w * 0.18, y: h * 0.15 },
  { x: w * 0.36, y: h * 0.85 },
  { x: w * 0.54, y: h * 0.20 },
  { x: w * 0.72, y: h * 0.80 },
  { x: w - m, y: h * 0.45 },
];

const gentleWave: PatternGen = (w, h) => [
  { x: m, y: h * 0.55 },
  { x: w * 0.20, y: h * 0.45 },
  { x: w * 0.40, y: h * 0.65 },
  { x: w * 0.60, y: h * 0.35 },
  { x: w * 0.80, y: h * 0.55 },
  { x: w - m, y: h * 0.50 },
];

const steps: PatternGen = (w, h) => [
  { x: m, y: h * 0.75 },
  { x: w * 0.25, y: h * 0.75 },
  { x: w * 0.25, y: h * 0.55 },
  { x: w * 0.50, y: h * 0.55 },
  { x: w * 0.50, y: h * 0.35 },
  { x: w * 0.75, y: h * 0.35 },
  { x: w * 0.75, y: h * 0.25 },
  { x: w - m, y: h * 0.25 },
];

const diagonalS: PatternGen = (w, h) => [
  { x: m, y: h * 0.25 },
  { x: w * 0.30, y: h * 0.75 },
  { x: w * 0.55, y: h * 0.20 },
  { x: w * 0.80, y: h * 0.70 },
  { x: w - m, y: h * 0.45 },
];

const tightTurns: PatternGen = (w, h) => [
  { x: m, y: h * 0.60 },
  { x: w * 0.22, y: h * 0.40 },
  { x: w * 0.35, y: h * 0.70 },
  { x: w * 0.48, y: h * 0.30 },
  { x: w * 0.63, y: h * 0.65 },
  { x: w * 0.78, y: h * 0.35 },
  { x: w - m, y: h * 0.55 },
];

const sawtooth: PatternGen = (w, h) => {
  const pts: Pt[] = [];
  const cols = 7;
  for (let i = 0; i <= cols; i++) {
    const x = lerp(m, w - m, i / cols);
    const y = i % 2 === 0 ? h * 0.30 : h * 0.70;
    pts.push({ x, y });
  }
  return pts;
};

const lowWave: PatternGen = (w, h) => [
  { x: m, y: h * 0.55 },
  { x: w * 0.20, y: h * 0.60 },
  { x: w * 0.40, y: h * 0.50 },
  { x: w * 0.60, y: h * 0.65 },
  { x: w * 0.80, y: h * 0.45 },
  { x: w - m, y: h * 0.50 },
];

const canyon: PatternGen = (w, h) => [
  { x: m, y: h * 0.50 },
  { x: w * 0.22, y: h * 0.30 },
  { x: w * 0.38, y: h * 0.55 },
  { x: w * 0.55, y: h * 0.35 },
  { x: w * 0.72, y: h * 0.60 },
  { x: w - m, y: h * 0.40 },
];

const PATTERNS: PatternGen[] = [
  serpentine, zigzag, smoothS, arches, tallWave, gentleWave,
  steps, diagonalS, tightTurns, sawtooth, lowWave, canyon,
];

// —————— Componentă ——————
export default function PathDragGame() {
  const width = 900;
  const height = 360;
  const strokeWidth = 18;
  const tolerance = 16;
  const handleRadius = 12;

  const [pathPts, setPathPts] = useState<Pt[]>(() => serpentine(width, height));
  const [patternIndex, setPatternIndex] = useState<number>(0);

  const [pos, setPos] = useState<Pt>(pathPts[0]);
  const [dragging, setDragging] = useState(false);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [bestProgress, setBestProgress] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const polyPoints = useMemo(
    () => pathPts.map((p) => `${p.x},${p.y}`).join(" "),
    [pathPts]
  );

  // alege aleator un pattern nou și resetează jocul
  const pickRandomPattern = useCallback(() => {
    const idx = Math.floor(Math.random() * PATTERNS.length);
    const pts = PATTERNS[idx](width, height);
    setPatternIndex(idx);
    setPathPts(pts);
    setPos(pts[0]);
    setDragging(false);
    setStarted(false);
    setWon(false);
    setLost(false);
    setBestProgress(0);
  }, []);

  // inițializează la intrarea pe pagină
  useEffect(() => {
    pickRandomPattern();
  }, [pickRandomPattern]);

  // coordonate pointer client -> coordonate în viewBox SVG
  const clientToSvgPoint = useCallback((clientX: number, clientY: number): Pt => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * width;
    const y = ((clientY - rect.top) / rect.height) * height;
    return { x, y };
  }, []);

  const onPointerMove = useCallback(
    (ev: PointerEvent) => {
      if (!dragging || won || lost) return;
      const p = clientToSvgPoint(ev.clientX, ev.clientY);
      setPos(p);

      const { ratio, dist } = progressOnPolyline(p, pathPts);
      const limit = strokeWidth / 2 + tolerance;

      if (dist > limit) {
        setLost(true);
        setDragging(false);
        return;
      }

      setBestProgress((prev) => (ratio > prev ? ratio : prev));
      if (ratio > 0.995) {
        setWon(true);
        setDragging(false);
      }
    },
    [clientToSvgPoint, dragging, lost, pathPts, won]
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => onPointerMove(e);
    const up = () => setDragging(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, onPointerMove]);

  const onPointerDown: React.PointerEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    setDragging(true);
    setStarted(true);
    svgRef.current?.setPointerCapture?.(e.pointerId);
  };

  return (
    <div className="grid gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900">
      <header className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h1 className="text-white text-xl font-semibold">
          🧭 Path Drag Game
          <span className="ml-2 text-xs font-normal text-indigo-300 align-middle">
            (Pattern {patternIndex + 1}/{PATTERNS.length})
          </span>
        </h1>

        <div className="flex items-center gap-3 bg-indigo-950 border border-indigo-800 text-gray-200 px-3 py-2 rounded-xl">
          <span>
            Progres:{" "}
            <strong className="text-white">
              {(bestProgress * 100).toFixed(0)}%
            </strong>
          </span>
          <button
            onClick={pickRandomPattern}
            className="bg-indigo-800 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg"
          >
            Reset (Random)
          </button>
        </div>
      </header>

      <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[360px] touch-none block"
          onPointerDown={onPointerDown}
        >
          {/* zona permisă vizual */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke="#2a2f6c"
            strokeOpacity={0.35}
            strokeWidth={18 + 16 * 2}  // strokeWidth + tolerance*2
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* traseu principal */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke="#5062ff"
            strokeWidth={18}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* start / finish */}
          <circle cx={pathPts[0]?.x ?? m} cy={pathPts[0]?.y ?? height / 2} r={10} fill="#22c55e" />
          <rect
            x={(pathPts[pathPts.length - 1]?.x ?? width - m) - 14}
            y={(pathPts[pathPts.length - 1]?.y ?? height / 2) - 14}
            width={28}
            height={28}
            rx={6}
            fill="#eab308"
          />
          {/* handler */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={handleRadius}
            fill={won ? "#22c55e" : lost ? "#ef4444" : "#7c89ff"}
            stroke="#0b0d1e"
            strokeWidth={3}
          />
        </svg>
      </div>

      <div className="text-white">
        {!started && (
          <span>
            ➤ Trage cercul verde pe traseu până la pătratul galben fără să ieși.
          </span>
        )}
        {lost && (
          <span className="text-red-300">
            Ai ieșit din traseu. Apasă <strong>Reset (Random)</strong> și încearcă din
            nou.
          </span>
        )}
        {won && <span className="text-green-300">🎉 Gata! Ai reușit!</span>}
      </div>
    </div>
  );
}
