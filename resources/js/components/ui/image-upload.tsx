'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value: string;
    hasError?: boolean;
    onChange: (value: string) => void;
    onFileChange?: (file: File | null) => void;
    disabled?: boolean;
    className?: string;
    previewImage?: string;
}

export const ImageUpload = ({
    value,
    onChange,
    onFileChange,
    disabled,
    hasError,
    className,
    previewImage
}: ImageUploadProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(previewImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Prevent hydration errors
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Set preview from value if it exists and is a valid URL
    useEffect(() => {
        if (value && (value.startsWith('http') || value.startsWith('https'))) {
            setPreview(value);
        }
    }, [value]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        },
        []
    );

    const handleFile = useCallback(
        (file: File) => {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                console.error('File is not an image:', file.type);
                return;
            }

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                console.error('File is too large:', file.size);
                return;
            }

            // Create a local preview
            const reader = new FileReader();
            reader.onload = e => {
                const result = e.target?.result as string;
                setPreview(result);
                // Update the form field value with the data URL for validation
                onChange(result);
                // Pass the file to the parent component for upload
                if (onFileChange) {
                    onFileChange(file);
                }
            };
            reader.onerror = () => {
                console.error("Error reading file:", file.name);
            };
            reader.readAsDataURL(file);
        },
        [onFileChange, onChange]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleRemove = useCallback(() => {
        setPreview(null);
        onChange('');
        if (onFileChange) {
            onFileChange(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange, onFileChange]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex w-full items-center justify-center">
                {preview ? (
                    <div className={cn("relative h-64 w-full overflow-hidden rounded-lg", className)}>
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={handleRemove}
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Use a regular img tag for data URLs and Image component for http URLs */}
                        {preview.startsWith('data:') ? (
                            <img
                                width={1000}
                                height={1000}
                                className="h-full w-full object-cover"
                                alt="Club image"
                                src={preview}
                            />
                        ) : (
                            <img
                                width={1000}
                                height={1000}
                                className="object-cover"
                                alt="Club image"
                                src={preview}
                            />
                        )}
                    </div>
                ) : (
                    <div
                        className={cn(
                            'flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                            isDragging
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-gray-600 bg-gray-200 hover:bg-gray-500/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-700/50',
                            hasError && 'border-red-500 bg-red-500/10',
                            className
                        )}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            disabled={disabled}
                        />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="mb-2 h-10 w-10 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400">
                                <span className="font-semibold">
                                    Drag and drop
                                </span>{' '}
                                or click to upload
                            </p>
                            <p className="text-xs text-gray-500">
                                SVG, PNG, JPG or GIF (MAX. 2MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
