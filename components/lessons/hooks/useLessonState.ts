'use client'

import { useState } from 'react';
import type { Lesson, LessonStep } from '@/types/lesson.types';

export function useLessonState(lesson: Lesson | null) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [savedProgressIndex, setSavedProgressIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
    const [isCorrect, setIsCorrect] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const currentStep = lesson?.steps[currentStepIndex];

    const resetStepState = () => {
        setUserAnswer('');
        setSelectedOption(null);
        setMatchingAnswers({});
        setIsCorrect(false);
        setHasChecked(false);
    };

    const handleNext = () => {
        setCurrentStepIndex((prev) => prev + 1);
        resetStepState();
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
            resetStepState();
        }
    };

    const checkAnswer = (step: LessonStep): boolean => {
        if (step.type !== 'exercise') return false;

        const content = step.content as any;

        if (content.type === 'input') {
            return userAnswer.trim().toLowerCase() === content.answer.toLowerCase();
        }

        if (content.type === 'multiple-choice') {
            return selectedOption === content.correctOption;
        }

        if (content.type === 'matching') {
            return content.pairs.every((p: any) => matchingAnswers[p.left] === p.right);
        }

        return false;
    };

    return {
        currentStepIndex,
        savedProgressIndex,
        userAnswer,
        selectedOption,
        matchingAnswers,
        isCorrect,
        hasChecked,
        currentStep,
        setCurrentStepIndex,
        setSavedProgressIndex,
        setUserAnswer,
        setSelectedOption,
        setMatchingAnswers,
        setIsCorrect,
        setHasChecked,
        resetStepState,
        handleNext,
        handlePrevious,
        checkAnswer,
    };
}