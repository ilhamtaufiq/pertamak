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
            'breadcrumbs' => $this->getBreadcrumbs($parentId)
        ]);
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id'
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
            'file' => 'required|file',
            'folder_id' => 'nullable|exists:folders,id'
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
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'parent_id' => 'sometimes|nullable|exists:folders,id',
            'folder_id' => 'sometimes|nullable|exists:folders,id'
        ]);

        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');

        if ($type === 'folder') {
            $query = Folder::query();
            if (!$isAdmin) $query->where('user_id', $user->id);
            
            $folder = $query->findOrFail($id);
            $updateData = [];
            if ($request->has('name')) $updateData['name'] = $request->name;
            if ($request->has('parent_id')) {
                // Check move target permission
                if ($request->parent_id && !$isAdmin) {
                    $target = Folder::where('user_id', $user->id)->find($request->parent_id);
                    if (!$target) return response()->json(['message' => 'Unauthorized'], 403);
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
            if ($request->has('name')) $updateData['file_name'] = $request->name;
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
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');

        if ($type === 'folder') {
            $query = Folder::query();
            if (!$isAdmin) $query->where('user_id', $user->id);
            $folder = $query->findOrFail($id);
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

    private function getBreadcrumbs($id)
    {
        $breadcrumbs = [];
        $current = $id ? Folder::find($id) : null;

        while ($current) {
            array_unshift($breadcrumbs, [
                'id' => $current->id,
                'name' => $current->name
            ]);
            $current = $current->parent;
        }

        return $breadcrumbs;
    }
}
