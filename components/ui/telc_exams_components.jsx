import React, { useEffect, useState, useRef } from 'react';

/*
  telc-exams-components.jsx
  Single-file collection of React components (Next.js + Tailwind-ready) that implement:
  - Exams gallery (image + level + title)
  - Exam detail page with description and "Start Exam" button
  - Stage runner and per-stage components for all telc stages described by user
  - Timer, audio controls (placeholders), responsive layout
  - LocalStorage-based persistence (answers + progress)

  Also contains:
  - Fake seed data for exams
  - Suggested DB schemas for MongoDB (NoSQL) and PostgreSQL (SQL)
  - Example API route shapes (to be turned into real Next.js API routes)

  How to use:
  - Drop this file into a components/ or lib/ folder and import the exported components
  - The main exported component below is `TelcExamApp` which demonstrates usage

  Notes & limitations:
  - Audio is mocked using placeholder URLs. Replace with real audio files for listening stages.
  - The components are intentionally simple and focussed on state, styling, and flow.
*/

/* ----------------------------- FAKE DATA --------------------------------- */
const FAKE_EXAMS = [
  {
    id: 'telc-b1-1',
    title: 'telc deutsch b1 - practice set 1',
    level: 'B1',
    cover: '/images/telc-b1-cover.jpg',
    description:
      'Full B1 exam simulation: Leseverstehen, Sprachbausteine, Hörverstehen, Schriftlicher Ausdruck. Timed sections and stage-by-stage navigation.',
    stages: [
      { id: 'lv1', title: 'Leseverstehen — Teil 1', type: 'zuordnung-smalltexts', durationMin: 10 },
      { id: 'lv2', title: 'Leseverstehen — Teil 2', type: 'multiple-choice-continue', durationMin: 12 },
      { id: 'lv3', title: 'Leseverstehen — Teil 3', type: 'zuordnung-posters', durationMin: 8 },
      { id: 'sb1', title: 'Sprachbausteine — Teil 1', type: 'grammar-mc', durationMin: 10 },
      { id: 'sb2', title: 'Sprachbausteine — Teil 2', type: 'lexik-mc', durationMin: 12 },
      { id: 'hv1', title: 'Hörverstehen — Teil 1', type: 'listening-30s-oneread', durationMin: 8 },
      { id: 'hv2', title: 'Hörverstehen — Teil 2', type: 'listening-1min-twice', durationMin: 10 },
      { id: 'hv3', title: 'Hörverstehen — Teil 3', type: 'listening-30s-twice', durationMin: 6 },
      { id: 'schrift', title: 'Schriftlicher Ausdruck', type: 'writing-email', durationMin: 30 },
    ],
  },
  // add more exams as needed
];

/* ----------------------------- HELPERS ---------------------------------- */
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage error', e);
  }
};
const loadFromStorage = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};

/* ----------------------------- STYLES ----------------------------------- */
// Tailwind utility classes are used inline in JSX. No CSS file required.

