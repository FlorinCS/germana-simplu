import React from 'react';
import {InputExercise} from './InputExercise';
import {MultipleChoiceExercise} from '@/components/lessons';
import {MatchingExercise} from './MatchingExercise';
import type {StepInput, StepMCQ, StepMatching} from '@/types/lesson.types';

interface ExerciseStepProps {
    step: StepInput | StepMCQ | StepMatching;
    userAnswer: string;
    selectedOption: string | null;
    matchingAnswers: Record<string, string>;
    isCorrect: boolean;
    hasChecked: boolean;
    canGoBack: boolean;
    canGoForward: boolean;
    isAtSavedProgress: boolean;
    onAnswerChange: (answer: string) => void;
    onSelectOption: (option: string) => void;
    onMatchingChange: (answers: Record<string, string>) => void;
    onCheck: () => void;
    onNext: () => void;
    onPrevious: () => void;
}

export function ExerciseStep({
                                 step,
                                 userAnswer,
                                 selectedOption,
                                 matchingAnswers,
                                 isCorrect,
                                 hasChecked,
                                 canGoBack,
                                 canGoForward,
                                 isAtSavedProgress,
                                 onAnswerChange,
                                 onSelectOption,
                                 onMatchingChange,
                                 onCheck,
                                 onNext,
                                 onPrevious,
                             }: ExerciseStepProps) {
    const content = step.content as any;

    return (
        <div className="bg-white p-6 rounded shadow mb-6">
            {/* Exercise Content */}
            {content.type === 'input' && (
                <InputExercise
                    step={step as StepInput}
                    userAnswer={userAnswer}
                    onAnswerChange={onAnswerChange}
                />
            )}

            {content.type === 'multiple-choice' && (
                <MultipleChoiceExercise
                    step={step as StepMCQ}
                    selectedOption={selectedOption}
                    onSelectOption={onSelectOption}
                />
            )}

            {content.type === 'matching' && (
                <MatchingExercise
                    step={step as StepMatching}
                    matchingAnswers={matchingAnswers}
                    onMatchingChange={onMatchingChange}
                />
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
                {canGoBack && (
                    <button
                        onClick={onPrevious}
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                        Înapoi
                    </button>
                )}

                {canGoForward && !isAtSavedProgress && (
                    <button
                        onClick={onNext}
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                        Înainte
                    </button>
                )}

                {isAtSavedProgress && !hasChecked && (
                    <button
                        onClick={onCheck}
                        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Verifică
                    </button>
                )}
            </div>

            {/* Feedback */}
            {hasChecked && (
                <div className="mt-4">
                    <p
                        className={`font-semibold ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {isCorrect ? '✅ Răspuns corect!' : '❌ Mai încearcă!'}
                    </p>
                    {isCorrect && (
                        <button
                            onClick={onNext}
                            className="mt-2 px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                        >
                            Continuă
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
