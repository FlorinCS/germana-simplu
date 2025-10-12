// ============================================================================
// FILE: components/lessons/Lessons.tsx
// Main orchestrator component for the lesson system
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { FaBaby, FaUserGraduate, FaBrain } from 'react-icons/fa';
import { api } from '@/lib/api/client';
import { useLessonState } from './hooks/useLessonState';
import { useLessonProgress } from './hooks/useLessonProgress';
import { LevelSelector, LessonList } from './LessonSelector';
import { LessonProgress } from './LessonProgress';
import { TheoryStep } from './steps/TheoryStep';
import { ExerciseStep } from './steps/ExerciseStep';
import { LessonCompletion } from './LessonCompletion';
import type { Lesson, Level } from '@/types/lesson.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const levels: Level[] = [
    {
        level: 'A1',
        title: 'Începător',
        icon: <FaBaby className="text-4xl text-teal-600" />,
        bg: 'bg-teal-50',
    },
    {
        level: 'A2',
        title: 'Elementar',
        icon: <FaUserGraduate className="text-4xl text-teal-600" />,
        bg: 'bg-yellow-50',
    },
    {
        level: 'B1',
        title: 'Intermediar',
        icon: <FaBrain className="text-4xl text-teal-600" />,
        bg: 'bg-blue-50',
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Play success sound when user answers correctly
 */
function playSuccessSound() {
    const audio = new Audio('/sounds/success.wav');
    audio.volume = 0.5;
    audio.play().catch((err) => {
        console.warn('Could not play sound:', err);
    });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Lessons() {
    // -------------------------------------------------------------------------
    // STATE - What data are we tracking?
    // -------------------------------------------------------------------------

    // Which level is selected? (A1, A2, B1, or null if none selected)
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    // List of lessons for the selected level
    const [lessons, setLessons] = useState<Lesson[]>([]);

    // Which lesson is currently open? (or null if viewing lesson list)
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    // -------------------------------------------------------------------------
    // CUSTOM HOOKS - Reusable logic extracted to hooks
    // -------------------------------------------------------------------------

    // Manages step navigation, user answers, validation
    const lessonState = useLessonState(selectedLesson);

    // Handles XP, progress loading/saving from database
    const lessonProgress = useLessonProgress(selectedLesson);

    // -------------------------------------------------------------------------
    // EFFECTS - Side effects that run when things change
    // -------------------------------------------------------------------------

    /**
     * Load lessons when user selects a level
     * This runs whenever selectedLevel changes
     */
    useEffect(() => {
        // If no level selected, do nothing
        if (!selectedLevel) return;

        // Fetch lessons for this level from API
        api.lessons
            .getByLevel(selectedLevel)
            .then((data) => {
                console.log(`Loaded ${data.length} lessons for ${selectedLevel}`);
                setLessons(data);
            })
            .catch((error) => {
                console.error('Error loading lessons:', error);
                // TODO: Show error message to user
            });
    }, [selectedLevel]); // Only re-run when selectedLevel changes

    // -------------------------------------------------------------------------
    // EVENT HANDLERS - Functions that respond to user actions
    // -------------------------------------------------------------------------

    /**
     * When user clicks on a lesson card
     * Load their progress and open the lesson
     */
    const handleSelectLesson = async (lesson: Lesson) => {
        try {
            // Load where they left off from database
            const { position, points } = await lessonProgress.loadProgress(lesson.id);

            console.log(`Opening lesson: ${lesson.title}`);
            console.log(`Progress: Step ${position}, ${points} XP`);

            // Update state to show this lesson
            setSelectedLesson(lesson);
            lessonState.setCurrentStepIndex(position);
            lessonState.setSavedProgressIndex(position);
        } catch (error) {
            console.error('Error selecting lesson:', error);
            // Fallback: open lesson at beginning
            setSelectedLesson(lesson);
            lessonState.setCurrentStepIndex(0);
            lessonState.setSavedProgressIndex(0);
        }
    };

    /**
     * When user clicks "Reset" button on a lesson
     * Clear their progress and refresh the list
     */
    const handleResetLesson = async (lessonId: string) => {
        try {
            const success = await lessonProgress.resetProgress(lessonId);

            if (success) {
                console.log(`Reset progress for lesson: ${lessonId}`);

                // Reload lessons to show updated progress
                if (selectedLevel) {
                    const data = await api.lessons.getByLevel(selectedLevel);
                    setLessons(data);
                }
            }
        } catch (error) {
            console.error('Error resetting lesson:', error);
        }
    };

    /**
     * When user clicks "Check Answer" button
     * Validate their answer and give feedback
     */
    const handleCheckAnswer = () => {
        // If no current step, do nothing
        if (!lessonState.currentStep) return;

        // Use the checkAnswer function from our hook
        const correct = lessonState.checkAnswer(lessonState.currentStep);

        // Update state with result
        lessonState.setIsCorrect(correct);
        lessonState.setHasChecked(true);

        // If correct, play sound and add XP (XP is added in saveProgress)
        if (correct) {
            playSuccessSound();
            console.log('✅ Correct answer!');
        } else {
            console.log('❌ Wrong answer, try again');
        }
    };

    /**
     * When user clicks "Next" or "Continue" button
     * Save progress to database and move to next step
     */
    const handleNextStep = async () => {
        if (!selectedLesson) return;

        try {
            // Save progress to database (this also increments XP)
            const { position, points } = await lessonProgress.saveProgress(
                selectedLesson.id,
                lessonState.currentStepIndex
            );

            console.log(`Progress saved: Step ${position}, ${points} XP`);

            // Update local state to reflect new position
            lessonState.setCurrentStepIndex(position);
            lessonState.setSavedProgressIndex(position);
            lessonState.resetStepState();
        } catch (error) {
            console.error('Error saving progress:', error);

            // Fallback: increment locally even if save failed
            lessonState.handleNext();
        }
    };

    // -------------------------------------------------------------------------
    // COMPUTED VALUES - Derived from state
    // -------------------------------------------------------------------------

    // Can user go back to previous step?
    const canGoBack = lessonState.currentStepIndex > 0;

    // Can user skip forward to already-completed steps?
    const canGoForward =
        lessonState.currentStepIndex < lessonState.savedProgressIndex;

    // Is user at the furthest step they've reached?
    const isAtSavedProgress =
        lessonState.currentStepIndex === lessonState.savedProgressIndex;

    // Has user completed all steps in the lesson?
    const isCompleted =
        selectedLesson &&
        lessonState.currentStepIndex >= selectedLesson.steps.length;

    // -------------------------------------------------------------------------
    // RENDER - What to show on screen
    // -------------------------------------------------------------------------

    return (
        <div className="max-w-4xl mx-auto py-10">

            {/* SCREEN 1: Level Selection (A1, A2, B1) */}
            {!selectedLevel && (
                <LevelSelector
                    levels={levels}
                    onSelectLevel={(level) => {
                        console.log(`Selected level: ${level}`);
                        setSelectedLevel(level);
                    }}
                />
            )}

            {/* SCREEN 2: Lesson List for selected level */}
            {selectedLevel && !selectedLesson && (
                <LessonList
                    level={selectedLevel}
                    lessons={lessons}
                    onSelectLesson={handleSelectLesson}
                    onReset={handleResetLesson}
                    onBack={() => {
                        console.log('Going back to level selection');
                        setSelectedLevel(null);
                        setLessons([]);
                    }}
                />
            )}

            {/* SCREEN 3: Lesson Steps (theory and exercises) */}
            {selectedLesson && !isCompleted && (
                <div>
                    {/* Header with lesson title and back button */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">{selectedLesson.title}</h2>
                        <button
                            onClick={() => {
                                console.log('Exiting lesson');
                                setSelectedLesson(null);
                                lessonState.setCurrentStepIndex(0);
                            }}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            ← Înainte
                        </button>
                    </div>

                    {/* Progress bar and XP counter */}
                    <LessonProgress
                        currentStep={lessonState.currentStepIndex}
                        totalSteps={selectedLesson.steps.length}
                        displayedXp={lessonProgress.displayedXp}
                        maxXp={selectedLesson.steps.length * 100}
                    />

                    {/* Theory Step (text content, images, audio) */}
                    {lessonState.currentStep?.type === 'theory' && (
                        <TheoryStep
                            step={lessonState.currentStep}
                            onNext={handleNextStep}
                            onPrevious={lessonState.handlePrevious}
                            canGoBack={canGoBack}
                            canGoForward={isAtSavedProgress}
                        />
                    )}

                    {/* Exercise Step (input, multiple choice, matching) */}
                    {lessonState.currentStep?.type === 'exercise' && (
                        <ExerciseStep
                            step={lessonState.currentStep}
                            userAnswer={lessonState.userAnswer}
                            selectedOption={lessonState.selectedOption}
                            matchingAnswers={lessonState.matchingAnswers}
                            isCorrect={lessonState.isCorrect}
                            hasChecked={lessonState.hasChecked}
                            canGoBack={canGoBack}
                            canGoForward={canGoForward}
                            isAtSavedProgress={isAtSavedProgress}
                            onAnswerChange={lessonState.setUserAnswer}
                            onSelectOption={lessonState.setSelectedOption}
                            onMatchingChange={lessonState.setMatchingAnswers}
                            onCheck={handleCheckAnswer}
                            onNext={handleNextStep}
                            onPrevious={lessonState.handlePrevious}
                        />
                    )}
                </div>
            )}

            {/* SCREEN 4: Lesson Completion (congratulations!) */}
            {isCompleted && (
                <LessonCompletion
                    lesson={selectedLesson}
                    onBackToLessons={() => {
                        console.log('Lesson completed! Going back to lesson list');
                        setSelectedLesson(null);
                        lessonState.setCurrentStepIndex(0);
                    }}
                />
            )}
        </div>
    );
}