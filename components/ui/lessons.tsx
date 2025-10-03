"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import parse from 'html-react-parser';
import TelcExamApp from "@/components/ui/telc_exams_components";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  FaBaby,
  FaUserGraduate,
  FaBrain,
  FaComments,
  FaBook,
  FaVolumeUp,
} from "react-icons/fa";

interface StepTheory {
  type: "theory";
  content: { text: string; image?: string };
}
interface StepInput {
  type: "exercise";
  content: { question: string; answer: string; type: "input" };
}
interface StepMCQ {
  type: "exercise";
  content: {
    question: string;
    options: string[];
    correctOption: string;
    type: "multiple-choice";
  };
}
interface StepMatching {
  type: "exercise";
  content: {
    question?: string;
    pairs: { left: string; right: string }[];
    type: "matching";
  };
}
type LessonStep = StepTheory | StepInput | StepMCQ | StepMatching;

interface Lesson {
  id: string;
  index: number;
  title: string;
  description: string;
  icon: string;
  steps: LessonStep[];
}

const levels = [
  { level: "A1", title: "Începător", icon: <FaBaby className="text-4xl text-teal-600" />, bg: "bg-teal-50", image: /*...*/ "" },
  { level: "A2", title: "Elementar", icon: <FaUserGraduate className="text-4xl text-teal-600" />, bg: "bg-yellow-50", image: "" },
  { level: "B1", title: "Intermediar", icon: <FaBrain className="text-4xl text-teal-600" />, bg: "bg-blue-50", image: "" },
];

// Simulated progress loader
const getProgress = (id: string) => {
  const xp = Math.floor(Math.random() * 10000);
  const percent = Math.floor((xp / 10000) * 100);
  return { xp, percent };
};

// Drag & Drop Helpers
function Draggable({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: transform ? `translate(${transform.x}px,${transform.y}px)` : undefined }} {...listeners} {...attributes}
         className="bg-white shadow p-2 rounded border cursor-move">
      {children}
    </div>
  );
}


function Droppable({ id, children }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef}
         className="min-h-[40px] border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50">
      {children}
    </div>
  );
}

export default function Lessons() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [isCorrect, setIsCorrect] = useState(false);
  const [xp, setXp] = useState(0);
  const [displayedXp, setDisplayedXp] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const [savedProgressIndex, setSavedProgressIndex] = useState(0);


  // load lessons when level changes
  useEffect(() => {
  if (!selectedLevel) return;

  fetch(`/api/getLessons?idPrefix=${selectedLevel}`)
    .then(res => res.json())
    .then((data: Lesson[]) => {
      setLessons(data);
    })
    .catch(console.error);
}, [selectedLevel]);

  const currentStep = selectedLesson?.steps[currentStepIndex];
