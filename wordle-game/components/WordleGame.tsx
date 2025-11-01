"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Cell = { ch: string; locked: boolean };
type PuzzleRow = { answer: string; cells: Cell[]; solved: boolean };

const WORD_POOL = [
  "SUN","DOG","CAT","SKY","CITY","MOON","FISH","BIRD", "TREE","HOUSE","WATER","STONE","LIGHT","NIGHT","HEART","SMOKE", "CAR","TRAIN","PLANE","BRIDGE","CLOUD","FIELD","BEACH","MOUNTAIN","DESERT","FLOWER","GARDEN",
  "APPLE","SMILE","GRASS","RIVER","OCEAN","MOUSE","PYTHON","STRING","PLANET","GALAXY","ORBIT","ROCKET","SATURN","NEBULA","FOREST","ISLAND","SCHOOL",
  "NETWORK","BOOLEAN","PACKAGE","BROWSER","VILLAGE","ANDROID","WINDOWS","LIBRARY","ELEPHANT","FUNCTION","VARIABLE","DATABASE","COMPUTER","NOTEBOOK","HOSPITAL","MOUNTAIN","LANGUAGE","UNIVERSE",
  "ALGORITHM","MICROWAVE","APPLICATION","HEADPHONES","JAVASCRIPT","CONTROLLER","DICTIONARY",
  "INFORMATION","ARCHITECTURE","TRANSFORMER", "COMMUNICATION","ENVIRONMENT","DEVELOPMENT","CONNECTION","PERFORMANCE","DOCUMENTATION","REPRESENTATION","ADMINISTRATION",
];

const randInt = (a: number, b: number) =>
  Math.floor(Math.random() * (b - a + 1)) + a;

function pickWordByLength(len: number): string {
  const candidates = WORD_POOL.filter(w => w.length === len);
  if (candidates.length) return candidates[randInt(0, candidates.length - 1)];
  // fallback: cel mai apropiat ca lungime
  let best = WORD_POOL[0], diff = Math.abs(best.length - len);
  for (const w of WORD_POOL) {
    const d = Math.abs(w.length - len);
    if (d < diff) { best = w; diff = d; }
  }
  return best;
}

// ——— REVEAL pe intervale ———
// 3–4 → 1–2, 5–6 → 2–3, 7–8 → 3–4, 9–10 → 4–5, 11–12 → 5–6
function computeRevealRange(len: number): [number, number] {
  if (len <= 4) return [1, Math.min(2, len - 1)];
  if (len <= 6) return [2, Math.min(3, len - 1)];
  if (len <= 8) return [3, Math.min(4, len - 1)];
  if (len <= 10) return [4, Math.min(5, len - 1)];
  return [5, Math.min(6, len - 1)];
}

function makeRow(word: string): PuzzleRow {
  const letters = word.split("");
  const [minR, maxR] = computeRevealRange(letters.length);
  const revealCount = randInt(minR, Math.max(minR, maxR)); // sigur ≤ len-1
  const idxs = new Set<number>();
  while (idxs.size < revealCount) idxs.add(randInt(0, letters.length - 1));
  const cells: Cell[] = letters.map((ch, i) =>
    idxs.has(i) ? { ch, locked: true } : { ch: "", locked: false }
  );
  return { answer: word, cells, solved: false };
}

function buildPuzzle(): PuzzleRow[] {
  const count = randInt(3, 7);
  const rows: PuzzleRow[] = [];
  for (let i = 0; i < count; i++) {
    const len = randInt(3, 12);
    rows.push(makeRow(pickWordByLength(len)));
  }
  return rows;
}

// —— Layout (board & tiles) ——
// 12 coloane maxime, astfel încât un cuvânt de 12 litere să încapă comod
const BOARD_WIDTH = 700;   // px
const MAX_COLS = 12;
const GAP_PX = 8;

