import { createContext, useContext, useState, useEffect } from 'react';
import { initAccessToken } from '../utils/authRefresh';

const AuthContext = createContext(null);
const API_BASE = `${import.meta.env.VITE_API_URL}/api/auth`;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const saveSession = (tokenValue, userData) => {
        localStorage.setItem('kd_token', tokenValue);
        localStorage.setItem('kd_user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
        initAccessToken(tokenValue);
    };

    // Hydrate from localStorage, then attempt silent refresh
    useEffect(() => {
        const restore = async () => {
            // 1. Fast hydrate from localStorage
            const storedToken = localStorage.getItem('kd_token');
            const storedUser = localStorage.getItem('kd_user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                initAccessToken(storedToken);
            }

            // 2. Attempt silent refresh via HttpOnly cookie
            try {
                const res = await fetch(`${API_BASE}/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.token && data.user) {
                        saveSession(data.token, data.user);
                    }
                }
            } catch (err) {
                // Silent refresh failed — fall back to localStorage session
            }

            setLoading(false);
        };
        restore();
    }, []);

    const login = async (email, password) => {
        let res;
        try {
            res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
        } catch (error) {
            throw new Error('Network error. Unable to connect to backend server.');
        }

        const data = await res.json();

        if (!res.ok) {
            const err = new Error(data.error || 'Login failed.');
            err.emailNotVerified = data.emailNotVerified || false;
            err.email = data.email || email;
            throw err;
        }

        // --- Handle 2FA Requirement ---
        if (data.requiresTwoFactor) {
            const err = new Error(data.message);
            err.requiresTwoFactor = true;
            err.method = data.method; // 'APP' or 'EMAIL'
            err.tempToken = data.tempToken;
            throw err;
        }

        saveSession(data.token, data.user);
        return data.user;
    };

    const verifyTwoFactor = async (tempToken, code) => {
        const res = await fetch(`${API_BASE}/login/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tempToken, code }),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Two-factor verification failed.');
        }

        saveSession(data.token, data.user);
        return data.user;
    };

    const register = async (email, password, firstName, lastName, companyName, inviteToken = null) => {
        let res;
        try {
            res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName, companyName, inviteToken }),
            });
        } catch (error) {
            throw new Error('Network error. Unable to connect to backend server.');
        }
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        saveSession(data.token, data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
        } catch (_) {}
        localStorage.removeItem('kd_token');
        localStorage.removeItem('kd_user');
        setToken(null);
        setUser(null);
        initAccessToken(null);
    };

    const impersonate = async (companyId) => {
        const API_ADMIN = `${import.meta.env.VITE_API_URL}/api/admin`;
        const res = await fetch(`${API_ADMIN}/impersonate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ companyId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Impersonation failed.');

        localStorage.setItem('kd_super_admin_token', token);
        localStorage.setItem('kd_super_admin_user', JSON.stringify(user));

        saveSession(data.token, data.user);
        return data.user;
    };

    const stopImpersonating = () => {
        const saToken = localStorage.getItem('kd_super_admin_token');
        const saUser = localStorage.getItem('kd_super_admin_user');

        if (saToken && saUser) {
            saveSession(saToken, JSON.parse(saUser));
            localStorage.removeItem('kd_super_admin_token');
            localStorage.removeItem('kd_super_admin_user');
        } else {
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, saveSessionDirect: saveSession, verifyTwoFactor, impersonate, stopImpersonating }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
