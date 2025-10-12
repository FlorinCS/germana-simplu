import React from 'react';

interface LessonProgressProps {
    currentStep: number;
    totalSteps: number;
    displayedXp: number;
    maxXp: number;
}

export function LessonProgress({
                                   currentStep,
                                   totalSteps,
                                   displayedXp,
                                   maxXp,
                               }: LessonProgressProps) {
    const progressPercent = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div>
            {/* XP Display */}
            <div className="mb-4 flex items-center gap-2">
                <div
                    className="bg-yellow-100 text-yellow-800 font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z"/>
                    </svg>
                    <span>
            {displayedXp}/{maxXp} Puncte
          </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-gray-200 rounded overflow-hidden mb-6">
                <div
                    className="h-full bg-teal-600 transition-all duration-300 ease-in-out"
                    style={{width: `${progressPercent}%`}}
                    aria-label={`Progresul lecției: pasul ${currentStep + 1} din ${totalSteps}`}
                />
            </div>
        </div>
    );
}