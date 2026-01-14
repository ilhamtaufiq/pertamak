<?php

namespace App\Http\Controllers;

use App\Models\JadwalPiket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JadwalPiketController extends Controller
{
    /**
     * Display jadwal piket grouped by hari and shift
     */
    public function index(): JsonResponse
    {
        $jadwals = JadwalPiket::with('karyawan')
            ->where('shift', 'Malam')
            ->get()
            ->sortBy(function ($jadwal) {
                $hariOrder = JadwalPiket::getHariOrder();
                return ($hariOrder[$jadwal->hari] ?? 99) * 10;
            })
            ->values();

        // Group by hari for 'Malam' shift
        $grouped = $jadwals->groupBy('hari')->map(function ($items) {
            return [
                'Malam' => $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'tanggal' => $item->tanggal,
                        'karyawan_id' => $item->karyawan_id,
                        'karyawan' => $item->karyawan,
                    ];
                })->values()
            ];
        });

        return response()->json([
            'data' => $jadwals,
            'grouped' => $grouped,
        ]);
    }

    /**
     * Store new jadwal piket
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'tanggal' => 'required|date',
            'karyawan_id' => 'required|exists:karyawans,id',
        ]);

        $validated['shift'] = 'Malam';

        // Check if already exists
        $exists = JadwalPiket::where('tanggal', $validated['tanggal'])
            ->where('shift', 'Malam')
            ->where('karyawan_id', $validated['karyawan_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Jadwal piket sudah ada',
            ], 422);
        }

        $jadwal = JadwalPiket::create($validated);

        return response()->json([
            'message' => 'Jadwal piket berhasil ditambahkan',
            'data' => $jadwal->load('karyawan'),
        ], 201);
    }

    /**
     * Display the specified jadwal
     */
    public function show(JadwalPiket $jadwalPiket): JsonResponse
    {
        return response()->json([
            'data' => $jadwalPiket->load('karyawan'),
        ]);
    }

    /**
     * Update the specified jadwal
     */
    public function update(Request $request, JadwalPiket $jadwalPiket): JsonResponse
    {
        $validated = $request->validate([
            'hari' => 'sometimes|required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'tanggal' => 'sometimes|required|date',
            'karyawan_id' => 'sometimes|required|exists:karyawans,id',
        ]);

        if (isset($validated['shift'])) {
            $validated['shift'] = 'Malam';
        }

        $jadwalPiket->update($validated);

        return response()->json([
            'message' => 'Jadwal piket berhasil diperbarui',
            'data' => $jadwalPiket->fresh()->load('karyawan'),
        ]);
    }

    /**
     * Remove the specified jadwal
     */
    public function destroy(JadwalPiket $jadwalPiket): JsonResponse
    {
        $jadwalPiket->delete();

        return response()->json([
            'message' => 'Jadwal piket berhasil dihapus',
        ]);
    }
}