export default function RevealWordsGame() {
  const [rows, setRows] = useState<PuzzleRow[]>([]);
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showAnswers, setShowAnswers] = useState(false);

  const newGame = useCallback(() => {
    const puzzle = buildPuzzle();
    setRows(puzzle);
    // focus pe prima celulă editabilă
    outer: for (let r = 0; r < puzzle.length; r++) {
      for (let c = 0; c < puzzle[r].cells.length; c++) {
        if (!puzzle[r].cells[c].locked) { setActive({ r, c }); break outer; }
      }
    }
    setMessage("");
    setShowAnswers(false);
  }, []);

  useEffect(() => { newGame(); }, [newGame]);

  const solvedCount = useMemo(() => rows.filter(r => r.solved).length, [rows]);
  const allSolved = solvedCount === rows.length && rows.length > 0;

  const nextEditable = (r: number, c: number) => {
    const row = rows[r];
    for (let i = c + 1; i < row.cells.length; i++) if (!row.cells[i].locked) return { r, c: i };
    return null;
  };
  const prevEditable = (r: number, c: number) => {
    const row = rows[r];
    for (let i = c - 1; i >= 0; i--) if (!row.cells[i].locked) return { r, c: i };
    return null;
  };

  const checkRow = (r: number) => {
    const row = rows[r];
    const guess = row.cells.map((cell, i) => (cell.locked ? row.answer[i] : cell.ch || " ")).join("");
    if (guess.includes(" ")) { setMessage("Completează toate literele din rând."); return false; }
    const ok = guess === row.answer;
    const copy = rows.slice();
    copy[r] = { ...row, solved: ok };
    setRows(copy);
    setMessage(ok ? "Corect!" : "Mai încearcă.");
    return ok;
  };

  const typeLetter = (k: string) => {
    if (!active) return;
    const { r, c } = active;
    const row = rows[r];
    if (row.solved) return;
    if (/^[A-Z]$/.test(k)) {
      const copy = rows.map(rw => ({ ...rw, cells: rw.cells.map(cc => ({ ...cc })) }));
      copy[r].cells[c].ch = k;
      setRows(copy);
      const n = nextEditable(r, c);
      setActive(n || { r, c });
    }
  };

  const backspace = () => {
    if (!active) return;
    const { r, c } = active;
    const row = rows[r];
    if (row.solved) return;
    const copy = rows.map(rw => ({ ...rw, cells: rw.cells.map(cc => ({ ...cc })) }));
    if (!row.cells[c].locked && copy[r].cells[c].ch) {
      copy[r].cells[c].ch = "";
      setRows(copy);
      return;
    }
    const p = prevEditable(r, c);
    if (p) {
      if (!copy[p.r].cells[p.c].locked) copy[p.r].cells[p.c].ch = "";
      setRows(copy);
      setActive(p);
    }
  };

  const submit = () => { if (active) checkRow(active.r); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === "BACKSPACE") { e.preventDefault(); backspace(); }
      else if (k === "ENTER") { submit(); }
      else if (/^[A-Z]$/.test(k)) { typeLetter(k); }
      else if (k === "ARROWRIGHT" && active) { const n = nextEditable(active.r, active.c); if (n) setActive(n); }
      else if (k === "ARROWLEFT" && active) { const p = prevEditable(active.r, active.c); if (p) setActive(p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, rows]);

  const tilePx = Math.floor((BOARD_WIDTH - GAP_PX * (MAX_COLS - 1)) / MAX_COLS);
  const padCount = (len: number) => {
    const totalPad = MAX_COLS - len;
    const left = Math.floor(totalPad / 2);
    const right = totalPad - left;
    return { left, right };
  };

  return (
    // container full-width care centrează „cadranul”
    <div className=" flex justify-center px-2 max-w-[940px] mx-auto">
      {/* cadranul mare, centrat */}
      <div
  className="w-full max-w-one[1100px] mx-auto box-border grid gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white border border-indigo-800 shadow-lg"
>
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">🧩 Completează literele</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-indigo-200">
              Rezolvate: {rows.filter(r => r.solved).length}/{rows.length || "?"}
            </span>
            <button
              onClick={() => setShowAnswers(v => !v)}
              className="px-3 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600"
            >
              {showAnswers ? "Ascunde răspunsuri" : "Arată răspunsuri"}
            </button>
            <button
              onClick={newGame}
              className="px-3 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-600"
            >
              Reset (Random)
            </button>
          </div>
        </header>

        {/* Board 12 coloane, centrat */}
        <div className="mx-auto grid gap-4" style={{ width: BOARD_WIDTH, maxWidth: "100%" }}>
          {rows.map((row, rIdx) => {
            const { left, right } = padCount(row.cells.length);
            return (
              <div
                key={rIdx}
                className="grid items-center"
                style={{
                  gridTemplateColumns: `repeat(${MAX_COLS}, ${tilePx}px)`,
                  columnGap: GAP_PX,
                  justifyContent: "center",
                  opacity: row.solved ? 0.9 : 1,
                }}
              >
                {Array.from({ length: left }).map((_, i) => (
                  <div key={`l${i}`} style={{ width: tilePx, height: tilePx }} />
                ))}

                {row.cells.map((cell, cIdx) => {
                  const isActive = active?.r === rIdx && active?.c === cIdx;
                  const locked = cell.locked;
                  const shownChar = locked ? row.answer[cIdx] : (cell.ch || "");
                  const base = "grid place-items-center rounded-md border text-xl font-bold select-none";
                  const color = row.solved
                    ? "bg-green-700 border-green-700"
                    : locked
                    ? "bg-zinc-800 border-zinc-700 text-white/90"
                    : "bg-zinc-900 border-zinc-700";
                  const focus = isActive ? "outline outline-2 outline-indigo-400" : "";
                  return (
                    <button
                      key={cIdx}
                      style={{ width: tilePx, height: tilePx }}
                      className={`${base} ${color} ${focus}`}
                      onClick={() => !locked && setActive({ r: rIdx, c: cIdx })}
                      disabled={row.solved}
                    >
                      {shownChar}
                    </button>
                  );
                })}

                {Array.from({ length: right }).map((_, i) => (
                  <div key={`r${i}`} style={{ width: tilePx, height: tilePx }} />
                ))}

                <div
                  className="col-span-12 mt-2 flex justify-center"
                  style={{ gridColumn: `1 / span ${MAX_COLS}` }}
                >
                  {!row.solved ? (
                    <button
                      onClick={() => checkRow(rIdx)}
                      className="px-3 py-2 rounded-md bg-indigo-700 hover:bg-indigo-600 text-sm"
                    >
                      Verifică
                    </button>
                  ) : (
                    <span className="text-green-300 text-sm">✔ Corect</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mesaje + răspunsuri */}
        {message && <div className="text-yellow-300 text-sm">{message}</div>}
        {showAnswers && rows.length > 0 && (
          <div className="text-sm text-indigo-200">
            Răspunsuri: <span className="font-semibold">{rows.map(r => r.answer).join(", ")}</span>
          </div>
        )}

        {/* Tastatura — centrată și aliniată cu board-ul */}
        <Keyboard
          containerPx={BOARD_WIDTH}
          onKey={(k) =>
            (/^[A-Z]$/.test(k) ? typeLetter(k)
              : k === "DEL" ? backspace()
              : k === "ENTER" ? submit()
              : undefined)}
        />

        {allSolved && (
          <div className="text-green-300">🎉 Toate cuvintele rezolvate! Apasă Reset pentru alt set.</div>
        )}
      </div>
    </div>
  );
}

function Keyboard({
  onKey,
  containerPx,
}: {
  onKey: (k: string) => void;
  containerPx: number;
}) {
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  return (
    <div className="grid gap-2 mx-auto" style={{ width: containerPx, maxWidth: "100%" }}>
      {rows.map((row, i) => (
        <div className="flex justify-center gap-1" key={i}>
          {i === 2 && (
            <button className="px-4 py-2 rounded-md text-sm font-semibold bg-zinc-700" onClick={() => onKey("ENTER")}>
              Enter
            </button>
          )}
          {row.split("").map((ch) => (
            <button
              key={ch}
              className="px-3 py-2 rounded-md text-sm font-semibold bg-zinc-800"
              onClick={() => onKey(ch)}
            >
              {ch}
            </button>
          ))}
          {i === 2 && (
            <button className="px-4 py-2 rounded-md text-sm font-semibold bg-zinc-700" onClick={() => onKey("DEL")}>
              Del
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