const handleCheckAnswer = () => {
  if (!currentStep || currentStep.type !== "exercise") return;

  const c = currentStep.content as any;
  let correct = false;

  if (c.type === "input") {
    correct = userAnswer.trim().toLowerCase() === c.answer.toLowerCase();
  }

  if (c.type === "multiple-choice") {
    correct = selectedOption === c.correctOption;
  }

  if (c.type === "matching") {
    correct = c.pairs.every(p => matchingAnswers[p.left] === p.right);
  }

  setIsCorrect(correct);
  setHasChecked(true); // <- DOAR acum îl setăm

  if (correct) {
    setXp(prev => prev + 100);
    playSuccessSound();
  }
};


   function speak({ text }: any) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE'; // German language
  utterance.rate = 0.5; // slower than normal (0.1 to 10, default 1)
  console.log(text);
  speechSynthesis.cancel(); // stop any ongoing speech
  speechSynthesis.speak(utterance);
}

  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.wav');
    audio.volume = 0.5;
    audio.play();
  };

  const handleNext = async () => {
    console.log(selectedLesson?.steps.length)
  try {
    // Call your API to update progress in DB
    const res = await fetch("/api/saveLessonProgress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: selectedLesson?.id }), // use your current lessonId
    });

    const data = await res.json();

    // Get new position from DB (fallback to local increment if needed)
    const newPosition = data.lesson?.position ?? currentStepIndex + 1;

    // Update local state
    setCurrentStepIndex(newPosition);
    setSavedProgressIndex(newPosition);
    setUserAnswer("");
    setSelectedOption(null);
    setMatchingAnswers({});
    setIsCorrect(false);
    setHasChecked(false);

    console.log("Updated step index:", newPosition);
    // setCurrentStepIndex((prev) => prev + 1);
    setDisplayedXp(data.lesson?.points); // instant increment for better UX
  } catch (err) {
    console.error("Error updating lesson progress:", err);

    // fallback to local increment if API fails
    setCurrentStepIndex((prev) => prev + 1);
  }
};
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setUserAnswer("");
      setSelectedOption(null);
      setMatchingAnswers({});
      setIsCorrect(false);
      setHasChecked(false);
    }
  };

  const handleNextCheck = () => {
    if (currentStepIndex >= 0) {
      setCurrentStepIndex((prev) => prev + 1);   
      setUserAnswer("");
      setSelectedOption(null);
      setMatchingAnswers({});
      setIsCorrect(false);
      setHasChecked(false);
    }
  };



  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (over) {
      setMatchingAnswers(prev => ({ ...prev, [over.id]: active.id }));
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Choose level */}
      {!selectedLevel && (
        <div>
          <h2 className="text-3xl mb-6 text-center">Alege Nivelul</h2>
          <div className="grid grid-cols-3 gap-6">
            {levels.map(lvl => {
              const { xp, percent } = getProgress(lvl.level);
              
              return (
                <motion.div key={lvl.level} className={`${lvl.bg} rounded-lg shadow p-4 cursor-pointer`}
                            whileHover={{ scale: 1.02 }} onClick={() => setSelectedLevel(lvl.level)}>
                  {lvl.image && <img src={lvl.image} alt={lvl.level} className="h-32 object-cover rounded" />}
                  <div className="mt-3 text-center">{lvl.icon}</div>
                  <h3 className="mt-2 text-xl font-semibold">{lvl.level} – {lvl.title}</h3>
                  <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-right">{xp}/10.000 XP</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Choose lesson */}
      {selectedLevel && !selectedLesson && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl">Lecții – {selectedLevel}</h2>
            <button onClick={() => setSelectedLevel(null)} className="px-3 py-1 bg-gray-200 rounded">← Înainte</button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            
            {lessons.map(les => {
              const handleSelectLesson = async () => {
              try {
                  // fetch the user's lesson row
                  console.log(les.id)
                  const res = await fetch(`/api/getUserLesson?lessonId=${les.id}`);
                  if (!res.ok) throw new Error("Failed to fetch user lesson");
                  const data = await res.json();

                  // lesson from DB, default to position = 0 if not found
                  const position = data.lesson?.position ?? 0;

                  setSelectedLesson(les);
                  setDisplayedXp(data.lesson?.points || 0);

                  setCurrentStepIndex(position);
                  setSavedProgressIndex(position);
                  console.log(position)
                } catch (err) {
                  console.error("Error fetching lesson:", err);
                }
              };
              const { xp, percent } = getProgress(les.id);
              
              return (
                <div>
                <motion.div key={les.id} className="shadow rounded bg-white p-4 cursor-pointer"
                            whileHover={{ scale: 1.02 }} onClick={handleSelectLesson}>
                  <div className="flex items-center gap-2"><FaBook />{les.title}</div>
                  <div className="h-1 bg-gray-200 rounded mt-2 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-right">{xp}/10.000 XP</p>
                  {/* Reset button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm("Ești sigur că vrei să resetezi progresul?")) return;

                      const res = await fetch("/api/resetLessonProgress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lessonId: les.id }),
                      });

                      if (res.ok) {
                        // update UI local după reset
                        setLessons((prev) =>
                          prev.map((l) =>
                            l.id === les.id ? { ...l, position: 0, points: 0 } : l
                          )
                        );
                      }
                    }}
                    className="text-sm px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Reset
                  </button>
                </motion.div>
                </div>
              );
            })}
            
          </div>
        </div>
      )}

      {/* Lesson Steps */}
      {selectedLesson && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl">{selectedLesson.title}</h2>
            <button onClick={() => setSelectedLesson(null)} className="px-3 py-1 bg-gray-200 rounded">← Înainte</button>
          </div>
          {/* Puncte adunate */}
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-yellow-100 text-yellow-800 font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z"/>
              </svg>
              <span>{displayedXp}/{selectedLesson?.steps.length * 100} Puncte</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-gray-200 rounded overflow-hidden mb-6">
            <div
              className="h-full bg-teal-600 transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStepIndex + 1) / selectedLesson.steps.length) * 100}%` }}
              aria-label={`Progresul lecției: pasul ${currentStepIndex + 1} din ${selectedLesson.steps.length}`}
            />
          </div>
          {currentStep?.type === "theory" && (
          <div className="bg-white p-6 rounded shadow mb-6">
            {parse(currentStep.content.text, {
          replace: (domNode) => {
            if (domNode.type === "tag" && domNode.name === "button") {
              const speakText = domNode.attribs?.['data-speak'] || "";

              return (
                <button
                  onClick={() => speak({ text: speakText })}
                  className="mt-4 px-5 py-2 bg-teal-600 text-white rounded"
                  aria-label={`Ascultă pronunția ${speakText}`}
                >
                  {/* Keep the original children inside button, e.g. the 🎧 icon */}
                  {domNode.children.map((child: any) => child.data || "")}
                </button>
              );
            }
          },
        })}
    {currentStep.content.image && (
      <img
        src={currentStep.content.image}
        alt=""
        className="mt-4 rounded"
      />
    )}
    
  <div className="mt-4 flex gap-2">
    {currentStepIndex > 0 && (
      <button
        onClick={handlePrevious}
        className="px-3 py-1 bg-gray-400 text-white rounded pointer-events-auto"
      >
        Înapoi
      </button>
    )}
    {currentStepIndex >= 0 && currentStepIndex < savedProgressIndex && (
        <button
          onClick={handleNextCheck}
          className="px-3 py-1 bg-gray-400 text-white rounded"
        >
          Înainte
        </button>
      )}{savedProgressIndex}
    {currentStepIndex == savedProgressIndex && (
    <button
      onClick={handleNext}
      className="px-3 py-1 bg-teal-600 text-white rounded"
    >
      Continuă
    </button>
    )}
  </div>


  </div>
)}
{selectedLesson && currentStepIndex == selectedLesson.steps.length && (
  <motion.div
    className="bg-white p-8 rounded-lg shadow text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.h2
      className="text-3xl font-bold text-green-600 mb-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      🎉 Felicitări!
    </motion.h2>

    <motion.p
      className="text-gray-700 text-lg mb-6"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Ai finalizat lecția <strong>{selectedLesson.title}</strong> și ai câștigat:
    </motion.p>

    <motion.div
      className="text-yellow-500 text-5xl mb-4"
      initial={{ scale: 0 }}
      animate={{ scale: [1.2, 1, 1.2] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      ⭐ +100 XP
    </motion.div>

    <motion.button
      className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg shadow"
      whileHover={{ scale: 1.05 }}
      onClick={() => {
        setSelectedLesson(null);
        setCurrentStepIndex(0);
      }}
    >
      Înapoi la lecții
    </motion.button>
  </motion.div>
)}

          {currentStep?.type === "exercise" && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <p className="mb-4 font-medium">{(currentStep.content as any).question}</p>
              {currentStep.content.type}
              {/* Input */}
              {(currentStep.content as any).type === "input" && (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Scrie răspunsul..."
                  className="
                    w-full 
                    rounded-lg 
                    border 
                    border-gray-300 
                    bg-white 
                    px-4 
                    py-3 
                    text-gray-900 
                    placeholder-gray-400 
                    shadow-sm 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-blue-500 
                    focus:border-blue-500 
                    transition 
                    duration-200 
                    ease-in-out
                    mb-6
                  "
                  autoComplete="off"
                />
              )}
              {/* Multiple-choice */}
              {(currentStep.content as any).type === "multiple-choice" && (
                <div className="space-y-2">
                  {(currentStep.content as any).options.map((opt: string) => (
                    <button key={opt} onClick={() => setSelectedOption(opt)}
                            className={`block w-full text-left p-3 rounded border transition ${
                              selectedOption === opt ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"
                            }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {/* Matching */}
              {(currentStep.content as any).type === "matching" && (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(currentStep.content as any).pairs.map((p: any) => (
                      <div key={p.left}>
                        <p className="text-sm mb-2">{p.left}</p>
                        <Droppable id={p.left}>{matchingAnswers[p.left] || ""}</Droppable>
                      </div>
                    ))}
                    {shuffleArray((currentStep.content as any).pairs.map((p: any) => p.right)).map((ri: string) => (
                      <Draggable key={ri} id={ri}>{ri}</Draggable>
                    ))}
                  </div>
                </DndContext>
              )}
              {/* Check Answer Button */}
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-3 py-1 bg-gray-400 text-white rounded"
                  >
                    Înapoi
                  </button>
                )}{savedProgressIndex}
                {currentStepIndex >= 0 && currentStepIndex < savedProgressIndex && (
                  <button
                    onClick={handleNextCheck}
                    className="px-3 py-1 bg-gray-400 text-white rounded"
                  >
                    Înainte
                  </button>
                )}
                {currentStepIndex == savedProgressIndex && (                   
                <button onClick={handleCheckAnswer} className={`px-5 py-2 bg-blue-600 text-white rounded ${isCorrect ? "cursor-not-allowed bg-gray-600 hidden" : ""}`}>Verifică</button>
                )}
                {hasChecked && (
                <p className={`mt-4 font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {isCorrect ? "✔️ Răspuns corect!" : "❌ Mai încearcă!"}
                </p>
              )}

              {hasChecked && isCorrect && (
              <div className="mt-4 text-green-600">{savedProgressIndex}
                {currentStepIndex == savedProgressIndex && (
                  <button
                    onClick={handleNext}
                    className="px-3 py-1 bg-teal-600 text-white rounded"
                  >
                    Continuă
                  </button>
                )}
              </div>
            )}

            {hasChecked && !isCorrect && (
              <p className="text-red-600 mt-2">Mai încearcă!</p>
            )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility shuffle function
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

