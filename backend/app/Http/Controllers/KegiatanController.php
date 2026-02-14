<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class KegiatanController extends Controller
{
    /**
     * Display a listing of kegiatans
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $user = auth()->user();

        $query = Kegiatan::with(['media', 'user.karyawan'])
            ->orderBy('tanggal', 'desc');

        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        // Filtering
        if ($request->has('day') && !empty($request->day)) {
            $query->whereDay('tanggal', $request->day);
        }
        if ($request->has('month') && !empty($request->month)) {
            $query->whereMonth('tanggal', $request->month);
        }
        if ($request->has('year') && !empty($request->year)) {
            $query->whereYear('tanggal', $request->year);
        }
        if ($user->hasRole('admin') && $request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }

        $kegiatans = $query->paginate($perPage);

        return response()->json($kegiatans);
    }

    /**
     * Store a newly created kegiatan
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'lokasi' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'uraian_kegiatan' => 'required|string',
            'dokumentasi' => 'nullable|array',
            'dokumentasi.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        // Auto-generate hari from tanggal
        $tanggal = Carbon::parse($validated['tanggal']);
        $hariIndo = [
            'Sunday' => 'Minggu',
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
        ];

        $kegiatan = Kegiatan::create([
            'user_id' => auth()->id(),
            'tanggal' => $validated['tanggal'],
            'hari' => $hariIndo[$tanggal->format('l')],
            'lokasi' => $validated['lokasi'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'uraian_kegiatan' => $validated['uraian_kegiatan'],
        ]);

        // Handle multiple dokumentasi uploads
        if ($request->hasFile('dokumentasi')) {
            foreach ($request->file('dokumentasi') as $file) {
                $kegiatan->addMedia($file)
                    ->toMediaCollection('dokumentasi');
            }
        }

        return response()->json([
            'message' => 'Kegiatan berhasil ditambahkan',
            'data' => $kegiatan->load('media'),
        ], 201);
    }

    /**
     * Display the specified kegiatan
     */
    public function show(Kegiatan $kegiatan): JsonResponse
    {
        return response()->json($kegiatan->load('media'));
    }

    /**
     * Update the specified kegiatan
     */
    public function update(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        $user = auth()->user();
        if (!$user->hasRole('admin') && $kegiatan->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tanggal' => 'sometimes|required|date',
            'lokasi' => 'sometimes|required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'uraian_kegiatan' => 'sometimes|required|string',
            'dokumentasi' => 'nullable|array',
            'dokumentasi.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
            'delete_dokumentasi' => 'nullable|array',
            'delete_dokumentasi.*' => 'integer',
        ]);

        // Update hari if tanggal changed
        if (isset($validated['tanggal'])) {
            $tanggal = Carbon::parse($validated['tanggal']);
            $hariIndo = [
                'Sunday' => 'Minggu',
                'Monday' => 'Senin',
                'Tuesday' => 'Selasa',
                'Wednesday' => 'Rabu',
                'Thursday' => 'Kamis',
                'Friday' => 'Jumat',
                'Saturday' => 'Sabtu',
            ];
            $validated['hari'] = $hariIndo[$tanggal->format('l')];
        }

        $kegiatan->update($validated);

        // Delete selected dokumentasi
        if ($request->has('delete_dokumentasi')) {
            $kegiatan->media()
                ->whereIn('id', $request->delete_dokumentasi)
                ->delete();
        }

        // Add new dokumentasi
        if ($request->hasFile('dokumentasi')) {
            foreach ($request->file('dokumentasi') as $file) {
                $kegiatan->addMedia($file)
                    ->toMediaCollection('dokumentasi');
            }
        }

        return response()->json([
            'message' => 'Kegiatan berhasil diperbarui',
            'data' => $kegiatan->fresh()->load('media'),
        ]);
    }

    /**
     * Remove the specified kegiatan
     */
    public function destroy(Kegiatan $kegiatan): JsonResponse
    {
        $user = auth()->user();
        if (!$user->hasRole('admin') && $kegiatan->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $kegiatan->delete();

        return response()->json([
            'message' => 'Kegiatan berhasil dihapus',
        ]);
    }
}
