import { createContext, useContext, useState, useEffect } from 'react';

const FlagContext = createContext();

export function FlagProvider({ children }) {
    const [flags, setFlags] = useState({});
    const [loadingFlags, setLoadingFlags] = useState(true);

    useEffect(() => {
        const fetchFlags = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/flags');
                if (res.ok) {
                    const data = await res.json();
                    setFlags(data);
                }
            } catch (err) {
                console.error('Failed to load feature flags', err);
            } finally {
                setLoadingFlags(false);
            }
        };

        fetchFlags();
    }, []);

    // Helper function to check if a flag is enabled
    const isFeatureEnabled = (flagKey) => {
        return !!flags[flagKey];
    };

    return (
        <FlagContext.Provider value={{ flags, loadingFlags, isFeatureEnabled }}>
            {children}
        </FlagContext.Provider>
    );
}

export function useFlags() {
    return useContext(FlagContext);
}
