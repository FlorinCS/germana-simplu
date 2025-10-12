import React from 'react';
import type {StepMCQ} from '@/types/lesson.types';

interface MultipleChoiceExerciseProps {
    step: StepMCQ;
    selectedOption: string | null;
    onSelectOption: (option: string) => void;
}

export function MultipleChoiceExercise({
                                           step,
                                           selectedOption,
                                           onSelectOption,
                                       }: MultipleChoiceExerciseProps) {
    return (
        <div>
            <p className="mb-4 font-medium">{step.content.question}</p>
            <div className="space-y-2">
                {step.content.options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onSelectOption(opt)}
                        className={`
                          block 
                          w-full 
                          text-left 
                          p-3 
                          rounded 
                          border 
                          transition 
                          ${selectedOption === opt ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'}
                      `}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}