// Wordle.tsx
// React + TypeScript, TailwindCSS
// Drop-in component (Vite React TS / Next.js App Router)

import React, { useEffect, useMemo, useRef, useState } from "react";

/** ---------- Config ---------- */
const ROWS = 6;
const COLS = 5;

// (Demo) Listă mică pentru răspunsuri zilnice – înlocuiește cu un set mai mare dacă vrei.
// Poți folosi o listă open-source (ex. list-english-words) – NU cea proprietară NYT.
const ANSWER_LIST = [
  "CRANE","SLATE","AUDIO","REACT","PLANT","ROUTE","BRAVE","CLOUD","POINT","SPARE",
  "NIGHT","FRAME","SHINE","GRACE","SOUND","MARCH","PRIDE","STONE","CHIME","QUEEN",
];

// (Demo) Listă de cuvinte valide pentru verificare (include și answers). Mărește după dorință.
const VALID_GUESSES = new Set<string>(
  [
    ...ANSWER_LIST,
    "SMALL","LARGE","WORDS","ARISE","RAISE","ALERT","STEAM","TRACE","LEAST","STARE",
    "CRONY","CLONE","POINT","SHARE","STORE","STORM","STORK","MONEY","MOUSE","HOUSE",
    "PLANE","PLAIN","TRAIN","TRAIL","TRIAL","RETRY","ENTRY","EARTH","HEART","WATER",
  ].map(w => w.toUpperCase())
);

// Ziua “zero” (replică comportamentul Wordle: o dată fixă + offset de zile).
// Alege o dată de start – aici 19 iunie 2021 (aprox. începutul Wordle-ului original).
const EPOCH = new Date(Date.UTC(2021, 5, 19)); // months 0-indexed: 5=June

// culori apropiate de Wordle (Tailwind classes)
const COLORS = {
  empty: "bg-gray-800/20 dark:bg-gray-100/10 border-gray-500/30 text-white",
  correct: "bg-green-600 border-green-600 text-white",
  present: "bg-amber-500 border-amber-500 text-white",
  absent: "bg-gray-600 border-gray-600 text-white",
};

type CellState = "empty" | "correct" | "present" | "absent";
type BoardState = CellState[][];

type KeyState = "idle" | "correct" | "present" | "absent";

