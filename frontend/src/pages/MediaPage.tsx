import React, { useEffect, useState, useRef } from 'react';
import {
    Folder as FolderIcon,
    File as FileIcon,
    FileImage,
    FileText,
    FileVideo,
    Plus,
    Upload,
    ChevronRight,
    Home,
    Trash2,
    Type,
    Download,
    Search,
    LayoutGrid,
    List,
    MoveHorizontal
} from 'lucide-react';
import { useMedia } from '../contexts/MediaContext';
import { Button, Card, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Input } from '../components/ui';
import { format } from 'date-fns';
import type { Folder } from '../types/media';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export function MediaPage() {
    const {
        data,
        loading,
        uploadingFiles,
        currentFolderId,
        setCurrentFolderId,
        fetchDirectory,
        createFolder,
        uploadFile,
        renameItem,
        deleteItem,
        moveItem
    } = useMedia();

    const { user } = useAuth();
    const isAdminUser = user?.roles?.some(r => r.name === 'admin');

    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Drag and Drop state
    const [isDragging, setIsDragging] = useState(false);

    // For context menu or action modals
    const [selectedItem, setSelectedItem] = useState<{ type: 'folder' | 'file', id: number, name: string } | null>(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [newName, setNewName] = useState('');

    // Move feature
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [allFolders, setAllFolders] = useState<Folder[]>([]);
    const [moveLoading, setMoveLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDirectory();
    }, [fetchDirectory]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await createFolder(newFolderName);
            setNewFolderName('');
            setIsCreateFolderModalOpen(false);
        } catch (err) {
            alert('Gagal membuat folder');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let files: FileList | null = null;
        if ('files' in e.target && e.target.files) {
            files = e.target.files;
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            files = e.dataTransfer.files;
        }

        if (!files || files.length === 0) return;

        try {
            // Support multiple files
            for (let i = 0; i < files.length; i++) {
                await uploadFile(files[i]);
            }
        } catch (err) {
            alert('Gagal upload file');
        }
    };

    const handleRename = async () => {
        if (!selectedItem || !newName.trim()) return;
        try {
            await renameItem(selectedItem.type, selectedItem.id, newName);
            setIsRenameModalOpen(false);
            setSelectedItem(null);
        } catch (err) {
            alert('Gagal ganti nama');
        }
    };

    const handleDelete = async (type: 'folder' | 'file', id: number) => {
        if (!confirm('Hapus item ini?')) return;
        try {
            await deleteItem(type, id);
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    const handleOpenMoveModal = async (item: { type: 'folder' | 'file', id: number, name: string }) => {
        setSelectedItem(item);
        setIsMoveModalOpen(true);
        setMoveLoading(true);
        try {
            const response = await api.get<Folder[]>('/v1/media/all-folders');
            // Filter out self and children if moving a folder (simplified)
            setAllFolders(response.filter(f => item.type === 'file' || f.id !== item.id));
        } catch (err) {
            console.error('Failed to load folders', err);
        } finally {
            setMoveLoading(false);
        }
    };

    const handleMove = async (targetId: number | null) => {
        if (!selectedItem) return;
        try {
            await moveItem(selectedItem.type, selectedItem.id, targetId);
            setIsMoveModalOpen(false);
            setSelectedItem(null);
        } catch (err) {
            alert('Gagal memindahkan item');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mime: string) => {
        if (mime.startsWith('image/')) return <FileImage className="w-8 h-8 text-blue-500" />;
        if (mime.startsWith('video/')) return <FileVideo className="w-8 h-8 text-purple-500" />;
        if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) return <FileText className="w-8 h-8 text-orange-500" />;
        return <FileIcon className="w-8 h-8 text-slate-400" />;
    };

    return (
        <div
            className="relative space-y-6 animate-in fade-in duration-500 pb-32"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e); }}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-sm border-4 border-dashed border-primary rounded-3xl flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
                        <Upload className="w-12 h-12 text-primary" />
                    </div>
                </div>
            )}

            {/* Uploading Progress Toast */}
            {uploadingFiles.length > 0 && (
                <div className="fixed top-24 right-4 z-[60] w-72 glass dark:glass-dark rounded-[2rem] shadow-2xl p-5 animate-in slide-in-from-right-10 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Mengunggah...</h4>
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 bg-primary/10 text-primary rounded-full">{uploadingFiles.length} file</span>
                    </div>
                    <div className="space-y-4">
                        {uploadingFiles.map((file, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center gap-2">
                                    <p className="text-xs font-bold truncate text-foreground/80">{file.name}</p>
                                    <span className="text-[10px] font-medium text-muted-foreground">{file.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${file.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sticky Header & Navigation */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md -mx-4 px-4 py-4 space-y-4 border-b border-border/10 shadow-sm sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:shadow-none sm:p-0 sm:m-0 sm:space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Media Organizer</h2>
                        <p className="text-muted-foreground text-sm">Kelola dokumen dan file Anda.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            className="rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            multiple
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setIsCreateFolderModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Folder Baru
                        </Button>
                    </div>
                </div>

                {/* Breadcrumbs & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 w-full sm:w-auto bg-muted/30 p-1.5 rounded-2xl border border-border/20">
                        <button
                            onClick={() => setCurrentFolderId(null)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 whitespace-nowrap ${!currentFolderId ? 'bg-primary shadow-lg shadow-primary/30 text-white' : 'text-muted-foreground hover:bg-muted font-bold text-sm'}`}
                        >
                            <Home className={`w-4 h-4 ${!currentFolderId ? 'fill-white/20' : ''}`} />
                            <span className="text-sm font-black uppercase tracking-tight">Drive</span>
                        </button>
                        {data?.breadcrumbs.map((crumb) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0" strokeWidth={3} />
                                <button
                                    onClick={() => setCurrentFolderId(crumb.id)}
                                    className={`px-3 py-1.5 rounded-xl transition-all duration-300 whitespace-nowrap ${currentFolderId === crumb.id ? 'bg-primary shadow-lg shadow-primary/30 text-white font-black' : 'text-muted-foreground hover:bg-muted font-bold text-sm'}`}
                                >
                                    <span className="text-sm">{crumb.name}</span>
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari file/folder..."
                            className="pl-10 h-10 rounded-xl bg-card border-border/40 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-muted p-1 rounded-xl shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Explorer Content */}
            {loading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    : "flex flex-col gap-2"
                }>
                    {/* Folders */}
                    {data?.folders
                        .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((folder) => (
                            <Card
                                key={`folder-${folder.id}`}
                                className={`group relative border-border/40 hover:border-primary/30 transition-all duration-500 rounded-[2rem] cursor-pointer overflow-hidden ${viewMode === 'list' ? 'flex items-center !p-3 rounded-2xl' : 'hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]'}`}
                                onClick={() => setCurrentFolderId(folder.id)}
                            >
                                <div className={`${viewMode === 'list' ? 'absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors' : ''}`} />
                                <div className={`relative z-10 flex items-center gap-3 ${viewMode === 'grid' ? 'flex-col text-center p-5 pb-7' : 'flex-row w-full'}`}>
                                    <div className={`${viewMode === 'grid' ? 'w-20 h-20 rounded-3xl mb-1' : 'w-10 h-10 rounded-xl'} bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:rotate-6 transition-all duration-500`}>
                                        <FolderIcon className={`${viewMode === 'grid' ? 'w-11 h-11' : 'w-6 h-6'} text-primary fill-primary/20`} strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-foreground/90 truncate group-hover:text-primary transition-colors">{folder.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Folder</p>
                                            {isAdminUser && (
                                                <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full truncate max-w-[100px]" title={`Pemilik: ${folder.owner_name}`}>
                                                    {folder.owner_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`${viewMode === 'grid' ? 'absolute top-3 right-3' : 'relative ml-auto'} z-30 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-primary hover:text-white transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenMoveModal({ type: 'folder', id: folder.id, name: folder.name });
                                        }}
                                        title="Pindahkan"
                                    >
                                        <MoveHorizontal className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-muted transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem({ type: 'folder', id: folder.id, name: folder.name });
                                            setNewName(folder.name);
                                            setIsRenameModalOpen(true);
                                        }}
                                        title="Ganti Nama"
                                    >
                                        <Type className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-destructive/10 text-destructive transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete('folder', folder.id);
                                        }}
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Card>
                        ))}

                    {/* Files */}
                    {data?.files
                        .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((file) => (
                            <Card
                                key={`file-${file.id}`}
                                className={`group relative border-border/40 hover:border-primary/30 transition-all duration-500 rounded-[2rem] overflow-hidden ${viewMode === 'list' ? 'flex items-center !p-3 rounded-2xl' : 'hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]'}`}
                            >
                                <div className={`${viewMode === 'list' ? 'absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors' : ''}`} />
                                <div className={`relative z-10 flex items-center gap-3 ${viewMode === 'grid' ? 'flex-col text-center p-5 pb-7' : 'flex-row w-full'}`}>
                                    <div className={`${viewMode === 'grid' ? 'w-full aspect-[4/3] rounded-2xl mb-1' : 'w-10 h-10 rounded-xl'} bg-slate-50/50 flex items-center justify-center overflow-hidden border border-border/20 group-hover:border-primary/20 transition-all duration-500`}>
                                        {file.mime_type.startsWith('image/') ? (
                                            <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="group-hover:scale-110 transition-transform duration-500">
                                                {getFileIcon(file.mime_type)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-foreground/90 truncate group-hover:text-primary transition-colors">{file.name}</p>
                                        <div className="flex items-center flex-wrap gap-2 mt-1">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">
                                                {formatSize(file.size)} • {format(new Date(file.created_at), 'dd MMM')}
                                            </p>
                                            {isAdminUser && (
                                                <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full truncate max-w-[100px]" title={`Pemilik: ${file.owner_name}`}>
                                                    {file.owner_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`${viewMode === 'grid' ? 'absolute top-3 right-3' : 'relative ml-auto'} z-30 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-muted transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(file.url, '_blank');
                                        }}
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4 text-primary" />
                                    </button>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-muted transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenMoveModal({ type: 'file', id: file.id, name: file.name });
                                        }}
                                        title="Pindahkan"
                                    >
                                        <MoveHorizontal className="w-4 h-4 text-emerald-500" />
                                    </button>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-muted transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem({ type: 'file', id: file.id, name: file.name });
                                            setNewName(file.name);
                                            setIsRenameModalOpen(true);
                                        }}
                                        title="Ganti Nama"
                                    >
                                        <Type className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                    <button
                                        className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm hover:bg-destructive/10 text-destructive transition-colors border border-border/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete('file', file.id);
                                        }}
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Card>
                        ))}

                    {(!loading && data?.folders.length === 0 && data?.files.length === 0) && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 opacity-50">
                                <Plus className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Folder Masih Kosong</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Mulai susun dokumen Anda dengan membuat folder atau upload file baru.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={isCreateFolderModalOpen} onClose={() => setIsCreateFolderModalOpen(false)}>
                <ModalHeader>Buat Folder Baru</ModalHeader>
                <ModalBody>
                    <div className="space-y-4 py-2">
                        <Input
                            label="Nama Folder"
                            placeholder="Contoh: Dokumen SKP 2024"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            autoFocus
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsCreateFolderModalOpen(false)}>Batal</Button>
                    <Button variant="primary" onClick={handleCreateFolder}>Simpan</Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)}>
                <ModalHeader>Ganti Nama {selectedItem?.type === 'folder' ? 'Folder' : 'File'}</ModalHeader>
                <ModalBody>
                    <div className="space-y-4 py-2">
                        <Input
                            label="Nama Baru"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoFocus
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsRenameModalOpen(false)}>Batal</Button>
                    <Button variant="primary" onClick={handleRename}>Simpan</Button>
                </ModalFooter>
            </Modal>

            {/* Move Modal */}
            <Modal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)}>
                <ModalHeader>Pindahkan ke...</ModalHeader>
                <ModalBody>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground mb-4">Pilih folder tujuan untuk <strong>{selectedItem?.name}</strong></p>
                        <div className="max-h-[300px] overflow-y-auto border border-border/40 rounded-2xl divide-y divide-border/20">
                            <button
                                onClick={() => handleMove(null)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors text-left"
                            >
                                <Home className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium">Root Directory</span>
                            </button>
                            {moveLoading ? (
                                <div className="p-10 flex justify-center"><Spinner size="sm" /></div>
                            ) : allFolders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => handleMove(folder.id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors text-left"
                                >
                                    <FolderIcon className="w-5 h-5 text-primary fill-primary/10" />
                                    <span className="text-sm font-medium">{folder.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsMoveModalOpen(false)}>Batal</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
