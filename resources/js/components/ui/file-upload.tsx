'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileTextIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    value?: string;
    hasError?: boolean;
    onChange: (value: string) => void;
    onFileChange?: (file: File | null) => void;
    disabled?: boolean;
    className?: string;
    acceptedFileTypes?: string;
    maxSizeMB?: number;
}

export const FileUpload = ({
    value,
    onChange,
    onFileChange,
    disabled,
    hasError,
    className,
    acceptedFileTypes = '.pdf,.doc,.docx',
    maxSizeMB = 5
}: FileUploadProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Prevent hydration errors
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Set file name from value if it exists
    useEffect(() => {
        if (value) {
            setFileName(value);
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
            // Check file type
            const acceptedTypes = acceptedFileTypes.split(',');
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            const isAcceptedType = acceptedTypes.some(type =>
                type === fileExtension ||
                (type.includes('/*') && file.type.startsWith(type.replace('/*', '/')))
            );

            if (!isAcceptedType) {
                console.error('File type not accepted:', file.type);
                return;
            }

            // Check file size (max 5MB by default)
            if (file.size > maxSizeMB * 1024 * 1024) {
                console.error('File is too large:', file.size);
                return;
            }

            setFileName(file.name);

            // Update the form field value
            onChange(file.name);

            // Pass the file to the parent component for upload
            if (onFileChange) {
                onFileChange(file);
            }
        },
        [onFileChange, onChange, acceptedFileTypes, maxSizeMB]
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
        setFileName(null);
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
                {fileName ? (
                    <div className={cn("relative flex h-16 w-full items-center rounded-lg border border-gray-600 bg-gray-800 px-4 py-2", className)}>
                        <div className="mr-3">
                            <FileTextIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1 truncate">
                            <p className="truncate text-sm font-medium">{fileName}</p>
                            <p className="text-xs text-gray-400">Click to remove and upload a different file</p>
                        </div>
                        <div>
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
                    </div>
                ) : (
                    <div
                        className={cn(
                            'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                            isDragging
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50',
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
                            accept={acceptedFileTypes}
                            onChange={handleFileInputChange}
                            disabled={disabled}
                        />
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileTextIcon className="mb-2 h-10 w-10 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400">
                                <span className="font-semibold">
                                    Drag and drop
                                </span>{' '}
                                or click to upload
                            </p>
                            <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX (MAX. {maxSizeMB}MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