/* --------------------------- Timer Component ----------------------------- */
function Timer({ minutes, running, onTick, onFinish }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  useEffect(() => {
    setSecondsLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        onTick && onTick(next);
        if (next <= 0) {
          clearInterval(id);
          onFinish && onFinish();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');
  return (
    <div className="inline-flex items-center gap-2 bg-white/5 p-2 rounded-lg">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-mono text-lg">{mm}:{ss}</span>
    </div>
  );
}

/* ------------------------- Stage Components ------------------------------ */

function LeseZuordnungSmallTexts({ stageId, questions, onAnswer, answers }) {
  // 10 sentences, 5 small texts to match
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Zuordnungsaufgaben — kleine Texte</h3>
      <p className="text-sm text-muted-foreground">Ziehe oder wähle das richtige kleine Textfragment zur Satznummer.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/5 p-4 rounded-md">
          <h4 className="font-medium">Kleine Texte</h4>
          <ul className="mt-2 space-y-2">
            {questions.texts.map((t) => (
              <li key={t.id} className="p-2 border rounded">{t.text}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 p-4 rounded-md">
          <h4 className="font-medium">Sätze — wähle zu</h4>
          <ul className="mt-2 space-y-2">
            {questions.sentences.map((s) => (
              <li key={s.id} className="flex items-center justify-between p-2 border rounded">
                <div>{s.text}</div>
                <select
                  value={answers[s.id] ?? ''}
                  onChange={(e) => onAnswer(s.id, e.target.value)}
                  className="bg-transparent"
                >
                  <option value="">—</option>
                  {questions.texts.map((t) => (
                    <option key={t.id} value={t.id}>{`Text ${t.id}`}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MultipleChoiceContinue({ stageId, passage, items, onAnswer, answers }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Multiple Choice — Fortsetzungen</h3>
      <p className="text-sm">Lies den langen Text und wähle die passende Fortsetzung für jede Satznummer.</p>
      <div className="bg-white/5 p-4 rounded">
        <div className="prose max-w-none">{passage}</div>
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="p-3 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-2 md:mb-0">{it.prompt}</div>
            <div className="flex gap-2">
              {it.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => onAnswer(it.id, i)}
                  className={`px-3 py-1 rounded ${answers[it.id] === i ? 'bg-indigo-600 text-white' : 'bg-white/5'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrammarMC({ stageId, text, blanks, onAnswer, answers }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sprachbausteine — Grammatik</h3>
      <p className="text-sm">Ergänze das Textfeld mit der richtigen Option für jede Lücke.</p>
      <div className="bg-white/5 p-4 rounded">
        <p className="prose max-w-none">
          {blanks.map((b) => (
            <span key={b.id} className="inline-block align-middle">
              {b.before}
              <select value={answers[b.id] ?? ''} onChange={(e) => onAnswer(b.id, e.target.value)} className="mx-1">
                <option value="">—</option>
                {b.options.map((o, i) => (
                  <option key={i} value={o}>{o}</option>
                ))}
              </select>
              {b.after}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function ListeningStage({ stageId, prompts, audioUrl, readTimeSec = 30, repeats = 1, onAnswer, answers }) {
  const audioRef = useRef(null);
  const [readCountdown, setReadCountdown] = useState(readTimeSec);
  const [phase, setPhase] = useState('read'); // 'read' | 'playing' | 'done'

  useEffect(() => {
    if (phase === 'read') {
      setReadCountdown(readTimeSec);
      const id = setInterval(() => setReadCountdown((s) => {
        if (s <= 1) {
          clearInterval(id);
          setPhase('playing');
        }
        return s - 1;
      }), 1000);
      return () => clearInterval(id);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && audioRef.current) {
      // try to play the audio; if external files have CORS issues you may need server-hosted files
      audioRef.current.play();
      audioRef.current.onended = () => {
        if (repeats > 1) {
          // if repeats > 1 we might re-trigger play (handled by repeating file) - simplified here
        }
        setPhase('done');
      };
    }
  }, [phase]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Hörverstehen</h3>
      <p className="text-sm">Du hast <strong>{readTimeSec}s</strong> zum Lesen. Danach wird der Text abgespielt.</p>
      <div className="bg-white/5 p-4 rounded">
        <div className="mb-3">Lesezeit: {phase === 'read' ? `${readCountdown}s` : 'Abspielen...'}</div>
        <audio ref={audioRef} src={audioUrl} preload="auto" />
        <ul className="space-y-2">
          {prompts.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-2 border rounded">
              <div>{p.text}</div>
              <select value={answers[p.id] ?? ''} onChange={(e) => onAnswer(p.id, e.target.value)}>
                <option value="">—</option>
                <option value="true">Richtig</option>
                <option value="false">Falsch</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WritingEmail({ prompt, onSave, draft }) {
  const [text, setText] = useState(draft || '');
  useEffect(() => setText(draft || ''), [draft]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Schriftlicher Ausdruck — E‑Mail</h3>
      <p className="text-sm">Antworten Sie auf die gegebene E‑Mail. Nutzen Sie angemessene Grußformen und Struktur.</p>
      <div className="bg-white/5 p-4 rounded">
        <div className="prose max-w-none mb-3">{prompt}</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="w-full p-3 rounded bg-white/5" />
        <div className="flex justify-end gap-2">
          <button onClick={() => onSave(text)} className="px-4 py-2 rounded bg-indigo-600 text-white">Save draft</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Stage Dispatcher ------------------------------ */
function StageRenderer({ stage, state, setState, onNext }) {
  const answers = state.answers || {};
  const setAnswer = (qid, val) => {
    const next = { ...answers, [qid]: val };
    setState((s) => ({ ...s, answers: next }));
  };

  // Fake question payloads — in a real app you load these from DB/api
  const FAKE_PAYLOADS = {
    'zuordnung-smalltexts': {
      texts: [
        { id: 'A', text: 'Kleiner Text A — Angebot' },
        { id: 'B', text: 'Kleiner Text B — Info' },
        { id: 'C', text: 'Kleiner Text C — Einladung' },
        { id: 'D', text: 'Kleiner Text D — Notiz' },
        { id: 'E', text: 'Kleiner Text E — Ankündigung' },
      ],
      sentences: Array.from({ length: 10 }).map((_, i) => ({ id: `s${i + 1}`, text: `Satz ${i + 1}` })),
    },
    'multiple-choice-continue': {
      passage: 'Langer Text... (hier ein längerer Absatz als Beispiel).',
      items: Array.from({ length: 5 }).map((_, i) => ({ id: `mc${i + 1}`, prompt: `Satz ${i + 1}`, options: ['A', 'B', 'C'] })),
    },
    'zuordnung-posters': { /* similar structure with poster images */ texts: [{id:'P1', text:'Poster 1'},{id:'P2',text:'Poster 2'},{id:'P3',text:'Poster 3'}], sentences: Array.from({length:6}).map((_,i)=>({id:`ps${i+1}`,text:`Satz ${i+1}`})) },
    'grammar-mc': {
      blanks: Array.from({ length: 10 }).map((_, i) => ({ id: `b${i + 1}`, before: '...', after: '...', options: ['Var1', 'Var2', 'Var3'] })),
    },
    'lexik-mc': {
      blanks: Array.from({ length: 10 }).map((_, i) => ({ id: `l${i + 1}`, before: '...', after: '...', options: Array.from({ length: 5 }).map((_, j) => `W${j + 1}`) })),
    },
    'listening-30s-oneread': {
      prompts: Array.from({ length: 10 }).map((_, i) => ({ id: `hp${i + 1}`, text: `Aussage ${i + 1}` })),
      audioUrl: '/audio/sample1.mp3',
    },
    'listening-1min-twice': {
      prompts: Array.from({ length: 10 }).map((_, i) => ({ id: `hp2_${i + 1}`, text: `Aussage ${i + 1}` })),
      audioUrl: '/audio/sample2.mp3',
    },
    'listening-30s-twice': {
      prompts: Array.from({ length: 5 }).map((_, i) => ({ id: `hp3_${i + 1}`, text: `Aussage ${i + 1}` })),
      audioUrl: '/audio/sample3.mp3',
    },
    'writing-email': { prompt: 'Sehr geehrte/r..., ich schreibe Ihnen bezüglich ...' },
  };

  const payload = FAKE_PAYLOADS[stage.type];
  switch (stage.type) {
    case 'zuordnung-smalltexts':
      return (
        <LeseZuordnungSmallTexts
          stageId={stage.id}
          questions={payload}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'multiple-choice-continue':
      return (
        <MultipleChoiceContinue
          stageId={stage.id}
          passage={payload.passage}
          items={payload.items}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'zuordnung-posters':
      return (
        <LeseZuordnungSmallTexts
          stageId={stage.id}
          questions={payload}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'grammar-mc':
      return <GrammarMC stageId={stage.id} text={''} blanks={payload.blanks} onAnswer={setAnswer} answers={answers} />;
    case 'lexik-mc':
      return <GrammarMC stageId={stage.id} text={''} blanks={payload.blanks} onAnswer={setAnswer} answers={answers} />;
    case 'listening-30s-oneread':
      return (
        <ListeningStage
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={30}
          repeats={1}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'listening-1min-twice':
      return (
        <ListeningStage
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={60}
          repeats={2}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'listening-30s-twice':
      return (
        <ListeningStage
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={30}
          repeats={2}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case 'writing-email':
      return <WritingEmail prompt={payload.prompt} onSave={(t) => setAnswer('draft', t)} draft={answers.draft} />;
    default:
      return <div>Unbekannter Aufgabentyp</div>;
  }
}

/* ------------------------- Exam Detail / Runner ------------------------- */
export function ExamDetail({ exam, onBack }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [examState, setExamState] = useState(() =>
    loadFromStorage(`examState:${exam.id}`, {})
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [sectionSecondsLeft, setSectionSecondsLeft] = useState(0);

  useEffect(() => saveToStorage(`examState:${exam.id}`, examState), [examState]);

  function startStage(index) {
    setCurrentStageIndex(index);
    setTimerRunning(true);
    const minutes = exam.stages[index].durationMin || 10;
    setSectionSecondsLeft(minutes * 60);
    setExamState((s) => ({
      ...s,
      startedAt: s.startedAt || Date.now(),
      stages: {
        ...(s.stages || {}),
        [exam.stages[index].id]: { startedAt: Date.now(), answers: {} },
      },
    }));
  }

  function finishStage(index) {
    setExamState((s) => ({
      ...s,
      stages: {
        ...(s.stages || {}),
        [exam.stages[index].id]: {
          ...(s.stages?.[exam.stages[index].id] || {}),
          finishedAt: Date.now(),
          answers: s.answers || {},
        },
      },
    }));
    setTimerRunning(false);
  }

  function handleNext() {
    if (currentStageIndex === null) return;
    finishStage(currentStageIndex);
    const next = currentStageIndex + 1;
    if (next < exam.stages.length) startStage(next);
    else setCurrentStageIndex(null);
  }

  function handleSaveAnswers(stageId, answers) {
    setExamState((s) => ({
      ...s,
      stages: {
        ...(s.stages || {}),
        [stageId]: { ...(s.stages?.[stageId] || {}), answers },
      },
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">{exam.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Level: {exam.level}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            ← Back
          </button>
          {currentStageIndex === null ? (
            <button
              onClick={() => startStage(0)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition"
            >
              Start Exam
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Timer
                minutes={Math.ceil(sectionSecondsLeft / 60)}
                running={timerRunning}
                onTick={(s) => setSectionSecondsLeft(s)}
                onFinish={() => setTimerRunning(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Exam Overview or Stage */}
      {currentStageIndex === null ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Exam Structure */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-3">Exam Structure</h3>
            <ol className="space-y-3">
              {exam.stages.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-indigo-50 transition"
                >
                  <div>
                    <div className="font-medium text-gray-800">{s.title}</div>
                    <div className="text-sm text-gray-500">Duration: {s.durationMin} min</div>
                  </div>
                  <button
                    onClick={() => startStage(i)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Start
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Exam Info */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-3">Information</h3>
            <p className="text-gray-600">{exam.description}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xl font-semibold text-gray-900">
                {exam.stages[currentStageIndex].title}
              </div>
              <div className="text-sm text-gray-500">
                Stage {currentStageIndex + 1} of {exam.stages.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  finishStage(currentStageIndex);
                  setCurrentStageIndex(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Stop
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Next
              </button>
            </div>
          </div>

          {/* Stage Content */}
          <StageRenderer
            stage={exam.stages[currentStageIndex]}
            state={examState.stages?.[exam.stages[currentStageIndex].id] || { answers: {} }}
            setState={(updater) => {
              const newState =
                typeof updater === "function"
                  ? updater(examState.stages?.[exam.stages[currentStageIndex].id] || { answers: {} })
                  : updater;
              handleSaveAnswers(exam.stages[currentStageIndex].id, newState.answers);
              setExamState((s) => ({
                ...s,
                stages: { ...(s.stages || {}), [exam.stages[currentStageIndex].id]: newState },
              }));
            }}
            onNext={handleNext}
          />
        </div>
      )}

      {/* Final Submit */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const stages = exam.stages.map((s) => ({
              id: s.id,
              answers: examState.stages?.[s.id]?.answers || {},
            }));
            const total = stages.reduce((acc, st) => acc + Object.keys(st.answers || {}).length, 0);
            alert(`Final submit — you answered ${total} items. (Implement scoring on server)`);
          }}
          className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow-md hover:bg-emerald-700 transition"
        >
          Submit Exam
        </button>
      </div>
    </motion.div>
  );
}


/* --------------------------- Exams List UI ------------------------------- */
import { motion } from "framer-motion";

export function ExamsGallery({ exams = FAKE_EXAMS, onOpen }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {exams.map((ex) => (
        <motion.div
          key={ex.id}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl overflow-hidden shadow-md border hover:shadow-xl transition-all duration-300 flex flex-col"
        >
          <div className="relative h-44 w-full">
            <img
              src={ex.cover}
              alt={ex.title}
              className="object-cover h-full w-full transform hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {ex.level}
            </span>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-bold text-lg text-gray-900 truncate">{ex.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {ex.description || "Prüfungsvorbereitung für Ihr Sprachniveau."}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onOpen(ex)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Starten
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}


/* ------------------------ Top-level demo App ----------------------------- */
export default function TelcExamApp() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">telc Exam Center — Demo</h1>
      </header>
      {!selected ? (
        <ExamsGallery exams={FAKE_EXAMS} onOpen={(e) => setSelected(e)} />
      ) : (
        <ExamDetail exam={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ---------------------------- DB SCHEMAS --------------------------------

  Recommended approach: Use a document DB (MongoDB) for flexible exam content, or Postgres for stricter schemas.

  MONGODB (NoSQL) sample document (exams collection):
  {
    _id: ObjectId,
    slug: 'telc-b1-1',
    title: 'telc deutsch b1 - practice set 1',
    level: 'B1',
    description: '...',
    coverUrl: '/images/..',
    stages: [
      { id: 'lv1', title: 'Leseverstehen — Teil 1', type: 'zuordnung-smalltexts', durationMin: 10, payload: { texts: [...], sentences: [...] } },
      ...
    ],
    createdAt: ISODate,
  }

  USER / ATTEMPT collection (store per-user progress & answers):
  {
    _id: ObjectId,
    userId: 'user_abc',
    examSlug: 'telc-b1-1',
    startedAt: ISODate,
    finishedAt: ISODate | null,
    stages: {
      lv1: { startedAt: ISODate, finishedAt: ISODate, answers: { s1: 'A', s2: 'C', ... } },
      sb1: { ... }
    },
    score: { byStage: { lv1: 12, sb1: 8 }, total: 80 }
  }

  POSTGRES (SQL) suggested tables (normalized):

  exams (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    level TEXT,
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMP
  );

  stages (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id),
    slug TEXT,
    title TEXT,
    type TEXT,
    duration_min INTEGER,
    payload_json JSONB
  );

  attempts (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    exam_id INTEGER REFERENCES exams(id),
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    meta_json JSONB
  );

  attempt_stage_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES attempts(id),
    stage_id INTEGER REFERENCES stages(id),
    answers_json JSONB,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
  );

  Notes: Use JSONB payloads for the flexible question content (texts, options, audio links). This keeps structure and still allows SQL querying if needed.

/* -------------------------- Example API outlines -------------------------
  GET /api/exams -> returns list of exams
  GET /api/exams/[slug] -> exam detail with stages (without answers)
  POST /api/attempts -> create new attempt (userId, examSlug) -> returns attempt id
  POST /api/attempts/[id]/stages/[stageId]/answers -> save answers for a stage
  POST /api/attempts/[id]/submit -> finalize and compute score server-side

  In Next.js place these under /pages/api/... or /app/api/...

*/
