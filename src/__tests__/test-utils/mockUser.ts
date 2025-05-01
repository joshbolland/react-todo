import { vi } from "vitest";


export const mockUser = {
    uid: "123456",
    email: "test@example.com",
    phoneNumber: null,
    providerId: "firebase",
    displayName: "Test User",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    metadata: {
        creationTime: "",
        lastSignInTime: "",
        toJSON: () => ({}),
    },
    refreshToken: "",
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
};