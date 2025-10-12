'use client'

import React from 'react';
import {DndContext, closestCenter} from '@dnd-kit/core';
import type {StepMatching} from '@/types/lesson.types';

interface MatchingExerciseProps {
    step: StepMatching;
    matchingAnswers: Record<string, string>;
    onMatchingChange: (answers: Record<string, string>) => void;
}

// Simple drag-drop components (placeholder - you already have these)
function Draggable({id, children}: any) {
    // Your existing implementation
    return <div className="bg-white shadow p-2 rounded border cursor-move">{children}</div>;
}

function Droppable({id, children}: any) {
    // Your existing implementation
    return (
        <div className="min-h-[40px] border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50">
            {children}
        </div>
    );
}

function shuffleArray<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

export function MatchingExercise({
                                     step,
                                     matchingAnswers,
                                     onMatchingChange,
                                 }: MatchingExerciseProps) {
    function handleDragEnd(event: any) {
        const {active, over} = event;
        if (over) {
            onMatchingChange({...matchingAnswers, [over.id]: active.id});
        }
    }

    return (
        <div>
            {step.content.question && (
                <p className="mb-4 font-medium">{step.content.question}</p>
            )}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {step.content.pairs.map((p) => (
                        <div key={p.left}>
                            <p className="text-sm mb-2">{p.left}</p>
                            <Droppable id={p.left}>{matchingAnswers[p.left] || ''}</Droppable>
                        </div>
                    ))}
                    {shuffleArray(step.content.pairs.map((p) => p.right)).map((ri) => (
                        <Draggable key={ri} id={ri}>
                            {ri}
                        </Draggable>
                    ))}
                </div>
            </DndContext>
        </div>
    );
}