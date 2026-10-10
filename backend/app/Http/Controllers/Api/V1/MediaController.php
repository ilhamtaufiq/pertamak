<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Folder;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Schema;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['parent_id' => 'nullable|integer|exists:folders,id']);

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');
        $parentId = $request->get('parent_id');

        // Check folder access if parent_id is provided
        if ($parentId && !$isAdmin) {
            $targetFolder = Folder::where('user_id', $user->id)->find($parentId);
            if (!$targetFolder) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Query Folders
        $queryFolders = Folder::where('parent_id', $parentId);
        if (!$isAdmin) {
            $queryFolders->where('user_id', $user->id);
        }
        $folders = $queryFolders->with('user:id,name')->get()->map(function($f) use ($isAdmin) {
            $data = $f->toArray();
            if ($isAdmin) {
                $data['owner_name'] = $f->user->name ?? 'N/A';
            }
            return $data;
        });

        // Query Files
        $allowedModels = [Folder::class, \App\Models\User::class];

        if ($parentId) {
            // Files in a specific folder
            $queryFiles = Media::where('folder_id', $parentId)
                ->whereIn('model_type', $allowedModels);
        } else {
            // Files in root
            $queryFiles = Media::where('folder_id', null)
                ->whereIn('model_type', $allowedModels);

            if (!$isAdmin) {
                // Regular users only see their own files attached to their User model
                $queryFiles->where('model_type', \App\Models\User::class)
                          ->where('model_id', $user->id);
            }
        }

        $files = $queryFiles->with('model')->get()->map(function($media) use ($isAdmin) {
            $ownerName = 'N/A';
            if ($isAdmin) {
                if ($media->model instanceof Folder) {
                    $ownerName = $media->model->user->name ?? 'N/A';
                } elseif ($media->model instanceof \App\Models\User) {
                    $ownerName = $media->model->name ?? 'N/A';
                }
            }
            
            $isImage = str_starts_with($media->mime_type, 'image/');
            
            return [
                'id' => $media->id,
                'name' => $media->file_name,
                'size' => $media->size,
                'human_size' => $media->human_readable_size,
                'mime_type' => $media->mime_type,
                'url' => $isImage ? $media->getUrl('optimized') : $media->getUrl(),
                'original_url' => $media->getUrl(),
                'thumb' => $isImage ? $media->getUrl('thumb') : null,
                'created_at' => $media->created_at,
                'owner_name' => $ownerName
            ];
        });

        return response()->json([
            'folders' => $folders,
            'files' => $files,
            'breadcrumbs' => $this->getBreadcrumbs($parentId, $user)
        ]);
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:folders,id'
        ]);

        // Security check for parent folder
        if ($request->parent_id && !Auth::user()->hasRole('admin')) {
            $parent = Folder::where('user_id', Auth::id())->find($request->parent_id);
            if (!$parent) return response()->json(['message' => 'Unauthorized'], 403);
        }

        $folder = Folder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'user_id' => Auth::id()
        ]);

        return response()->json($folder);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,pdf|max:51200',
            'folder_id' => 'nullable|integer|exists:folders,id'
        ]);

        $user = Auth::user();
        $folderId = $request->folder_id;

        if ($folderId) {
            $target = Folder::find($folderId);
            if (!$user->hasRole('admin') && $target->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            $target = $user;
        }

        $media = $target->addMediaFromRequest('file')
            ->toMediaCollection('library');

        $media->folder_id = $folderId;
        $media->save();

        $isImage = str_starts_with($media->mime_type, 'image/');

        return response()->json([
            'id' => $media->id,
            'name' => $media->file_name,
            'size' => $media->size,
            'human_size' => $media->human_readable_size,
            'mime_type' => $media->mime_type,
            'url' => $isImage ? $media->getUrl('optimized') : $media->getUrl(),
            'original_url' => $media->getUrl(),
            'thumb' => $isImage ? $media->getUrl('thumb') : null,
            'created_at' => $media->created_at,
        ]);
    }

    public function rename(Request $request, $type, $id)
    {
        $this->ensureValidType($type);

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255', 'not_regex:/[\/\\\\\x00]|\.\./'],
            'parent_id' => 'sometimes|nullable|integer|exists:folders,id',
            'folder_id' => 'sometimes|nullable|integer|exists:folders,id'
        ]);

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');

        if ($type === 'folder') {
            $query = Folder::query();
            if (!$isAdmin) $query->where('user_id', $user->id);
            
            $folder = $query->findOrFail($id);
            $updateData = [];
            if ($request->has('name')) $updateData['name'] = $this->sanitizeName($request->name);
            if ($request->has('parent_id')) {
                // Check move target permission
                if ($request->parent_id && !$isAdmin) {
                    $target = Folder::where('user_id', $user->id)->find($request->parent_id);
                    if (!$target) return response()->json(['message' => 'Unauthorized'], 403);
                }
                // A folder cannot become its own descendant
                if ($request->parent_id && $this->isSameOrDescendant($request->parent_id, $folder->id)) {
                    return response()->json(['message' => 'Folder tidak bisa dipindah ke dalam dirinya sendiri.'], 422);
                }
                $updateData['parent_id'] = $request->parent_id;
            }
            
            $folder->update($updateData);
            return response()->json($folder);
        } else {
            $media = Media::findOrFail($id);
            
            // Ownership check for files
            if (!$isAdmin) {
                $isOwner = ($media->model_type === \App\Models\User::class && $media->model_id === $user->id) ||
                          ($media->model_type === Folder::class && $media->model->user_id === $user->id);
                if (!$isOwner) return response()->json(['message' => 'Unauthorized'], 403);
            }

            $updateData = [];
            if ($request->has('name')) $updateData['file_name'] = $this->sanitizeName($request->name);
            if ($request->has('folder_id')) {
                // Check move target folder permission
                if ($request->folder_id && !$isAdmin) {
                    $target = Folder::where('user_id', $user->id)->find($request->folder_id);
                    if (!$target) return response()->json(['message' => 'Unauthorized'], 403);
                }
                $updateData['folder_id'] = $request->folder_id;
            }
            
            $media->update($updateData);
            return response()->json($media);
        }
    }

    public function allFolders()
    {
        $user = Auth::user();
        $query = Folder::query();
        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }
        $folders = $query->get();
        return response()->json($folders);
    }

    public function destroy($type, $id)
    {
        $this->ensureValidType($type);

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');

        if ($type === 'folder') {
            $query = Folder::query();
            if (!$isAdmin) $query->where('user_id', $user->id);
            $folder = $query->findOrFail($id);

            if (!$isAdmin && $this->subtreeHasForeignContent($folder, $user->id)) {
                return response()->json([
                    'message' => 'Folder ini berisi berkas milik orang lain dan tidak bisa dihapus.',
                ], 409);
            }

            $folder->delete();
        } else {
            $media = Media::findOrFail($id);
            if (!$isAdmin) {
                $isOwner = ($media->model_type === \App\Models\User::class && $media->model_id === $user->id) ||
                          ($media->model_type === Folder::class && $media->model->user_id === $user->id);
                if (!$isOwner) return response()->json(['message' => 'Unauthorized'], 403);
            }
            $media->delete();
        }

        return response()->json(['message' => 'Deleted successfully']);
    }

    private function getBreadcrumbs($id, $user)
    {
        $breadcrumbs = [];
        $current = $id ? Folder::find($id) : null;
        $seen = [];

        while ($current && !in_array($current->id, $seen, true) && count($seen) < self::MAX_DEPTH) {
            $seen[] = $current->id;

            // Do not reveal names of ancestors the user does not own
            if (!$user->hasRole('admin') && $current->user_id !== $user->id) {
                break;
            }

            array_unshift($breadcrumbs, [
                'id' => $current->id,
                'name' => $current->name
            ]);
            $current = $current->parent;
        }

        return $breadcrumbs;
    }

    private const MAX_DEPTH = 50;

    private function ensureValidType(string $type): void
    {
        abort_unless(in_array($type, ['folder', 'file'], true), 404);
    }

    /**
     * Strip path separators, traversal sequences and control characters from a client-supplied name.
     */
    private function sanitizeName(string $name): string
    {
        $clean = str_replace(['/', '\\', '..'], '', $name);
        $clean = preg_replace('/[\x00-\x1F]/', '', $clean);

        return trim($clean) ?: 'Tanpa nama';
    }

    /**
     * True when $folderId is $rootId itself or sits underneath it.
     */
    private function isSameOrDescendant($folderId, $rootId): bool
    {
        $current = Folder::find($folderId);
        $seen = [];

        while ($current && count($seen) < self::MAX_DEPTH) {
            if ($current->id === (int) $rootId) {
                return true;
            }
            if (in_array($current->id, $seen, true)) {
                break;
            }
            $seen[] = $current->id;
            $current = $current->parent;
        }

        return false;
    }

    /**
     * True when the folder or any folder beneath it holds an item owned by someone else.
     */
    private function subtreeHasForeignContent(Folder $root, int $userId): bool
    {
        $ids = [$root->id];
        $frontier = [$root->id];
        $depth = 0;

        while ($frontier && $depth++ < self::MAX_DEPTH) {
            $children = Folder::whereIn('parent_id', $frontier)->get(['id', 'user_id']);
            $frontier = [];
            foreach ($children as $child) {
                if ($child->user_id !== $userId) {
                    return true;
                }
                $ids[] = $child->id;
                $frontier[] = $child->id;
            }
        }

        if (Folder::whereIn('id', $ids)->where('user_id', '!=', $userId)->exists()) {
            return true;
        }

        return Media::whereIn('folder_id', $ids)->get()->contains(function (Media $media) use ($userId) {
            $owner = $media->model instanceof Folder
                ? $media->model->user_id
                : ($media->model_type === \App\Models\User::class ? $media->model_id : null);

            return $owner !== $userId;
        });
    }
}
