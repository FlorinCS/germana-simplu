'use client'

import React from 'react';
import { motion } from 'framer-motion';
import type { Lesson, Level } from '@/types/lesson.types';

interface LevelSelectorProps {
    levels: Level[];
    onSelectLevel: (level: string) => void;
}

export function LevelSelector({ levels, onSelectLevel }: LevelSelectorProps) {
    return (
        <div>
            <h2 className="text-3xl mb-6 text-center">Alege Nivelul</h2>
            <div className="grid grid-cols-3 gap-6">
                {levels.map((lvl) => {
                    // Mock progress for now
                    const xp = Math.floor(Math.random() * 10000);
                    const percent = Math.floor((xp / 10000) * 100);

                    return (
                        <motion.div
                            key={lvl.level}
                            className={`${lvl.bg} rounded-lg shadow p-4 cursor-pointer`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onSelectLevel(lvl.level)}
                        >
                            {lvl.image && (
                                <img
                                    src={lvl.image}
                                    alt={lvl.level}
                                    className="h-32 object-cover rounded"
                                />
                            )}
                            <div className="mt-3 text-center">{lvl.icon}</div>
                            <h3 className="mt-2 text-xl font-semibold">
                                {lvl.level} – {lvl.title}
                            </h3>
                            <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-teal-500"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <p className="text-xs mt-1 text-right">{xp}/10.000 XP</p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

interface LessonListProps {
    level: string;
    lessons: Lesson[];
    onSelectLesson: (lesson: Lesson) => Promise<void>;
    onReset: (lessonId: string) => Promise<void>;
    onBack: () => void;
}

export function LessonList({
                               level,
                               lessons,
                               onSelectLesson,
                               onReset,
                               onBack,
                           }: LessonListProps) {
    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-2xl">Lecții – {level}</h2>
                <button
                    onClick={onBack}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                    ← Înainte
                </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
                {lessons.map((les) => {
                    const xp = Math.floor(Math.random() * 10000);
                    const percent = Math.floor((xp / 10000) * 100);

                    return (
                        <div key={les.id}>
                            <motion.div
                                className="shadow rounded bg-white p-4 cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onSelectLesson(les)}
                            >
                                <div className="flex items-center gap-2">
                                    📖 {les.title}
                                </div>
                                <div className="h-1 bg-gray-200 rounded mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <p className="text-xs mt-1 text-right">{xp}/10.000 XP</p>

                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!confirm('Ești sigur că vrei să resetezi progresul?'))
                                            return;
                                        await onReset(les.id);
                                    }}
                                    className="mt-2 text-sm px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                >
                                    Reset
                                </button>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}