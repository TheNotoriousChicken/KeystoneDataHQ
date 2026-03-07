import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You could log this error to an external service like Sentry here
        console.error("Global Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
                    <div className="glass-panel p-8 max-w-md w-full text-center border-red-500/20 bg-red-500/5">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertOctagon className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-brand-muted mb-8 text-sm leading-relaxed">
                            We're sorry, but the application encountered an unexpected error. Our team has been notified.
                        </p>

                        <div className="bg-brand-surface/50 p-4 rounded text-left mb-8 overflow-x-auto border border-brand-border">
                            <code className="text-xs text-rose-400 font-mono">
                                {this.state.error?.message || "Unknown Application Error"}
                            </code>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-[8px] font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Page
                            </button>
                            <Link
                                to="/"
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full py-2.5 bg-transparent border border-brand-border hover:bg-brand-surface text-white rounded-[8px] font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
