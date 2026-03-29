import { Lock } from 'lucide-react';

export default function MobileBlocker() {
    return (
        <div className="bg-brand-bg flex flex-col items-center justify-center p-6 text-center w-full min-h-[50vh]">
            <div className="mb-6 p-4 rounded-full bg-brand-surface border border-brand-border shadow-lg shadow-black/20">
                <Lock className="w-8 h-8 text-brand-primary" />
            </div>
            <h2 className="text-xl font-bold text-brand-text mb-2">Desktop Only</h2>
            <p className="text-brand-muted max-w-sm leading-relaxed">
                Keystone Data HQ is built for desktop browsers. Please switch to a laptop or desktop to access your analytics dashboard.
            </p>
        </div>
    );
}
