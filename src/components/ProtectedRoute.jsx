import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowIncomplete = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Force users to complete onboarding unless they are on the onboarding page
    if (!allowIncomplete && user.company && user.company.onboardingCompleted === false) {
        return <Navigate to="/onboarding" replace />;
    }

    // Prevent users who HAVE completed onboarding from going back to it
    if (allowIncomplete && user.company && user.company.onboardingCompleted === true) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
