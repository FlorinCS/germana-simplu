"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Trophy } from "lucide-react";

export default function ExamResultsSummary() {
  const [exams, setExams] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openExamId, setOpenExamId] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRes = await fetch(`${baseUrl}/api/getExamHistory`, {
          cache: "no-store",
        });
        if (!historyRes.ok) throw new Error("Failed to fetch exam history");
        const historyData = await historyRes.json();

        const examsArr = [];
        const answersArr = [];

        for (const item of historyData || []) {
  const examId = item.answers?.[0]?.examId || item.examId;
  if (!examId) continue;

  const examRes = await fetch(`${baseUrl}/api/getExam?id=${examId}`, {
    cache: "no-store",
  });
  if (!examRes.ok) continue;
  const examData = await examRes.json();

  // ✅ give each attempt a unique key
  const uniqueExam = {
    ...examData,
    attemptId: item.id,
    createdAt: item.createdAt,
  };
console.log(uniqueExam)
  examsArr.push(uniqueExam);

  for (const stageAnswer of item.answers) {
    answersArr.push({
      examId: uniqueExam.attemptId, // ✅ link answers to this attempt
      stageId: stageAnswer.stageId,
      answers: stageAnswer.answers,
    });
  }
}


        setExams(examsArr);
        setUserAnswers(answersArr);
      } catch (err) {
        console.error("Error loading exam results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  if (loading) return <p className="text-center mt-10">Loading exam results...</p>;
  if (!exams.length) return <p className="text-center mt-10">No exam results found.</p>;

  // ✅ core logic to compare answers vs. correct ones
  const calculateResults = (exam, answersArray) => {
  const stageResults = [];
  let totalCorrect = 0;
  let totalQuestions = 0;

  for (const stage of exam.stages) {
    const stageId = stage.id;
    const userStage = answersArray.find(a => a.stageId === stageId);

    // Try to find payload if exists
    const payload =
      exam.payloads?.[stageId] ||
      exam.payloads?.[stage.type] ||
      exam.payloads?.[stage.title?.toLowerCase?.()] ||
      null;

    const results = [];
    let correctCount = 0;
    let count = 0;

    if (payload) {
      // Items
      if (payload.items) {
        for (const item of payload.items) {
          const qid = item.id || item.key || item.qid;
          const userAns = userStage?.answers?.[qid];
          const correct = item.correct;
          const isCorrect = userAns === correct;
          count++; if (isCorrect) correctCount++;
          results.push({
            id: qid,
            text: item.prompt || item.text || qid,
            userAns: userAns ?? "—",
            solution: item.options?.[correct] ?? correct ?? "—",
            isCorrect,
          });
        }
      }
      // Solutions object
      else if (payload.solutions) {
        for (const [qid, correct] of Object.entries(payload.solutions)) {
          const userAns = userStage?.answers?.[qid];
          const isCorrect = userAns === correct;
          count++; if (isCorrect) correctCount++;
          results.push({
            id: qid,
            text: qid,
            userAns: userAns ?? "—",
            solution: correct ?? "—",
            isCorrect,
          });
        }
      }
      // Blanks
      else if (payload.blanks) {
        for (const blank of payload.blanks) {
          const qid = blank.id;
          const userAns = userStage?.answers?.[qid];
          const isCorrect = userAns === blank.correct;
          count++; if (isCorrect) correctCount++;
          results.push({
            id: qid,
            text: `${blank.before}_____${blank.after}`,
            userAns: userAns ?? "—",
            solution: blank.correct ?? "—",
            isCorrect,
          });
        }
      }
    }

    // If no payload, still show user answers or fallback
    if ((!payload || results.length === 0) && userStage) {
      for (const [qid, ans] of Object.entries(userStage.answers)) {
        results.push({
          id: qid,
          text: qid,
          userAns: ans,
          solution: "(Korrekte Antwort unbekannt)",
          isCorrect: false,
        });
        count++;
      }
    }

    // If still nothing
    if (results.length === 0) {
      results.push({
        id: "none",
        text: "Keine Antworten vorhanden",
        userAns: "—",
        solution: "—",
        isCorrect: false,
      });
      count = 0;
    }

    totalCorrect += correctCount;
    totalQuestions += count;

    stageResults.push({
      stageId,
      title: stage.title || stageId,
      correctCount,
      count,
      results,
    });
  }

  const score = totalQuestions ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : "0.0";
  return { score, totalCorrect, totalQuestions, stageResults };
};




  // ✅ render UI
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
          Prüfungsergebnisse
        </h2>
        <p className="text-gray-400 mt-2">Überblick über deine bisherigen Prüfungsleistungen</p>
      </div>

      <div className="space-y-6">
        {exams.map((exam) => {
  const answersArray = userAnswers.filter((a) => a.examId === exam.attemptId);
  const { score, totalCorrect, totalQuestions, stageResults } = calculateResults(exam, answersArray);
  const isOpen = openExamId === exam.attemptId;

console.log(exam)
          return (
            <motion.div
              key={exam.attemptId}
              layout
              className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
            >
              <button
                onClick={() => setOpenExamId(isOpen ? null : exam.attemptId)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-800/60 transition-all"
              >
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-xl font-semibold text-white">{exam.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {totalCorrect}/{totalQuestions} richtig —{" "}
                    <span
                      className={`font-medium ${
                        score >= 80
                          ? "text-green-400"
                          : score >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {score}%
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {score >= 80 && <Trophy className="text-yellow-400 w-5 h-5 animate-pulse" />}
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 space-y-6 bg-gray-900/70 backdrop-blur-md"
                  >
                    {stageResults.map((st) => (
                      <motion.div
                        key={st.stageId}
                        layout
                        className="border border-gray-800 rounded-xl overflow-hidden"
                      >
                        <div className="bg-gray-800/80 p-4 flex justify-between items-center">
                          <h4 className="font-semibold text-gray-100">{st.title}</h4>
                          <span className="text-sm text-gray-400">
                            {st.correctCount}/{st.count} richtig
                          </span>
                        </div>

                        <div className="divide-y divide-gray-800">
                          {st.results.map((r) => (
                            <motion.div
                              key={r.id}
                              className={`flex justify-between items-start p-3 ${
                                r.isCorrect
                                  ? "bg-green-900/10 border-l-4 border-green-500/40"
                                  : "bg-red-900/10 border-l-4 border-red-500/40"
                              }`}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-100">{r.text}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Deine Antwort:{" "}
                                  <span
                                    className={r.isCorrect ? "text-green-400" : "text-red-400"}
                                  >
                                    {r.userAns || "—"}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  Richtige Antwort: {r.solution}
                                </p>
                              </div>
                              {r.isCorrect ? (
                                <CheckCircle2 className="text-green-400 w-5 h-5 mt-1" />
                              ) : (
                                <XCircle className="text-red-400 w-5 h-5 mt-1" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
