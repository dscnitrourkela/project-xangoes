"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FileItem {
    id: string;
    file: File;
    previewUrl?: string;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    errorMessage?: string;
}

export interface FileUploaderProps {
    accept?: string;
    maxSizeInMb?: number;
    maxFiles?: number;
    multiple?: boolean;
    disabled?: boolean;
    value?: FileItem[];
    onChange?: (files: FileItem[]) => void;
    onUpload?: (files: File[]) => Promise<void>;
    helperText?: string;
    className?: string;
}

function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function FileUploader({
    accept = "image/*,application/pdf",
    maxSizeInMb = 5,
    maxFiles = 5,
    multiple = true,
    disabled = false,
    value,
    onChange,
    onUpload,
    helperText,
    className,
}: FileUploaderProps) {
    const [internalFiles, setInternalFiles] = React.useState<FileItem[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const [globalError, setGlobalError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const files = value !== undefined ? value : internalFiles;

    const updateFiles = React.useCallback(
        (updater: (prev: FileItem[]) => FileItem[]) => {
            const updated = updater(files);
            if (onChange) {
                onChange(updated);
            } else {
                setInternalFiles(updated);
            }
        },
        [files, onChange]
    );

    const validateFile = (file: File): string | null => {
        const maxBytes = maxSizeInMb * 1024 * 1024;
        if (file.size > maxBytes) {
            return `File exceeds maximum allowed size of ${maxSizeInMb}MB`;
        }

        if (accept && accept !== "*") {
            const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
            const fileName = file.name.toLowerCase();
            const fileType = file.type.toLowerCase();

            const isValid = acceptedTypes.some((pattern) => {
                if (pattern.startsWith(".")) {
                    return fileName.endsWith(pattern);
                }
                if (pattern.endsWith("/*")) {
                    const prefix = pattern.slice(0, -2);
                    return fileType.startsWith(prefix);
                }
                return fileType === pattern;
            });

            if (!isValid) {
                return `File type not supported. Accepted types: ${accept}`;
            }
        }

        return null;
    };

    const handleNewFiles = (rawFiles: FileList | File[]) => {
        setGlobalError(null);
        const incoming = Array.from(rawFiles);

        if (!multiple && incoming.length > 1) {
            setGlobalError("Only a single file can be uploaded.");
            return;
        }

        const remainingSlots = maxFiles - files.length;
        if (incoming.length > remainingSlots) {
            setGlobalError(`You can only upload up to ${maxFiles} file${maxFiles > 1 ? "s" : ""}.`);
            return;
        }

        const newItems: FileItem[] = incoming.map((file) => {
            const error = validateFile(file);
            const isImage = file.type.startsWith("image/");
            return {
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                file,
                previewUrl: isImage ? URL.createObjectURL(file) : undefined,
                progress: error ? 0 : 0,
                status: error ? "error" : "idle",
                errorMessage: error || undefined,
            };
        });

        updateFiles((prev) => (multiple ? [...prev, ...newItems] : newItems));

        if (onUpload) {
            const validFiles = newItems
                .filter((item) => item.status !== "error")
                .map((item) => item.file);
            if (validFiles.length > 0) {
                onUpload(validFiles).catch((err) => {
                    setGlobalError(err instanceof Error ? err.message : "Upload failed.");
                });
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleNewFiles(e.dataTransfer.files);
        }
    };

    const handleRemove = (id: string) => {
        const target = files.find((f) => f.id === id);
        if (target?.previewUrl) {
            URL.revokeObjectURL(target.previewUrl);
        }
        updateFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className={cn("space-y-4 w-full", className)}>
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !disabled) {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-disabled={disabled}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/30",
                    disabled && "cursor-not-allowed opacity-60 hover:border-border hover:bg-transparent"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            handleNewFiles(e.target.files);
                            e.target.value = "";
                        }
                    }}
                    className="sr-only"
                    tabIndex={-1}
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                    <UploadCloud className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        <span className="text-primary font-semibold hover:underline">
                            Click to upload
                        </span>{" "}
                        or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {helperText || `Max file size: ${maxSizeInMb}MB (up to ${maxFiles} file${maxFiles > 1 ? "s" : ""})`}
                    </p>
                </div>
            </div>

            {/* Global Error Notice */}
            {globalError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            {/* File List / Preview */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Files ({files.length}/{maxFiles})
                    </p>
                    <div className="space-y-2">
                        {files.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs transition-colors",
                                    item.status === "error" && "border-destructive/40 bg-destructive/5"
                                )}
                            >
                                {/* Thumbnail or File Icon */}
                                {item.previewUrl ? (
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                                        <Image
                                            src={item.previewUrl}
                                            alt={item.file.name}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                                        <FileIcon className="h-6 w-6" />
                                    </div>
                                )}

                                {/* File Details & Progress */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {item.file.name}
                                        </p>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatBytes(item.file.size)}
                                        </span>
                                    </div>

                                    {/* Status or Progress */}
                                    {item.status === "uploading" && (
                                        <div className="space-y-1">
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-primary transition-all duration-300"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground text-right">
                                                {item.progress}%
                                            </p>
                                        </div>
                                    )}

                                    {item.status === "success" && (
                                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                            <span>Upload complete</span>
                                        </div>
                                    )}

                                    {item.status === "error" && (
                                        <div className="flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                                {item.errorMessage || "Upload failed"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {item.status === "error" && onUpload && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => onUpload([item.file])}
                                            title="Retry upload"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemove(item.id)}
                                        title="Remove file"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export { FileUploader };
