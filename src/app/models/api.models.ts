export interface SubProject {
    id: string;
    name: string;
    description: string;
    tech: string[];
    link?: string;
    images?: string[];
    challenges?: {
        problem: string;
        solution: string;
    }[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    tech: string[];
    github?: string;
    demo?: string;
    images: string[];
    challenges?: {
        problem: string;
        solution: string;
    }[];
    subProjects?: SubProject[];
    type: 'web' | 'videogame';
}

export interface FixedTexts {
    title: string;
    subtitle: string;
    description: string;
    hero?: {
        title: string;
        subtitle: string;
        description: string;
    };
    chat: {
        tooltipTitle: string;
        tooltipDesc: string;
        chatTitle: string;
        welcome: string;
        placeholder: string;
        send: string;
        subtitle: string;
    };
    about: {
        title: string;
        greeting: string;
        description1: string;
        description2: string;
        years: string;
        experience: string;
        projects: string;
        completed: string;
        training: string;
        continuous: string;
        skills: string;
    };
    contact: {
        title: string;
        subtitle: string;
        copyright: string;
    };
    projects: {
        title: string;
        subtitle: string;
        webTitle: string;
        videogameTitle: string;
        challengesTitle: string;
        solutionLabel: string;
        subProjectsLabel: string;
    };
    documents: {
        title: string;
        subtitle: string;
    };
}

export interface Document {
    _id: string;
    title: string;
    description: string;
    fileUrl: string;
    type: string;
    language: string;
}

export interface ContactItem {
    id: string;
    label: string;
    value: string;
    href: string;
}

export interface Skill {
    name: string;
    level: number;
    icon?: string;
}

export interface Competence {
    title: string;
    description: string;
    icon?: string;
}

export interface PersonalProfile {
    name: string;
    title: string;
    description: string;
    greeting?: string;
    imageUrl?: string;
    experienceYears?: number;
    completedProjects?: number;
    skills: Skill[];
    competences?: Competence[];
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
    cvUrl?: string;
}

export interface LanguageDto {
    _id: string;
    id: string;
    text: string;
}

export interface Theme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    backgroundColor?: string;
    textColor?: string;
    assistantColor?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    response: string;
    mood: string;
    keywords: string;
    backgroundUrl: string | null;
    thumbnailUrl?: string | null;
    theme?: Partial<Theme>;
}

export interface ChatHistory {
    messages: ChatMessage[];
    backgroundUrl?: string | null;
    thumbnailUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    assistantColor?: string;
}

export interface ExtractedPalette {
    primary: string;
    secondary: string;
    accent: string;
}

export interface MediaItem {
    url: string;
    type: 'image' | 'video';
    startTime?: number;
}
