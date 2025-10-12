import {Lesson} from "@/types/lesson.types";

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

async function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
    const {params, ...fetchOptions} = options || {};

    let finalUrl = url;
    if (params) {
        const searchParams = new URLSearchParams(params);
        finalUrl = `${url}?${searchParams.toString()}`;
    }

    const response = await fetch(finalUrl, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    lessons: {
        getByLevel: (level: string) =>
            fetchJSON<Lesson[]>('/api/getLessons', {params: {idPrefix: level}}),

        getUserLesson: (lessonId: string) =>
            fetchJSON<{ lesson: { position: number; points: number } | null }>(
                '/api/getUserLesson',
                {params: {lessonId}}
            ),

        saveProgress: (lessonId: string) =>
            fetchJSON<{ lesson: { position: number; points: number } }>(
                '/api/saveLessonProgress',
                {
                    method: 'POST',
                    body: JSON.stringify({lessonId}),
                }
            ),

        resetProgress: (lessonId: string) =>
            fetchJSON<{ lesson: { position: number; points: number } }>(
                '/api/resetLessonProgress',
                {
                    method: 'POST',
                    body: JSON.stringify({lessonId}),
                }
            ),
    },
};
