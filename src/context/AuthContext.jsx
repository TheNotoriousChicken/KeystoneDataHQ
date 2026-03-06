import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_BASE = 'http://localhost:4000/api/auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('kd_token');
        const storedUser = localStorage.getItem('kd_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const saveSession = (tokenValue, userData) => {
        localStorage.setItem('kd_token', tokenValue);
        localStorage.setItem('kd_user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
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
            throw err; // Throw to UI to handle rendering the 2FA screen
        }

        saveSession(data.token, data.user);
        return data.user;
    };

    const verifyTwoFactor = async (tempToken, code) => {
        const res = await fetch(`${API_BASE}/login/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName, companyName, inviteToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        saveSession(data.token, data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('kd_token');
        localStorage.removeItem('kd_user');
        setToken(null);
        setUser(null);
    };

    const impersonate = async (companyId) => {
        const API_ADMIN = 'http://localhost:4000/api/admin';
        const res = await fetch(`${API_ADMIN}/impersonate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
