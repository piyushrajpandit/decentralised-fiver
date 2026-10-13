"use client";
import { useState } from "react";

export function UploadImage({ onImageAdded, image, onImageRemoved }: {
    onImageAdded: (image: string) => void;
    image?: string;
    onImageRemoved?: () => void;
}) {
    const [uploading, setUploading] = useState(false);

    async function onFileSelect(e: any) {
        setUploading(true);
        try {
            const file = e.target.files[0];
            if (!file) {
                setUploading(false);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                onImageAdded(base64);
                setUploading(false);
            };
            reader.onerror = () => setUploading(false);
            reader.readAsDataURL(file);
        } catch (e) {
            console.error(e);
            setUploading(false);
        }
    }

    if (image) {
        return (
            <div className="relative group w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900">
                <img
                    className="w-full h-full object-cover"
                    src={image}
                    alt="Task option"
                />
                {onImageRemoved && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={onImageRemoved}
                            className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium transition shadow-sm"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/80 transition relative cursor-pointer flex flex-col items-center justify-center text-center p-4">
            <input
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                disabled={uploading}
            />
            {uploading ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                    <span className="text-xs text-slate-400">Loading image...</span>
                </div>
            ) : (
                <>
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-lg mb-2">
                        +
                    </div>
                    <span className="text-xs font-medium text-slate-200">
                        Add variation
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                        PNG, JPG or WebP
                    </span>
                </>
            )}
        </div>
    );
}