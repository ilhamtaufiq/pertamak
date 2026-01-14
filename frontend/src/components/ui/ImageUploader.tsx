import { useEffect, useState, useCallback } from 'react';
import Uppy from '@uppy/core';
import {
    Dropzone,
    FilesGrid,
    UppyContextProvider,
} from '@uppy/react';
import '@uppy/core/css/style.min.css';
import '@uppy/react/css/style.css';

interface ImageUploaderProps {
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    existingImages?: Array<{ id: number; thumb: string; name: string }>;
    onDeleteExisting?: (id: number) => void;
    deletedIds?: number[];
}

function createUppy(maxFiles: number) {
    return new Uppy({
        restrictions: {
            maxNumberOfFiles: maxFiles,
            allowedFileTypes: ['image/*'],
        },
        autoProceed: false,
    });
}

export function ImageUploader({
    onFilesChange,
    maxFiles = 10,
    existingImages = [],
    onDeleteExisting,
    deletedIds = [],
}: ImageUploaderProps) {
    const [uppy] = useState(() => createUppy(maxFiles));

    // Sync files with parent component
    const syncFiles = useCallback(() => {
        const files = uppy.getFiles().map(f => f.data as File);
        onFilesChange(files);
    }, [uppy, onFilesChange]);

    useEffect(() => {
        uppy.on('file-added', syncFiles);
        uppy.on('file-removed', syncFiles);

        return () => {
            uppy.off('file-added', syncFiles);
            uppy.off('file-removed', syncFiles);
        };
    }, [uppy, syncFiles]);

    // Reset uppy when component unmounts
    useEffect(() => {
        return () => {
            uppy.cancelAll();
        };
    }, [uppy]);

    return (
        <UppyContextProvider uppy={uppy}>
            <div className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Foto Saat Ini</label>
                        <div className="flex gap-2 flex-wrap">
                            {existingImages.map((img) => {
                                const isDeleted = deletedIds.includes(img.id);
                                return (
                                    <div
                                        key={img.id}
                                        onClick={() => onDeleteExisting?.(img.id)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${isDeleted
                                            ? 'border-danger opacity-50'
                                            : 'border-default-200 hover:border-primary'
                                            }`}
                                    >
                                        <img
                                            src={img.thumb}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {isDeleted && (
                                            <div className="absolute inset-0 bg-danger/50 flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">Hapus</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tap foto untuk toggle hapus</p>
                    </div>
                )}

                {/* Uppy Dropzone + Files Grid (new v5 API) */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {existingImages.length > 0 ? 'Tambah Foto Baru' : 'Upload Foto'}
                    </label>
                    <Dropzone />
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                        Drop file atau klik untuk pilih (Maks. {maxFiles} foto)
                    </p>
                    <FilesGrid columns={3} />
                </div>
            </div>
        </UppyContextProvider>
    );
}