function getDayIndex(d = new Date()) {
  const todayUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const epochUTC = Date.UTC(EPOCH.getUTCFullYear(), EPOCH.getUTCMonth(), EPOCH.getUTCDate());
  const diff = Math.floor((todayUTC - epochUTC) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function todayAnswer(): string {
  const idx = getDayIndex() % ANSWER_LIST.length;
  return ANSWER_LIST[idx];
}

function evaluateGuess(guess: string, answer: string): CellState[] {
  // două treceri corecte pentru duplicate
  const res: CellState[] = Array(COLS).fill("absent");
  const answerArr = answer.split("");
  const guessArr = guess.split("");

  // marcăm corectele și consumăm literele din answer
  const consumed = Array(COLS).fill(false);
  for (let i = 0; i < COLS; i++) {
    if (guessArr[i] === answerArr[i]) {
      res[i] = "correct";
      consumed[i] = true;
    }
  }
  // a doua trecere: present dacă mai există litera neconsumată în answer
  for (let i = 0; i < COLS; i++) {
    if (res[i] === "correct") continue;
    const idx = answerArr.findIndex((ch, j) => !consumed[j] && ch === guessArr[i]);
    if (idx !== -1) {
      res[i] = "present";
      consumed[idx] = true;
    } else {
      res[i] = "absent";
    }
  }
  return res;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

/** ---------- Component ---------- */
const Wordle: React.FC = () => {
  const solution = useMemo(() => todayAnswer(), []);
  const storageKey = `wordle:${getDayIndex()}`;

  const [guesses, setGuesses] = useLocalStorage<string[]>(`${storageKey}:guesses`, []);
  const [statuses, setStatuses] = useLocalStorage<BoardState>(`${storageKey}:states`, []);
  const [current, setCurrent] = useState("");
  const [keyboard, setKeyboard] = useLocalStorage<Record<string, KeyState>>(`${storageKey}:keys`, {});
  const [toast, setToast] = useState<string | null>(null);
  const [done, setDone] = useLocalStorage<boolean>(`${storageKey}:done`, false);
  const [winRow, setWinRow] = useLocalStorage<number | null>(`${storageKey}:winrow`, null);

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      const key = e.key.toUpperCase();

      if (/^[A-Z]$/.test(key) && current.length < COLS) {
        setCurrent(c => c + key);
      } else if (key === "BACKSPACE") {
        setCurrent(c => c.slice(0, -1));
      } else if (key === "ENTER") {
        submitGuess();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, done, guesses]);

  function invalidate(word: string) {
    // shake anim pe rândul curent
    setToast(word.length < COLS ? "Prea scurt!" : "Nu e în listă.");
    boardRef.current?.classList.remove("shake");
    // force reflow
    void boardRef.current?.offsetWidth;
    boardRef.current?.classList.add("shake");
    setTimeout(() => setToast(null), 900);
  }

  function submitGuess() {
    const guess = current.toUpperCase();
    if (guess.length !== COLS) return invalidate(guess);
    if (!VALID_GUESSES.has(guess)) return invalidate(guess);

    const evalRow = evaluateGuess(guess, solution);
    const nextGuesses = [...guesses, guess];
    const nextStatus = [...statuses, evalRow];

    // update keyboard states (prioritizăm corect > present > absent)
    const nextKeys = { ...keyboard };
    for (let i = 0; i < COLS; i++) {
      const ch = guess[i];
      const st = evalRow[i];
      const prev = nextKeys[ch] ?? "idle";
      const rank = (s: KeyState) =>
        s === "correct" ? 3 : s === "present" ? 2 : s === "absent" ? 1 : 0;
      if (rank(st as KeyState) > rank(prev)) nextKeys[ch] = st as KeyState;
    }

    setGuesses(nextGuesses);
    setStatuses(nextStatus);
    setKeyboard(nextKeys);
    setCurrent("");

    if (guess === solution) {
      setDone(true);
      setWinRow(nextGuesses.length - 1);
      // bounce efect pe rând
      setTimeout(() => {
        const row = document.querySelector(`[data-row="${nextGuesses.length - 1}"]`);
        row?.classList.add("bounce");
        setTimeout(() => row?.classList.remove("bounce"), 800);
      }, COLS * 220 + 50);
    } else if (nextGuesses.length === ROWS) {
      setDone(true);
    }
  }

  function pressLetter(ch: string) {
    if (done) return;
    if (ch === "ENTER") submitGuess();
    else if (ch === "DEL") setCurrent(c => c.slice(0, -1));
    else if (/^[A-Z]$/.test(ch) && current.length < COLS) setCurrent(c => c + ch);
  }

  function share() {
    const lines = statuses
      .map(row =>
        row
          .map(s => (s === "correct" ? "🟩" : s === "present" ? "🟨" : "⬛"))
          .join("")
      )
      .join("\n");

    const header = `Wordle clone ${winRow !== null ? winRow + 1 : "X"}/${ROWS}`;
    const text = `${header}\n\n${lines}`;
    navigator.clipboard.writeText(text).then(
      () => setToast("Copiat în clipboard!"),
      () => setToast("Nu am putut copia 😕")
    );
    setTimeout(() => setToast(null), 1500);
  }

  function resetToday() {
    setGuesses([]);
    setStatuses([]);
    setKeyboard({});
    setCurrent("");
    setDone(false);
    setWinRow(null);
  }

  const rows = Array.from({ length: ROWS }, (_, r) => {
    const guess = guesses[r] ?? (r === guesses.length ? current : "");
    const filled = guess.split("");
    const states = statuses[r];

    return (
      <div
        key={r}
        data-row={r}
        className="grid grid-cols-5 gap-2 place-items-center"
      >
        {Array.from({ length: COLS }, (_, c) => {
          const ch = filled[c] ?? "";
          const st: CellState =
            states?.[c] ??
            (ch ? "empty" : "empty"); // empty state vizual
          const evaluated = !!states;
          const base =
            "w-14 h-14 md:w-16 md:h-16 border-2 rounded grid place-items-center font-extrabold text-2xl md:text-3xl select-none";
          const color =
            st === "correct"
              ? COLORS.correct
              : st === "present"
              ? COLORS.present
              : ch
              ? "border-gray-400/60 text-white"
              : COLORS.empty;

        // flip delay: 220ms * col index
          const style: React.CSSProperties = evaluated
            ? { animation: `flip 320ms ease ${c * 120}ms both` }
            : {};

          return (
            <div className={`${base} ${color}`} style={style} key={c}>
              <span>{ch}</span>
            </div>
          );
        })}
      </div>
    );
  });

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-gradient-to-b from-slate-900 via-slate-900 to-black flex flex-col items-center">
      {/* keyframes + helpers */}
      <style>{`
        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(90deg); }
          100% { transform: rotateX(0); }
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        @keyframes bounceRow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .shake { animation: shake 500ms; }
        .bounce { animation: bounceRow 600ms ease; }
      `}</style>

      <header className="w-full max-w-[560px] px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl tracking-widest font-extrabold">WORDLE</h1>
        <div className="flex gap-2">
          <button
            onClick={resetToday}
            className="px-3 py-1 rounded-lg border border-white/20 text-sm hover:bg-white/10"
            title="Reset azi"
          >
            Reset
          </button>
          <button
            onClick={share}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
          >
            Share
          </button>
        </div>
      </header>

      <main className="w-full max-w-[560px] px-4">
        <div
          ref={boardRef}
          className="grid gap-2"
          style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0,1fr))` }}
        >
          {rows}
        </div>

        <p className="mt-4 text-center text-sm opacity-80">
          {done
            ? winRow !== null
              ? `Bravo! Soluția de azi: ${solution}.`
              : `Ai pierdut 😅 Soluția de azi: ${solution}.`
            : "\u00A0"}
        </p>

        {/* tastatura */}
        <div className="mt-6 select-none">
          <Keyboard layout={[
              ["Q","W","E","R","T","Y","U","I","O","P"],
              ["A","S","D","F","G","H","J","K","L"],
              ["ENTER","Z","X","C","V","B","N","M","DEL"],
            ]}
            state={keyboard}
            onKey={pressLetter}
          />
        </div>
      </main>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/90 border border-white/20 px-4 py-2 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
};

const Key: React.FC<{
  label: string;
  state?: KeyState;
  onClick: () => void;
}> = ({ label, state = "idle", onClick }) => {
  const wide = label === "ENTER" || label === "DEL";
  const color =
    state === "correct"
      ? "bg-green-600"
      : state === "present"
      ? "bg-amber-500"
      : state === "absent"
      ? "bg-gray-600"
      : "bg-slate-500/60";
  return (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-md text-sm md:text-base h-12 md:h-14 px-2 ${
        wide ? "col-span-2" : "min-w-[2.1rem]"
      }`}
    >
      {label}
    </button>
  );
};

const Keyboard: React.FC<{
  layout: string[][];
  state: Record<string, KeyState>;
  onKey: (k: string) => void;
}> = ({ layout, state, onKey }) => {
  return (
    <div className="grid gap-2">
      {layout.map((row, i) => (
        <div key={i} className="grid grid-cols-10 gap-2">
          {row.map((k) => (
            <Key
              key={k}
              label={k}
              state={state[k]}
              onClick={() => onKey(k === "DEL" ? "DEL" : k)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Wordle;
