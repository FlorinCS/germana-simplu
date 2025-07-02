"use client";

import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const userActivityData = [
  { day: "Jun 24", lessons: 3 },
  { day: "Jun 25", lessons: 4 },
  { day: "Jun 26", lessons: 2 },
  { day: "Jun 27", lessons: 5 },
  { day: "Jun 28", lessons: 4 },
  { day: "Jun 29", lessons: 6 },
  { day: "Jun 30", lessons: 3 },
];


const leaderboard = [
  { name: "Anna Müller", points: 1250, iconBg: "bg-yellow-200", icon: "🥇" },
  { name: "Lukas Schmidt", points: 1120, iconBg: "bg-gray-300", icon: "🥈" },
  { name: "Sophie Becker", points: 980, iconBg: "bg-orange-300", icon: "🥉" },
];

const yourLessons = [
  {
    title: "Der bestimmte Artikel (The Definite Article)",
    progress: 60,
    days: "3/7",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Präsens: Verben konjugieren",
    progress: 40,
    days: "2/7",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Vokabeln: Alltag & Familie",
    progress: 85,
    days: "6/7",
    img: "https://images.unsplash.com/photo-1518081461904-9c2db5a67a2e?auto=format&fit=crop&w=400&q=80",
  },
];

const topLearners = [
  {
    name: "Jonas Weber",
    lessonsCompleted: 45,
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Emily Fischer",
    lessonsCompleted: 41,
    img: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

export default function Dashboard() {
  const word = "entscheiden";
  const translation = "a decide";
  const audioUrl = "https://cdn.jsdelivr.net/gh/juliuste/german-audio-words@main/audio/entscheiden.mp3";

  const handlePlayAudio = () => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="bg-[#F5F6FA] min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <aside className="col-span-1 bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col items-center">
            <img
              src="https://i.pravatar.cc/100?img=5"
              alt="User Avatar"
              className="w-24 h-24 rounded-xl border-4 border-white shadow-md"
            />
            <h2 className="mt-4 font-semibold text-xl text-gray-900">Max Mustermann</h2>
            <p className="text-gray-500 text-sm">Berlin, Germany</p>
          </div>

          <div className="flex justify-around mt-8">
            <div className="bg-gray-100 rounded-xl w-24 py-4 text-center">
              <p className="text-gray-500 text-sm">Lessons</p>
              <p className="text-xl font-semibold">53</p>
            </div>
            <div className="bg-gray-100 rounded-xl w-24 py-4 text-center">
              <p className="text-gray-500 text-sm">Streak</p>
              <p className="text-xl font-semibold">12 🔥</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Leaderboards</h3>
              <a href="#" className="text-teal-600 text-sm font-medium hover:underline">
                View All
              </a>
            </div>
            <ul className="space-y-3">
              {leaderboard.map(({ name, points, iconBg, icon }, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-white rounded-xl p-3 shadow cursor-pointer hover:bg-teal-50"
                >
                  <div
                    className={`${iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-xl`}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{points} pts</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-2 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hallo, <span className="text-teal-600">Max</span> 👋
              </h1>
              <p className="text-gray-500">Bereit zum Deutschlernen?</p>
            </div>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Wortschatz, Grammatik..."
                className="w-full rounded-xl border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button className="absolute right-3 top-2.5 text-gray-500 hover:text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-teal-600 text-white rounded-2xl p-6 flex justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Master German Fast</h2>
              <p className="mt-2 max-w-md">
                Learn everyday vocabulary, grammar, and conversation skills with interactive lessons.
              </p>
              <button className="mt-4 bg-white text-teal-600 rounded-lg px-5 py-2 font-semibold hover:bg-gray-100">
                Start Learning
              </button>
            </div>
            <div className="flex-shrink-0 text-6xl">🇩🇪</div>
          </div>

          {/* Word of the Day */}
          <section className="bg-white rounded-2xl p-6 shadow flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Word of the Day</h3>
              <h2 className="text-2xl font-bold text-gray-900">{word}</h2>
              <p className="text-gray-600 text-sm mt-1 italic">"{translation}"</p>
            </div>
            <button
              onClick={handlePlayAudio}
              className="w-10 h-10 bg-teal-100 hover:bg-teal-200 rounded-full flex items-center justify-center text-teal-700 shadow"
              aria-label="Play pronunciation"
            >
              🔊
            </button>
          </section>

          {/* Your Lessons */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Your Lessons</h3>
              <a href="#" className="text-teal-600 font-medium hover:underline text-sm">
                View All
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {yourLessons.map(({ title, progress, days, img }, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <img src={img} alt={title} className="w-full h-28 object-cover" />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Progress: {progress}%</span>
                        <span>Days: {days}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* User Activity Chart */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Your Activity (Last 7 Days)</h3>
              <a href="#" className="text-teal-600 font-medium hover:underline text-sm">
                View Details
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userActivityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="lessons"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
