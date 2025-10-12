export interface StepTheory {
    type: "theory";
    content: {
        text: string;
        image?: string;
    };
}

export interface StepInput {
    type: "exercise";
    content: {
        question: string;
        answer: string;
        type: "input";
    };
}

export interface StepMCQ {
    type: "exercise";
    content: {
        question: string;
        options: string[];
        correctOption: string;
        type: "multiple-choice";
    };
}

export interface StepMatching {
    type: "exercise";
    content: {
        question?: string;
        pairs: { left: string; right: string }[];
        type: "matching";
    };
}

export type LessonStep = StepTheory | StepInput | StepMCQ | StepMatching;

export interface Lesson {
    id: string;
    index: number;
    title: string;
    description: string;
    icon: string;
    steps: LessonStep[];
}

export interface LessonProgress {
    xp: number;
    percent: number;
    position: number;
    points: number;
}

export interface Level {
    level: string;
    title: string;
    icon: React.ReactNode;
    bg: string;
    image?: string;
}