'use client'

import { useState, useCallback } from 'react';
import { api } from '@/lib/api/client';
import type { Lesson } from '@/types/lesson.types';

export function useLessonProgress(lesson: Lesson | null) {
    const [displayedXp, setDisplayedXp] = useState(0);

    const loadProgress = useCallback(async (lessonId: string) => {
        try {
            const data = await api.lessons.getUserLesson(lessonId);
            const position = data.lesson?.position ?? 0;
            const points = data.lesson?.points ?? 0;

            setDisplayedXp(points);
            return { position, points };
        } catch (error) {
            console.error('Error loading lesson progress:', error);
            return { position: 0, points: 0 };
        }
    }, []);

    const saveProgress = useCallback(async (lessonId: string, currentIndex: number) => {
        try {
            const data = await api.lessons.saveProgress(lessonId);
            const newPosition = data.lesson?.position ?? currentIndex + 1;
            const newPoints = data.lesson?.points ?? 0;

            setDisplayedXp(newPoints);
            return { position: newPosition, points: newPoints };
        } catch (error) {
            console.error('Error saving lesson progress:', error);
            return { position: currentIndex + 1, points: displayedXp };
        }
    }, [displayedXp]);

    const resetProgress = useCallback(async (lessonId: string) => {
        try {
            await api.lessons.resetProgress(lessonId);
            setDisplayedXp(0);
            return true;
        } catch (error) {
            console.error('Error resetting lesson progress:', error);
            return false;
        }
    }, []);

    return {
        displayedXp,
        loadProgress,
        saveProgress,
        resetProgress,
    };
}