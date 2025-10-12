'use client'

import React from 'react';
import {motion} from 'framer-motion';
import type {Lesson} from '@/types/lesson.types';

interface LessonCompletionProps {
    lesson: Lesson;
    onBackToLessons: () => void;
}

export function LessonCompletion({
                                     lesson,
                                     onBackToLessons,
                                 }: LessonCompletionProps) {
    return (
        <motion.div
            className="bg-white p-8 rounded-lg shadow text-center"
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5, ease: 'easeOut'}}
        >
            <motion.h2
                className="text-3xl font-bold text-green-600 mb-4"
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.3}}
            >
                🎉 Felicitări!
            </motion.h2>

            <motion.p
                className="text-gray-700 text-lg mb-6"
                initial={{y: 10, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.5}}
            >
                Ai finalizat lecția <strong>{lesson.title}</strong> și ai câștigat:
            </motion.p>

            <motion.div
                className="text-yellow-500 text-5xl mb-4"
                initial={{scale: 0}}
                animate={{scale: [1.2, 1, 1.2]}}
                transition={{duration: 1.5, repeat: Infinity}}
            >
                ⭐ +100 XP
            </motion.div>

            <motion.button
                className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
                whileHover={{scale: 1.05}}
                onClick={onBackToLessons}
            >
                Înapoi la lecții
            </motion.button>
        </motion.div>
    );
}
