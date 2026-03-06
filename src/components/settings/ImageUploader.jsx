import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ImageUploader({ endpoint, label, currentImageUrl, onUploadSuccess }) {
    const { token } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileSelection(file);
    };

    const handleFileSelection = (file) => {
        setError('');
        setSuccess('');

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPEG, PNG, etc).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.');
            return;
        }

        uploadFile(file);
    };

    const uploadFile = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        const fieldName = endpoint.includes('avatar') ? 'avatar' : 'logo';
        formData.append(fieldName, file);

        try {
            const res = await fetch(`http://localhost:4000/api/settings/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            const newUrl = data.avatarUrl || data.logoUrl;
            setPreviewUrl(newUrl);
            setSuccess(data.message);
            if (onUploadSuccess) onUploadSuccess(newUrl);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const displayUrl = previewUrl?.startsWith('/uploads') ? `http://localhost:4000${previewUrl}` : previewUrl;

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-brand-muted">{label}</label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="shrink-0">
                    {displayUrl ? (
                        <img src={displayUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-brand-border bg-brand-surface" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-brand-surface/50 border border-brand-border flex items-center justify-center text-brand-muted text-xs">
                            No image
                        </div>
                    )}
                </div>

                <div
                    className={`flex-1 w-full border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-surface/50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                    <p className="text-sm text-brand-muted">
                        <span className="text-brand-primary font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-brand-muted/70 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </div>

            {isUploading && <p className="text-sm text-brand-primary animate-pulse font-medium">Uploading...</p>}
            {error && <p className="text-sm text-red-400 flex items-center gap-1"><X className="w-4 h-4" /> {error}</p>}
            {success && <p className="text-sm text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {success}</p>}
        </div>
    );
}
