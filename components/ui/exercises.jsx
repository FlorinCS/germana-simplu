"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

// --- Fake payload data ---
const mockExercises = [
  {
    _id: "1",
    image: "/reading.jpg",
    level: "A2",
    type: "multiple-choice-continue",
    payload: {
      passage:
        "Lisa lebt seit drei Jahren in Berlin. Sie arbeitet als Lehrerin an einer Grundschule und fährt jeden Morgen mit dem Fahrrad zur Arbeit...",
      items: [
        {
          id: "mc1",
          prompt: "Lisa arbeitet als...",
          options: [
            "Krankenschwester in einem Krankenhaus",
            "Lehrerin an einer Grundschule",
            "Verkäuferin in einem Supermarkt",
          ],
          correct: 1,
        },
        {
          id: "mc2",
          prompt: "Wie fährt Lisa normalerweise zur Arbeit?",
          options: ["Mit dem Auto", "Mit dem Bus", "Mit dem Fahrrad"],
          correct: 2,
        },
      ],
    },
  },
  {
    _id: "2",
    image: "/grammar.jpg",
    level: "B1",
    type: "grammar-mc",
    payload: {
      blanks: [
        {
          id: "b1",
          before: "Ich ",
          after: " ins Kino.",
          options: ["gehe", "geht", "gehst"],
          correct: "gehe",
        },
        {
          id: "b2",
          before: "Wir ",
          after: " Fußball.",
          options: ["spiele", "spielen", "spielt"],
          correct: "spielen",
        },
      ],
    },
  },
  {
    _id: "3",
    image: "/matching.jpg",
    level: "A1",
    type: "zuordnung-smalltexts",
    payload: {
      texts: [
        { id: "A", text: "Kleiner Text A — Angebot" },
        { id: "B", text: "Kleiner Text B — Info" },
        { id: "C", text: "Kleiner Text C — Einladung" },
      ],
      sentences: [
        { id: "s1", text: "Satz 1" },
        { id: "s2", text: "Satz 2" },
      ],
      solutions: { s1: "A", s2: "B" },
    },
  },
  {
    _id: "4",
    image: "/listening.jpg",
    level: "A2",
    type: "hörverstehen1",
    payload: {
      audio: "/audio/restaurant-conversation.mp3",
      transcript:
        "Kellner: Guten Tag! Haben Sie reserviert? Kunde: Ja, auf den Namen Müller...",
      items: [
        {
          id: "h1",
          prompt: "Wo befindet sich die Szene?",
          options: [
            "In einem Restaurant",
            "In einem Supermarkt",
            "In einer Schule",
          ],
          correct: 0,
        },
        {
          id: "h2",
          prompt: "Wie lautet der Name der Reservierung?",
          options: ["Schmidt", "Müller", "Lehmann"],
          correct: 1,
        },
      ],
    },
  },
];

