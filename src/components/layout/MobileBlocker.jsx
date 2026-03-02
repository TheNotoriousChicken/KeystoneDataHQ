import { Lock } from 'lucide-react';

export default function MobileBlocker() {
    return (
        <div className="bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center w-full min-h-[50vh]">
            <div className="mb-6 p-4 rounded-full bg-[#1E293B] border border-[#334155] shadow-lg shadow-black/20">
                <Lock className="w-8 h-8 text-[#06B6D4]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
                Desktop Experience Required
            </h1>
            <p className="text-[#94A3B8] max-w-sm leading-relaxed">
                Keystone Data HQ is a pro-level analytics suite optimized for desktop displays. Please open this link on a desktop or laptop computer to access your data.
            </p>
        </div>
    );
}
