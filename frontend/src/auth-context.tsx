import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import apiClient from "./api/client";

type AuthUser = {
    id: string;
    email: string;
};

type AuthContextValue = {
    user: AuthUser | null;
    accessToken: string | null;
    initializing: boolean;
    login: (input: { email: string; password: string }) => Promise<void>;
    register: (input: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("Auth context is unavailable.");
    }
    return context;
};

const fetchCurrentUser = async (token: string) => {
    const response = await apiClient.get("/api/users/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.user as AuthUser;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);
    const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

    // Stores the current session in memory as soon as tokens arrive
    const applySession = (token: string, nextUser: AuthUser) => {
        setAccessToken(token);
        setUser(nextUser);
    };

    // Clears session whenever refresh/login/logout fails
    const clearSession = () => {
        setAccessToken(null);
        setUser(null);
    };

    const refreshSession = async () => {
        if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = (async () => {
                try {
                    // Ask backend for a new access token; cookies already include the refresh token
                    const response = await apiClient.post("/api/auth/refresh");
                    const token = response.data.accessToken as string | undefined;
                    if (!token) {
                        clearSession();
                        return false;
                    }
                    // Refresh token succeeds, so fetch the latest user snapshot
                    const refreshedUser = await fetchCurrentUser(token);
                    applySession(token, refreshedUser);
                    return true;
                } catch (error) {
                    clearSession();
                    return false;
                } finally {
                    refreshPromiseRef.current = null;
                }
            })();
        }
        return refreshPromiseRef.current!;
    };

    useEffect(() => {
        let active = true;
        const initialize = async () => {
            // Try to restore session on boot; ignore failures and fall back to public state
            await refreshSession();
            if (active) {
                setInitializing(false);
            }
        };
        initialize();
        return () => {
            active = false;
        };
    }, []);

    const login = async (input: { email: string; password: string }) => {
        const response = await apiClient.post("/api/auth/login", input);
        const token = response.data.accessToken as string;
        const nextUser = response.data.user as AuthUser;
        applySession(token, nextUser);
    };

    const register = async (input: { email: string; password: string }) => {
        const response = await apiClient.post("/api/auth/register", input);
        const token = response.data.accessToken as string;
        const nextUser = response.data.user as AuthUser;
        applySession(token, nextUser);
    };

    const logout = async () => {
        try {
            await apiClient.post("/api/auth/logout");
        } finally {
            clearSession();
        }
    };

    const value = useMemo(
        () => ({
            user,
            accessToken,
            initializing,
            login,
            register,
            logout,
            refreshSession
        }),
        [user, accessToken, initializing]
    );

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export { AuthProvider, useAuth };
