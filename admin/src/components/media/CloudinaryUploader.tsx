'use client';

import React, { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { mediaService, UploadMediaResponse } from '../../services/mediaService';

interface CloudinaryUploaderProps {
  onUploadSuccess: (imageData: UploadMediaResponse) => void;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const res = await mediaService.uploadImage(file);
      onUploadSuccess(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
        {isUploading ? (
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" /> Uploading to Cloudinary...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <UploadCloud className="w-8 h-8 text-sky-400" />
            <span className="text-xs font-semibold text-slate-200">Click to upload product image</span>
            <span className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 10MB</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
      </label>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};
