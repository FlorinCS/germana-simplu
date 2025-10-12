'use client'

import React from 'react';
import parse from 'html-react-parser';
import type { StepTheory } from '@/types/lesson.types';

interface TheoryStepProps {
    step: StepTheory;
    onNext: () => void;
    onPrevious: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
}

function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.5;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

export function TheoryStep({
                               step,
                               onNext,
                               onPrevious,
                               canGoBack,
                               canGoForward,
                           }: TheoryStepProps) {
    return (
        <div className="bg-white p-6 rounded shadow mb-6">
            {parse(step.content.text, {
                replace: (domNode: any) => {
                    if (domNode.type === 'tag' && domNode.name === 'button') {
                        const speakText = domNode.attribs?.['data-speak'] || '';

                        return (
                            <button
                                onClick={() => speak(speakText)}
                                className="mt-4 px-5 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                                aria-label={`Ascultă pronunția ${speakText}`}
                            >
                                {domNode.children.map((child: any) => child.data || '')}
                            </button>
                        );
                    }
                },
            })}

            {step.content.image && (
                <img src={step.content.image} alt="" className="mt-4 rounded" />
            )}

            <div className="mt-4 flex gap-2">
                {canGoBack && (
                    <button
                        onClick={onPrevious}
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                        Înapoi
                    </button>
                )}
                {canGoForward && (
                    <button
                        onClick={onNext}
                        className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                    >
                        Continuă
                    </button>
                )}
            </div>
        </div>
    );
}