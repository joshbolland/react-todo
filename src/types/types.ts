export interface Category {
    id: string;
    description: string;
}

export interface Task {
    id: string;
    description: string;
    category: string;
    completed: boolean;
    targetDate: string | null;
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    [key: string]: string; // catch-all fallback
}