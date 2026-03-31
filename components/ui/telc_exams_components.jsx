import React, { useEffect, useState, useRef } from "react";
import logo from "@/assets/logos/B1.png";

/* ----------------------------- HELPERS ---------------------------------- */
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("storage error", e);
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

const emptyExamState = () => {
  localStorage.setItem("examState:undefined", JSON.stringify({}));
};

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
    .padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  return (
    <div className="inline-flex items-center gap-2 bg-white/5 p-2 rounded-lg">
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M12 6v6l4 2"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-mono text-lg">
        {mm}:{ss}
      </span>
    </div>
  );
}

/* ------------------------- Stage Components ------------------------------ */

function LeseZuordnungSmallTexts({ stageId, questions, onAnswer, answers }) {
  // 10 sentences, 5 small texts to match
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Zuordnungsaufgaben — kleine Texte
      </h3>
      <p className="text-sm text-muted-foreground">
        Ziehe oder wähle das richtige kleine Textfragment zur Satznummer.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/5 p-4 rounded-md">
          <h4 className="font-medium">Kleine Texte</h4>
          <ul className="mt-2 space-y-2">
            {questions.texts.map((t) => (
              <li key={t.id} className="p-2 border rounded">
                {t.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 p-4 rounded-md">
          <h4 className="font-medium">Sätze — wähle zu</h4>
          <ul className="mt-2 space-y-2">
            {questions.sentences.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>{s.text}</div>
                <select
                  value={answers[s.id] ?? ""}
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

function MultipleChoiceContinue({
  stageId,
  passage,
  items,
  onAnswer,
  answers,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Multiple Choice — Fortsetzungen</h3>
      <p className="text-sm">
        Lies den langen Text und wähle die passende Fortsetzung für jede
        Satznummer.
      </p>
      <div className="bg-white/5 p-4 rounded">
        <div className="prose max-w-none text-lg">{passage}</div>
      </div>
      <ul className="space-y-4">
        {items.map((it) => (
          <li
            key={it.id}
            className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200
                 flex flex-col gap-4 shadow-sm hover:shadow-md"
          >
            <div className="text-base font-medium">{it.prompt}</div>

            <div className="flex flex-col gap-2">
              {it.options.map((opt, i) => {
                const isSelected = answers[it.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => onAnswer(it.id, i)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/10 border border-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-400/50"
                }`}
                  >
                    {opt}
                  </button>
                );
              })}
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
      <p className="text-sm">
        Ergänze das Textfeld mit der richtigen Option für jede Lücke.
      </p>
      <div className="bg-white/5 p-4 rounded">
        <p className="prose max-w-none text-lg">
          {blanks.map((b) => (
            <span key={b.id} className="align-middle">
              {b.before}
              <select
                value={answers[b.id] ?? ""}
                onChange={(e) => onAnswer(b.id, e.target.value)}
                className="mx-1 cursor-pointer border-b border-black"
              >
                <option value="">—</option>
                {b.options.map((o, i) => (
                  <option key={i} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {b.after} &nbsp;
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function ListeningStage({
  stageId,
  prompts,
  audioUrl,
  readTimeSec = 30,
  repeats = 1,
  onAnswer,
  answers,
}) {
  const audioRef = useRef(null);
  const [readCountdown, setReadCountdown] = useState(readTimeSec);
  const [phase, setPhase] = useState("read"); // 'read' | 'playing' | 'done'
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [canPlay, setCanPlay] = useState(false);

  // Countdown for reading phase
  useEffect(() => {
    if (phase === "read") {
      setReadCountdown(readTimeSec);
      const id = setInterval(() => {
        setReadCountdown((s) => {
          if (s <= 1) {
            clearInterval(id);
            setPhase("playing");
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [phase, readTimeSec]);

  // Ensure audio is loaded and playable
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.oncanplaythrough = () => setCanPlay(true);
    }
  }, [audioUrl]);

  // Play audio automatically (no button)
  useEffect(() => {
    if (phase === "playing" && audioRef.current && canPlay) {
      const playAudio = () => {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch(() =>
            console.warn("Autoplay blocked — user interaction may be required")
          );
      };

      playAudio();

      audioRef.current.onended = () => {
        if (currentRepeat + 1 < repeats) {
          // Wait 2 seconds between repeats
          setTimeout(() => {
            setCurrentRepeat((r) => r + 1);
            playAudio();
          }, 2000);
        } else {
          setPhase("done");
        }
      };
    }
  }, [phase, currentRepeat, repeats, canPlay]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Hörverstehen</h3>
      <p className="text-sm">
        Du hast <strong>{readTimeSec}s</strong> zum Lesen. Danach wird das Audio
        automatisch abgespielt.
      </p>

      <div className="bg-white/5 p-4 rounded">
        <div className="mb-3">
          {phase === "read"
            ? `Lesezeit: ${readCountdown}s`
            : phase === "playing"
            ? `Wiedergabe (${currentRepeat + 1}/${repeats})...`
            : "Abgeschlossen"}
        </div>

        <audio ref={audioRef} src={audioUrl} preload="auto" />

        <ul className="space-y-2">
          {prompts.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>{p.text}</div>
              <select
                value={answers[p.id] ?? ""}
                onChange={(e) => onAnswer(p.id, e.target.value)}
              >
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
  const [text, setText] = useState(draft || "");
  useEffect(() => setText(draft || ""), [draft]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Schriftlicher Ausdruck — E‑Mail</h3>
      <p className="text-sm">
        Antworten Sie auf die gegebene E‑Mail. Nutzen Sie angemessene Grußformen
        und Struktur.
      </p>
      <div className="bg-white/5 p-4 rounded">
        <div
          className="prose max-w-none mb-3"
          dangerouslySetInnerHTML={{ __html: prompt ?? defaultPrompt }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full p-3 rounded bg-white/5 border border-indigo-200"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onSave(text)}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            Save draft
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Stage Dispatcher ------------------------------ */
function StageRenderer({ stage, state, setState, payloads, onNext }) {
  const answers = state.answers || {};
  const setAnswer = (qid, val) => {
    const next = { ...answers, [qid]: val };
    setState((s) => ({ ...s, answers: next }));
  };

  const payload = payloads[stage.type];
  switch (stage.type) {
    case "zuordnung-smalltexts":
      return (
        <LeseZuordnungSmallTexts
          stageId={stage.id}
          questions={payload}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "multiple-choice-continue":
      return (
        <MultipleChoiceContinue
          stageId={stage.id}
          passage={payload.passage}
          items={payload.items}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "zuordnung-posters":
      return (
        <LeseZuordnungSmallTexts
          stageId={stage.id}
          questions={payload}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "grammar-mc":
      return (
        <GrammarMC
          stageId={stage.id}
          text={""}
          blanks={payload.blanks}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "lexik-mc":
      return (
        <GrammarMC
          stageId={stage.id}
          text={""}
          blanks={payload.blanks}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "listening-30s-oneread":
      return (
        <ListeningStage
          key={stage.id}
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={3}
          repeats={1}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "listening-1min-twice":
      return (
        <ListeningStage
          key={stage.id}
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={6}
          repeats={2}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "listening-30s-twice":
      return (
        <ListeningStage
          key={stage.id}
          stageId={stage.id}
          prompts={payload.prompts}
          audioUrl={payload.audioUrl}
          readTimeSec={30}
          repeats={2}
          onAnswer={setAnswer}
          answers={answers}
        />
      );
    case "writing-email":
      return (
        <WritingEmail
          prompt={payload.prompt}
          onSave={(t) => setAnswer("draft", t)}
          draft={answers.draft}
        />
      );
    default:
      return <div>Unbekannter Aufgabentyp</div>;
  }
}

/* ------------------------- Exam Detail / Runner ------------------------- */
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export function ExamDetail({ exam, onBack }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [examState, setExamState] = useState(() =>
    loadFromStorage(`examState:${exam.id}`, {})
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [sectionSecondsLeft, setSectionSecondsLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { width, height } = useWindowSize();

  useEffect(
    () => saveToStorage(`examState:${exam.id}`, examState),
    [examState],
  );

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
    const stageId = exam.stages[index].id;
    setExamState((s) => {
      const prevStage = s.stages?.[stageId] || { answers: {} };
      return {
        ...s,
        stages: {
          ...(s.stages || {}),
          [stageId]: {
            ...prevStage,
            finishedAt: Date.now(),
          },
        },
      };
    });
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

  const playSuccessSound = () => {
    const audio = new Audio("/sounds/success.wav");
    audio.volume = 0.5;
    audio.play();
  };

  const calculateResults = (exam, answers) => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    const stageResults = [];

    for (const stage of exam.stages) {
      const stageId = stage.id;
      const answerStage = answers.find((s) => s.id === stageId);
      const payload = exam.payloads[stage.type];
      if (!answerStage || !payload) continue;

      const results = [];
      let correctCount = 0;
      let count = 0;

      if (payload.solutions) {
        for (const [qid, solution] of Object.entries(payload.solutions)) {
          count++;
          const userAns = answerStage.answers[qid];
          const isCorrect = userAns === solution;
          if (isCorrect) correctCount++;
          results.push({ id: qid, text: qid, userAns, solution, isCorrect });
        }
      } else if (payload.items) {
        for (const item of payload.items) {
          count++;
          const userAns = answerStage.answers[item.id];
          const isCorrect = userAns === item.correct;
          if (isCorrect) correctCount++;
          results.push({
            id: item.id,
            text: item.prompt,
            userAns: item.options[userAns],
            solution: item.options[item.correct],
            isCorrect,
          });
        }
      } else if (payload.blanks) {
        for (const blank of payload.blanks) {
          count++;
          const userAns = answerStage.answers[blank.id];
          const isCorrect = userAns === blank.correct;
          if (isCorrect) correctCount++;
          results.push({
            id: blank.id,
            text: `${blank.before}_____${blank.after}`,
            userAns,
            solution: blank.correct,
            isCorrect,
          });
        }
      } else if (payload.prompts && payload.correctAnswers) {
        for (let i = 0; i < payload.prompts.length; i++) {
          const prompt = payload.prompts[i];
          const qid = prompt.id;
          const userAns = answerStage.answers[qid];
          const correct = payload.correctAnswers[i] ? "true" : "false";
          const isCorrect = userAns === correct;
          count++;
          if (isCorrect) correctCount++;
          results.push({
            id: qid,
            text: prompt.text,
            userAns: userAns === "true" ? "Richtig" : "Falsch",
            solution: payload.correctAnswers[i] ? "Richtig" : "Falsch",
            isCorrect,
          });
        }
      } else if (stage.type === "writing-email") {
        results.push({
          id: "brief",
          text: "Schriftlicher Ausdruck",
          userAns: answerStage.answers.draft,
          solution: "Immer korrekt bewertet (manuelle Prüfung erforderlich)",
          isCorrect: true,
        });
        correctCount = 1;
        count = 1;
      }

      totalCorrect += correctCount;
      totalQuestions += count;

      stageResults.push({
        stageId,
        title: stage.title,
        correctCount,
        count,
        results,
      });
    }

    const score = ((totalCorrect / totalQuestions) * 100).toFixed(1);
    return { score, totalCorrect, totalQuestions, stageResults };
  };

  async function handleSubmit() {
    playSuccessSound();

    // Calculate real score
    const { score, totalCorrect, totalQuestions, stageResults } =
      calculateResults(
        exam,
        exam.stages.map((s) => ({
          id: s.id,
          answers: examState.stages?.[s.id]?.answers || {},
        }))
      );
    setFinalScore(score);
    setShowResult(true);

    // Prepare answers payload and include examId
    const answersPayload = exam.stages.map((s) => ({
      stageId: s.id,
      answers: examState.stages?.[s.id]?.answers || {},
      examId: exam.id, // added examId here
    }));

    try {
      const res = await fetch("/api/saveExams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId: exam._id, // send examId at top level too
          score: Math.round(Number(score)), // convert to integer
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save exam");
      console.log("Saved exam result:", data);
    } catch (error) {
      console.error("Error saving exam:", error);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {exam.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Level: {exam.level}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={onBack}
              className="cursor-pointer px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              ← Zurück
            </button>
            {currentStageIndex === null ? (
              <button
                onClick={() => startStage(0)}
                className="cursor-pointer px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Prüfung starten
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

        {/* Exam Content */}
        {currentStageIndex === null ? (
          <div className="grid md:grid-cols-2 gap-6">
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
                      <div className="text-sm text-gray-500">
                        Duration: {s.durationMin} min
                      </div>
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

            <StageRenderer
              payloads={exam.payloads}
              stage={exam.stages[currentStageIndex]}
              state={
                examState.stages?.[exam.stages[currentStageIndex].id] || {
                  answers: {},
                }
              }
              setState={(updater) => {
                const newState =
                  typeof updater === "function"
                    ? updater(
                        examState.stages?.[
                          exam.stages[currentStageIndex].id
                        ] || { answers: {} }
                      )
                    : updater;
                handleSaveAnswers(
                  exam.stages[currentStageIndex].id,
                  newState.answers
                );
                setExamState((s) => ({
                  ...s,
                  stages: {
                    ...(s.stages || {}),
                    [exam.stages[currentStageIndex].id]: newState,
                  },
                }));
              }}
              onNext={handleNext}
            />
          </div>
        )}

        {/* Final Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow-md hover:bg-emerald-700 transition"
          >
            Submit Exam
          </button>
        </div>
      </motion.div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Confetti
            width={width}
            height={height}
            numberOfPieces={250}
            recycle={false}
          />
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold text-emerald-600 mb-2">
              🎉 Congratulations!
            </h2>
            <p className="text-gray-700 mb-4">
              You completed the exam with a score of{" "}
              <span className="font-semibold text-indigo-600">
                {finalScore}%
              </span>
              .
            </p>
            <button
              onClick={() => {
                setShowResult(false);
                window.location.reload(); // Refresh the page
              }}
              className="px-6 py-2 mt-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------- Exams List UI ------------------------------- */
import { motion } from "framer-motion";

export function ExamsGallery({ exams = TELC_B1_EXAM, onOpen }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleStart = (ex) => {
    try {
      emptyExamState(); // reset localStorage key
      onOpen(ex);       // open selected exam
    } catch (err) {
      console.error("Error starting exam:", err);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(exams.length / itemsPerPage);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {currentExams.map((ex) => (
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
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {ex.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {ex.description || "Prüfungsvorbereitung für Ihr Sprachniveau."}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleStart(ex)}
                  className="cursor-pointer px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  Starten
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md border ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------ Top-level demo App ----------------------------- */
export default function TelcExamApp() {
  const [exams, setExams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch("/api/getTelcExams");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams:", err);
        setError("Fehler beim Laden der Prüfungen.");
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600">Lade Prüfungen...</div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">telc Exam Center — Demo</h1>
      </header>

      {!selected ? (
        <ExamsGallery exams={exams} onOpen={(e) => setSelected(e)} />
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
