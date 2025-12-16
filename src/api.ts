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
}

export interface FixedTexts {
    title: string;
    subtitle: string;
    description: string;
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
}

export const getProjects = async (lang: string = 'it'): Promise<Project[]> => {
    const response = await fetch(`/api/projects?lang=${lang}`);
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    return response.json();
};

export const getFixedTexts = async (lang: string = 'it'): Promise<FixedTexts> => {
    const response = await fetch(`/api/fixed-texts?lang=${lang}`);
    if (!response.ok) {
        throw new Error('Failed to fetch texts');
    }
    return response.json();
};

export const getBackgroundImages = async (keywords?: string, content_type?: string): Promise<string[]> => {
    const params = new URLSearchParams();
    if (keywords) params.append('keywords', keywords);
    if (content_type) params.append('content_type', content_type);

    const response = await fetch(`/api/background-images?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch background images');
    }
    return response.json();
};

export const sendMessage = async (sessionId: string, message: string): Promise<{ response: string; mood: string; keywords: string; backgroundUrl: string | null; theme?: any }> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, message }),
    });
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    return response.json();
};

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

export const fetchProfile = async (lang: string = 'it'): Promise<PersonalProfile> => {
    const API_BASE_URL = '';
    const response = await fetch(`${API_BASE_URL}/api/profile?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

export const fetchChatHistory = async (sessionId: string): Promise<{ role: 'user' | 'assistant'; content: string }[]> => {
    const response = await fetch(`/api/chat/${sessionId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch chat history');
    }
    return response.json();
};
