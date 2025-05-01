import { useEffect, useState } from "react";
import { onAuthStateChanged, User, Auth } from "firebase/auth";
import { initializeFirebase } from "../config/FBConfig";
import { FirebaseConfig } from "../types/types";

export default function useFirebaseAuth(firebaseConfig: FirebaseConfig | null) {
    const [auth, setAuth] = useState<Auth | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (firebaseConfig) {
            const { auth } = initializeFirebase(firebaseConfig);
            setAuth(auth);
        }
    }, [firebaseConfig]);

    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
            });
            return () => unsubscribe();
        }
    }, [auth]);

    return { auth, user, setUser };
}