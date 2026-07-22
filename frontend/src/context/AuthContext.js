import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient, { TOKEN_KEY } from '../utils/api';

const USER_KEY = 'poyo_user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);

    const persist = useCallback((token, nextUser) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    // Re-validate the stored token against the backend on load.
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return;
        }
        apiClient
            .get('/api/auth/me')
            .then(({ data }) => {
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            })
            .catch(() => logout())
            .finally(() => setLoading(false));
    }, [logout]);

    const login = useCallback(async (email, password) => {
        const { data } = await apiClient.post('/api/auth/login', { email, password });
        persist(data.token, data.user);
        return data.user;
    }, [persist]);

    const register = useCallback(async (payload) => {
        const { data } = await apiClient.post('/api/auth/register', payload);
        persist(data.token, data.user);
        return data.user;
    }, [persist]);

    const loginWithGoogle = useCallback(async (credential) => {
        const { data } = await apiClient.post('/api/auth/google', { credential });
        persist(data.token, data.user);
        return data.user;
    }, [persist]);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithGoogle,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
