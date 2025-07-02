"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import {
  FaBaby,
  FaUserGraduate,
  FaBrain,
  FaBook,
  FaVolumeUp,
  FaComments,
} from "react-icons/fa";

// LEVELS
const levels = [
  {
    level: "A1",
    title: "Începător",
    description: "Învățați expresii de bază, saluturi și vocabular uzual.",
    icon: <FaBaby className="text-4xl text-teal-600" />,
    bg: "bg-teal-50",
    image:
      "https://images.unsplash.com/photo-1610381057235-b6187a44ef29?auto=format&fit=crop&w=800&q=80",
  },
  {
    level: "A2",
    title: "Elementar",
    description: "Înțelegeți texte scurte și comunicați în situații cotidiene.",
    icon: <FaUserGraduate className="text-4xl text-teal-600" />,
    bg: "bg-yellow-50",
    image:
      "https://images.unsplash.com/photo-1581092160613-6c7c88c7a9c6?auto=format&fit=crop&w=800&q=80",
  },
  {
    level: "B1",
    title: "Intermediar",
    description: "Exprimați-vă opiniile și discutați subiecte familiare.",
    icon: <FaBrain className="text-4xl text-teal-600" />,
    bg: "bg-blue-50",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa7023?auto=format&fit=crop&w=800&q=80",
  },
];

// MOCK PROGRESS
const getProgress = (id: string) => {
  const xp = Math.floor(Math.random() * 10000);
  const percent = Math.min(100, Math.floor((xp / 10000) * 100));
  return { xp, percent };
};

// MOCK LESSONS
const generateLessons = (level: string) => [
  {
    id: `${level}-1`,
    title: "Salutări și prezentări",
    description: "Cum te saluți și te prezinți în germană.",
    icon: <FaComments className="text-teal-600 text-2xl" />,
    steps: [
      {
        type: "theory",
        content: {
          text: "În germană, 'Hallo' înseamnă 'Salut'. Folosiți 'Ich heiße ...' pentru a spune cum vă cheamă.",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/German_Greetings.png/320px-German_Greetings.png",
        },
      },
      {
        type: "exercise",
        content: {
          question: "Cum spui „Mă numesc Ana” în germană?",
          answer: "Ich heiße Ana",
          type: "input",
        },
      },
      {
        type: "theory",
        content: {
          text: "a doua teorie",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/German_Greetings.png/320px-German_Greetings.png",
        },
      },
      {
        type: "exercise",
        content: {
          question: "Selectează traducerea corectă pentru 'Salut'",
          options: ["Hallo", "Tschüss", "Danke"],
          correctOption: "Hallo",
          type: "multiple-choice",
        },
      },
      {
        type: "exercise",
        content: {
          question: "Potrivește expresiile cu traducerea corectă:",
          type: "matching",
          pairs: [
            { left: "Bună dimineața", right: "Guten Morgen" },
            { left: "La revedere", right: "Auf Wiedersehen" },
          ],
        },
      },
    ],
  },
];

// Matching Drag Items
function Draggable({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
      {...listeners}
      {...attributes}
      className="bg-white shadow p-2 rounded border cursor-move"
    >
      {children}
    </div>
  );
}

function Droppable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });
  return (
    <div
      ref={setNodeRef}
      className="min-h-[40px] border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50"
    >
      {children}
    </div>
  );
}

