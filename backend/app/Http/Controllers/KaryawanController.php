<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KaryawanController extends Controller
{
    /**
     * Display a listing of karyawan
     */
    public function index(): JsonResponse
    {
        $karyawans = Karyawan::orderBy('nama')->get();

        return response()->json([
            'data' => $karyawans,
        ]);
    }

    /**
     * Store a newly created karyawan
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'nip' => 'nullable|string|max:50',
            'no_hp' => 'nullable|string|max:20',
            'foto' => 'nullable|image|max:5120',
        ]);

        $karyawan = Karyawan::create($validated);

        // Handle foto upload
        if ($request->hasFile('foto')) {
            $karyawan->addMediaFromRequest('foto')
                ->toMediaCollection('foto');
        }

        return response()->json([
            'message' => 'Karyawan berhasil ditambahkan',
            'data' => $karyawan->fresh(),
        ], 201);
    }

    /**
     * Display the specified karyawan
     */
    public function show(Karyawan $karyawan): JsonResponse
    {
        return response()->json([
            'data' => $karyawan,
        ]);
    }

    /**
     * Update the specified karyawan
     */
    public function update(Request $request, Karyawan $karyawan): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'jabatan' => 'sometimes|required|string|max:255',
            'nip' => 'nullable|string|max:50',
            'no_hp' => 'nullable|string|max:20',
            'foto' => 'nullable|image|max:5120',
            'delete_foto' => 'nullable|boolean',
        ]);

        $karyawan->update($validated);

        // Handle foto deletion
        if ($request->boolean('delete_foto')) {
            $karyawan->clearMediaCollection('foto');
        }

        // Handle new foto upload
        if ($request->hasFile('foto')) {
            $karyawan->clearMediaCollection('foto');
            $karyawan->addMediaFromRequest('foto')
                ->toMediaCollection('foto');
        }

        return response()->json([
            'message' => 'Karyawan berhasil diperbarui',
            'data' => $karyawan->fresh(),
        ]);
    }

    /**
     * Remove the specified karyawan
     */
    public function destroy(Karyawan $karyawan): JsonResponse
    {
        $karyawan->delete();

        return response()->json([
            'message' => 'Karyawan berhasil dihapus',
        ]);
    }
}