export default function ExercisesPage() {
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [searched, setSearched] = useState(false);
  const [exerciseResults, setExerciseResults] = useState({});

  useEffect(() => {
    async function loadExerciseResults() {
      const res = await fetch("/api/getExerciseResults");
      const data = await res.json();

      setExerciseResults(data);
    }
    loadExerciseResults();
  }, []);

  const handleSearch = async () => {
    try {
      setSearched(false);
      setResults([]);

      const params = new URLSearchParams();
      if (level) params.append("level", level);
      if (type) params.append("type", type);

      const res = await fetch(`/api/getExercises?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch exercises");

      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const handleBackToSearch = () => {
    setSearched(false);
    setSelectedExercise(null);
    setResults([]);
    setUserAnswers({});
    setSubmitted(false);
  };

  const handleSelect = (ex) => {
    setSelectedExercise(ex);
    setSubmitted(false);
    setUserAnswers({});
  };

  const handleAnswer = (id, val) =>
    setUserAnswers((p) => ({ ...p, [id]: val }));
  const handleBack = () => setSelectedExercise(null);

  const handleSubmit = async () => {
    try {
      console.log("Submitting exercise:", selectedExercise._id);
      setSubmitted(true);

      const res = await fetch("/api/saveExerciseResults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exerciseId: selectedExercise._id }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save exercise result: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Exercise result saved:", data);
    } catch (error) {
      console.error("❌ Error submitting exercise:", error);
    }
  };

  const renderExercise = (ex) => {
    if (ex.type === "multiple-choice-continue") {
      return (
        <div>
          <p className="mb-4 text-gray-700 whitespace-pre-line">
            {ex.payload.passage}
          </p>
          {ex.payload.items.map((item) => (
            <div key={item.id} className="mb-4">
              <p className="font-medium">{item.prompt}</p>
              <div className="space-y-1 mt-1">
                {item.options.map((opt, i) => {
                  const isCorrect = i === item.correct;
                  const selected = userAnswers[item.id] === i;
                  const showResult = submitted && (isCorrect || selected);
                  return (
                    <label
                      key={i}
                      className={`block border rounded-md px-3 py-2 cursor-pointer transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      } ${
                        showResult
                          ? isCorrect
                            ? "border-green-500 bg-green-50"
                            : selected
                            ? "border-red-500 bg-red-50"
                            : ""
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={item.id}
                        value={i}
                        checked={selected}
                        onChange={() => handleAnswer(item.id, i)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (ex.type === "grammar-mc") {
      return (
        <div className="space-y-3">
          {ex.payload.blanks.map((b) => {
            const selected = userAnswers[b.id];
            const correct = submitted && selected === b.correct;
            const wrong = submitted && selected && selected !== b.correct;
            return (
              <div key={b.id} className="flex flex-wrap items-center gap-2">
                <span>{b.before}</span>
                <select
                  className={`border rounded-md p-1 ${
                    correct
                      ? "border-green-500 bg-green-50"
                      : wrong
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={selected || ""}
                  onChange={(e) => handleAnswer(b.id, e.target.value)}
                >
                  <option value="">—</option>
                  {b.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span>{b.after}</span>
              </div>
            );
          })}
        </div>
      );
    }

    if (ex.type === "zuordnung-smalltexts") {
      return (
        <div>
          <h3 className="font-semibold mb-3">Ordne die Sätze den Texten zu:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ex.payload.texts.map((t) => (
              <div key={t.id} className="p-3 bg-gray-100 rounded-md text-sm">
                {t.text}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {ex.payload.sentences.map((s) => {
              const selected = userAnswers[s.id];
              const correct =
                submitted && selected === ex.payload.solutions[s.id];
              const wrong =
                submitted &&
                selected &&
                selected !== ex.payload.solutions[s.id];
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-24">{s.text}</span>
                  <select
                    className={`border rounded-md p-1 ${
                      correct
                        ? "border-green-500 bg-green-50"
                        : wrong
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    value={selected || ""}
                    onChange={(e) => handleAnswer(s.id, e.target.value)}
                  >
                    <option value="">—</option>
                    {ex.payload.texts.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (ex.type === "hörverstehen1") {
      return (
        <div>
          <h3 className="font-semibold mb-3">Hörverstehen</h3>
          <audio controls className="w-full mb-4">
            <source src={ex.payload.audio} type="audio/mpeg" />
            Dein Browser unterstützt kein Audio-Element.
          </audio>
          <p className="text-gray-600 text-sm mb-6 whitespace-pre-line">
            {ex.payload.transcript}
          </p>
          {ex.payload.items.map((item) => (
            <div key={item.id} className="mb-4">
              <p className="font-medium">{item.prompt}</p>
              <div className="space-y-1 mt-1">
                {item.options.map((opt, i) => {
                  const isCorrect = i === item.correct;
                  const selected = userAnswers[item.id] === i;
                  const showResult = submitted && (isCorrect || selected);
                  return (
                    <label
                      key={i}
                      className={`block border rounded-md px-3 py-2 cursor-pointer transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      } ${
                        showResult
                          ? isCorrect
                            ? "border-green-500 bg-green-50"
                            : selected
                            ? "border-red-500 bg-red-50"
                            : ""
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={item.id}
                        value={i}
                        checked={selected}
                        onChange={() => handleAnswer(item.id, i)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <p>Exercise type not implemented yet.</p>;
  };

  return (
    <section className="flex flex-col min-h-screen bg-gray-50 p-6">
      {/* Search Section */}
      {!searched && (
        <motion.div
          className="bg-white rounded-2xl p-8 w-full max-w-md shadow-md mx-auto mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Search Exercises</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Level</label>
              <select
                className="w-full mt-1 border rounded-md p-2"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Exercise Type</label>
              <select
                className="w-full mt-1 border rounded-md p-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="multiple-choice-continue">Reading MC</option>
                <option value="zuordnung-smalltexts">Matching Texts</option>
                <option value="grammar-mc">Grammar</option>
                <option value="hörverstehen1">Listening</option>
              </select>
            </div>

            <Button className="w-full mt-4" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!selectedExercise && searched && (
        <>
          <Button
            variant="outline"
            onClick={handleBackToSearch}
            className="w-fit mb-6"
          >
            ← Back to Search
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((ex) => (
              <motion.div
                key={ex._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelect(ex)}
              >
                <Card className="cursor-pointer overflow-hidden">
                  <img
                    src={ex.image}
                    alt={ex.type}
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg capitalize">
                      {ex.type.replace(/-/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Level: {ex.level}
                    </p>
                    {exerciseResults[ex._id] ? (
                      <span className="inline-flex items-center mt-1 gap-2 text-green-600 bg-green-100 rounded-full px-3 py-1 text-sm font-medium">
                        <CheckCircle size={16} />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center mt-1 gap-2 text-gray-500 bg-gray-100 rounded-full px-3 py-1 text-sm font-medium">
                        <Clock size={16} />
                        Not done yet
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Exercise Detail View */}
      {selectedExercise && (
        <motion.div
          className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="outline" onClick={handleBack} className="mb-4">
            ← Back
          </Button>
          <h2 className="text-2xl font-semibold mb-6 capitalize">
            {selectedExercise.type.replace(/-/g, " ")} —{" "}
            {selectedExercise.level}
          </h2>

          {renderExercise(selectedExercise)}

          <Button className="mt-6" onClick={handleSubmit}>
            Submit Answers
          </Button>
        </motion.div>
      )}
    </section>
  );
}
