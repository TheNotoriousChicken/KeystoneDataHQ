/**
 * authRefresh.js — Thin wrapper around fetch that automatically attaches
 * the current access token (from memory) and handles 401 by attempting
 * a silent refresh via the /api/auth/refresh endpoint.
 */

let accessToken = null;

export function initAccessToken(token) {
    accessToken = token;
}

export function getAccessToken() {
    return accessToken;
}

/**
 * authorizedFetch — drop-in replacement for fetch().
 * Automatically injects Authorization header and retries once on 401
 * by calling the refresh endpoint.
 */
export async function authorizedFetch(url, options = {}) {
    const headers = {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    let res = await fetch(url, { ...options, headers, credentials: 'include' });

    // If 401, try refresh once
    if (res.status === 401) {
        const refreshed = await silentRefresh();
        if (refreshed) {
            const retryHeaders = {
                ...(options.headers || {}),
                Authorization: `Bearer ${accessToken}`,
            };
            res = await fetch(url, { ...options, headers: retryHeaders, credentials: 'include' });
        }
    }

    return res;
}

/**
 * silentRefresh — Calls /api/auth/refresh (which reads the HttpOnly
 * refresh cookie) and updates the in-memory access token.
 */
async function silentRefresh() {
    try {
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!res.ok) return false;

        const data = await res.json();
        if (data.token) {
            accessToken = data.token;
            localStorage.setItem('token', data.token);
            return true;
        }
        return false;
    } catch (err) {
        console.error('Silent refresh failed:', err);
        return false;
    }
}
