import { useEffect, useState } from "react";
import { FirebaseConfig } from "../types";

export default function useFirebaseConfig() {
    const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig | null>(null);

    useEffect(() => {
        const fetchFirebaseConfig = async () => {
            try {
                const res = await fetch("/.netlify/functions/firebaseConfig");
                const data = await res.json();
                setFirebaseConfig(data.firebaseConfig);
            } catch (error) {
                console.error("Error fetching Firebase config:", error);
            }
        };

        fetchFirebaseConfig();
    }, []);

    return firebaseConfig;
}