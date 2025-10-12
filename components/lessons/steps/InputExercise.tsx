import React from 'react';
import type { StepInput } from '@/types/lesson.types';

interface InputExerciseProps {
    step: StepInput;
    userAnswer: string;
    onAnswerChange: (answer: string) => void;
}

export function InputExercise({
                                  step,
                                  userAnswer,
                                  onAnswerChange,
                              }: InputExerciseProps) {
    return (
        <div>
            <p className="mb-4 font-medium">{step.content.question}</p>
            <input
                type="text"
                value={userAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Scrie răspunsul..."
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-3
                  text-gray-900
                  placeholder-gray-400
                  shadow-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  transition
                  duration-200
                  ease-in-out
                  mb-6
                "
                autoComplete="off"
            />
        </div>
    );
}
