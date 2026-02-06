'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from './Button';

interface PhotoUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PhotoUpload({ value, onChange, className = '' }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Create a local preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      onChange(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <Button variant="outline" size="sm">
            {preview ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </label>
        {preview && (
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            Remove
          </Button>
        )}
        {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
      </div>
    </div>
  );
}