export default function Lessons() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const lessons = selectedLevel ? generateLessons(selectedLevel) : [];
  const currentStep = selectedLesson?.steps?.[currentStepIndex] || null;

  const handleCheckAnswer = () => {
    if (!currentStep) return;
    const { type, content } = currentStep;

    if (type === "exercise") {
      if (content.type === "input") {
        setIsCorrect(
          userAnswer.trim().toLowerCase() === content.answer.toLowerCase()
        );
      } else if (content.type === "multiple-choice") {
        setIsCorrect(selectedOption === content.correctOption);
      } else if (content.type === "matching") {
        const correct = content.pairs.every(
          (pair: any) => matchingAnswers[pair.left] === pair.right
        );
        setIsCorrect(correct);
      }
    }
  };

  const handleNext = () => {
    if (selectedLesson && currentStepIndex < selectedLesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserAnswer("");
      setIsCorrect(false);
      setSelectedOption(null);
      setMatchingAnswers({});
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over) {
      setMatchingAnswers((prev) => ({
        ...prev,
        [over.id]: active.id,
      }));
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      {selectedLesson ? (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Lecția: {selectedLesson.title}</h2>
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-sm px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Înapoi la lecții
            </button>
          </div>

          {/* THEORY STEP */}
          {currentStep?.type === "theory" && (
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <p className="text-lg mb-4 font-medium text-gray-800">
                {currentStep.content.text}
              </p>
              {currentStep.content.image && (
                <img
                  src={currentStep.content.image}
                  alt="teorie"
                  className="rounded-lg shadow w-full max-w-md mx-auto"
                />
              )}
              <button
                onClick={handleNext}
                className="mt-6 px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Următorul
              </button>
            </div>
          )}

          {/* INPUT EXERCISE */}
          {currentStep?.type === "exercise" &&
            currentStep.content.type === "input" && (
              <div className="bg-white p-6 rounded-xl shadow mb-6">
                <p className="mb-4 font-medium text-gray-800">
                  {currentStep.content.question}
                </p>
                <input
                  type="text"
                  className="border p-3 rounded w-full text-gray-800"
                  placeholder="Scrie răspunsul..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
                <button
                  onClick={handleCheckAnswer}
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Verifică
                </button>
                {isCorrect && (
                  <div className="mt-4 text-green-600 font-semibold">
                    Corect! 👏
                    <button
                      onClick={handleNext}
                      className="ml-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Continuă
                    </button>
                  </div>
                )}
                {!isCorrect && userAnswer && (
                  <p className="mt-4 text-red-600">
                    Răspuns greșit, încearcă din nou!
                  </p>
                )}
              </div>
            )}

          {/* MULTIPLE CHOICE */}
          {currentStep?.type === "exercise" &&
            currentStep.content.type === "multiple-choice" && (
              <div className="bg-white p-6 rounded-xl shadow mb-6">
                <p className="mb-4 font-medium text-gray-800">
                  {currentStep.content.question}
                </p>
                <div className="space-y-2">
                  {currentStep.content.options.map((option: string) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={`block w-full text-left p-3 border rounded-lg transition ${
                        selectedOption === option
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCheckAnswer}
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Verifică
                </button>
                {isCorrect && (
                  <div className="mt-4 text-green-600 font-semibold">
                    Corect! 👏
                    <button
                      onClick={handleNext}
                      className="ml-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Continuă
                    </button>
                  </div>
                )}
                {!isCorrect && selectedOption && (
                  <p className="mt-4 text-red-600">Răspuns greșit!</p>
                )}
              </div>
            )}

          {/* MATCHING EXERCISE */}
          {currentStep?.type === "exercise" &&
            currentStep.content.type === "matching" && (
              <div className="bg-white p-6 rounded-xl shadow mb-6">
                <p className="mb-4 font-medium text-gray-800">
                  {currentStep.content.question}
                </p>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {currentStep.content.pairs.map((pair: any) => (
                        <div key={pair.left} className="mb-4">
                          <p className="mb-2 font-medium">{pair.left}</p>
                          <Droppable id={pair.left}>
                            {matchingAnswers[pair.left] || ""}
                          </Droppable>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {shuffleArray(currentStep.content.pairs.map((p: any) => p.right)).map(
                        (right: string) => (
                          <Draggable key={right} id={right}>
                            {right}
                          </Draggable>
                        )
                      )}
                    </div>
                  </div>
                </DndContext>
                <button
                  onClick={handleCheckAnswer}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Verifică
                </button>
                {isCorrect && (
                  <div className="mt-4 text-green-600 font-semibold">
                    Corect! 👏
                    <button
                      onClick={handleNext}
                      className="ml-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Continuă
                    </button>
                  </div>
                )}
                {!isCorrect && Object.keys(matchingAnswers).length > 0 && (
                  <p className="mt-4 text-red-600">Mai încearcă o dată!</p>
                )}
              </div>
            )}
        </div>
      ) : selectedLevel ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {lessons.map(({ id, title, description, icon }) => {
            const { xp, percent } = getProgress(id);
            return (
              <motion.div
                key={id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow p-5 cursor-pointer border"
                onClick={() => {
                  setSelectedLesson({
                    id,
                    title,
                    steps: lessons.find((l) => l.id === id)?.steps,
                  });
                  setCurrentStepIndex(0);
                  setUserAnswer("");
                  setIsCorrect(false);
                  setMatchingAnswers({});
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {icon}
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-gray-600">{description}</p>
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-gray-500 mt-1">
                    {xp} / 10.000 XP
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center mb-8">Alege Nivelul</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map(({ level, title, description, icon, bg, image }) => {
              const { xp, percent } = getProgress(level);
              return (
                <motion.div
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${bg}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  <img
                    src={image}
                    alt={level}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-center mb-4">{icon}</div>
                    <h3 className="text-xl font-semibold text-center">
                      {level} – {title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center">
                      {description}
                    </p>
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {xp} / 10.000 XP
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

// Helper to shuffle array (e.g. for right-side drag options)
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}
