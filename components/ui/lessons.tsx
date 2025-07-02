"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    if (c.type === "input") setIsCorrect(userAnswer.trim().toLowerCase() === c.answer.toLowerCase());
    if (c.type === "multiple-choice") setIsCorrect(selectedOption === c.correctOption);
    if (c.type === "matching") setIsCorrect(c.pairs.every(p => matchingAnswers[p.left] === p.right));
  };

  const handleNext = () => {
    setCurrentStepIndex(i => i + 1);
    setUserAnswer("");
    setSelectedOption(null);
    setMatchingAnswers({});
    setIsCorrect(false);
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
              const { xp, percent } = getProgress(les.id);
              return (
                <motion.div key={les.id} className="shadow rounded bg-white p-4 cursor-pointer"
                            whileHover={{ scale: 1.02 }} onClick={() => { setSelectedLesson(les); setCurrentStepIndex(0); }}>
                  <div className="flex items-center gap-2"><FaBook />{les.title}</div>
                  <div className="h-1 bg-gray-200 rounded mt-2 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-right">{xp}/10.000 XP</p>
                </motion.div>
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
          {currentStep?.type === "theory" && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <p>{currentStep.content.text}</p>
              {currentStep.content.image && <img src={currentStep.content.image} alt="" className="mt-4 rounded" />}
              <button onClick={handleNext} className="mt-4 px-5 py-2 bg-teal-600 text-white rounded">Continuă</button>
            </div>
          )}
          {currentStep?.type === "exercise" && (
            <div className="bg-white p-6 rounded shadow mb-6">
              <p className="mb-4 font-medium">{(currentStep.content as any).question}</p>

              {/* Input */}
              {(currentStep.content as any).type === "input" && (
                <input value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                       className="w-full border p-2 rounded mb-4" placeholder="Scrie răspunsul..." />
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

              <button onClick={handleCheckAnswer} className="px-5 py-2 bg-blue-600 text-white rounded">Verifică</button>
              {isCorrect && <div className="mt-4 text-green-600">Corect! <button onClick={handleNext} className="px-3 py-1 bg-teal-600 text-white rounded ml-2">Continuă</button></div>}
              {!isCorrect && ((userAnswer || selectedOption || Object.keys(matchingAnswers).length) && <p className="text-red-600 mt-2">Mai încearcă!</p>)}
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
