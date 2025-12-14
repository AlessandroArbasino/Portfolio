export interface SubProject {
    id: string;
    name: string;
    description: string;
    tech: string[];
    link?: string;
    images?: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    tech: string[];
    github?: string;
    demo?: string;
    images: string[];
    subProjects?: SubProject[];
}

export interface FixedTexts {
    hero: {
        title: string;
        subtitle: string;
        description: string;
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

export const sendMessage = async (sessionId: string, message: string): Promise<{ response: string; mood: string; keywords: string; backgroundUrl: string | null }> => {
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

export const fetchChatHistory = async (sessionId: string): Promise<{ role: 'user' | 'assistant'; content: string }[]> => {
    const response = await fetch(`/api/chat/${sessionId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch chat history');
    }
    return response.json();
};
