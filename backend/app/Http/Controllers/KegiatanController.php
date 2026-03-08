<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use App\Models\Folder;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\Table;

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
     * Export kegiatan to DOCX
     */
    public function exportDocx(Request $request)
    {
        // Increase memory and time limit for large exports with many images
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        $user = auth()->user();
        $query = Kegiatan::with(['media', 'user.karyawan'])
            ->orderBy('tanggal', 'asc');

        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        // Filtering (same as index)
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

        $kegiatans = $query->get();

        $phpWord = new PhpWord();
        
        // Define styles
        $phpWord->addTitleStyle(1, ['bold' => true, 'size' => 16], ['alignment' => Jc::CENTER]);
        $phpWord->addTableStyle('KegiatanTable', [
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 80,
            'alignment' => Jc::CENTER,
        ]);

        $section = $phpWord->addSection([
            'orientation' => 'portrait',
            'pageSizeW' => 11906,
            'pageSizeH' => 18709,
            'marginTop' => 800,
            'marginBottom' => 800,
            'marginLeft' => 800,
            'marginRight' => 800,
        ]);

        $section->addTitle('LAPORAN KEGIATAN', 1);
        
        if ($request->has('month') && $request->has('year')) {
            $monthName = Carbon::createFromDate($request->year, $request->month, 1)->translatedFormat('F');
            $section->addText("Periode: $monthName {$request->year}", ['bold' => true], ['alignment' => Jc::CENTER]);
        }
        
        if ($user->hasRole('admin') && $request->has('user_id')) {
            $exportUser = \App\Models\User::find($request->user_id);
            if ($exportUser) {
                $section->addText("Nama: {$exportUser->name}", ['bold' => true], ['alignment' => Jc::CENTER]);
            }
        } elseif (!$user->hasRole('admin')) {
            $section->addText("Nama: {$user->name}", ['bold' => true], ['alignment' => Jc::CENTER]);
        }

        $section->addTextBreak(1);

        $table = $section->addTable('KegiatanTable');

        // Header
        $table->addRow();
        $table->addCell(500, ['bgColor' => 'EEEEEE'])->addText('No', ['bold' => true], ['alignment' => Jc::CENTER]);
        $table->addCell(1800, ['bgColor' => 'EEEEEE'])->addText('Hari/Tanggal', ['bold' => true], ['alignment' => Jc::CENTER]);
        $table->addCell(1800, ['bgColor' => 'EEEEEE'])->addText('Lokasi', ['bold' => true], ['alignment' => Jc::CENTER]);
        $table->addCell(3500, ['bgColor' => 'EEEEEE'])->addText('Uraian Kegiatan', ['bold' => true], ['alignment' => Jc::CENTER]);
        $table->addCell(2700, ['bgColor' => 'EEEEEE'])->addText('Dokumentasi', ['bold' => true], ['alignment' => Jc::CENTER]);

        foreach ($kegiatans as $index => $kegiatan) {
            $table->addRow();
            $table->addCell(500)->addText($index + 1, null, ['alignment' => Jc::CENTER]);
            $table->addCell(1800)->addText($kegiatan->hari . ', ' . $kegiatan->tanggal->format('d-m-Y'));
            $table->addCell(1800)->addText($kegiatan->lokasi);
            $table->addCell(3500)->addText($kegiatan->uraian_kegiatan);
            
            $docCell = $table->addCell(2700);
            foreach ($kegiatan->media as $media) {
                if (file_exists($media->getPath())) {
                    try {
                        $docCell->addImage($media->getPath(), [
                            'width' => 120,
                            'height' => 120,
                            'marginTop' => 5,
                            'marginBottom' => 5,
                            'alignment' => Jc::CENTER
                        ]);
                        $docCell->addTextBreak(1);
                    } catch (\Exception $e) {
                        // Skip if image is invalid
                    }
                }
            }
        }

        $filename = 'Laporan_Kegiatan';
        if ($request->has('month') && $request->has('year')) {
            $filename .= '_' . $request->year . '_' . str_pad($request->month, 2, '0', STR_PAD_LEFT);
        }
        $filename .= '_' . now()->format('His') . '.docx';

        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        
        $tempFile = tempnam(sys_get_temp_dir(), 'docx');
        $objWriter->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
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
            'dokumentasi.*' => 'image|mimes:jpeg,png,jpg,gif|max:51200',
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
            'dokumentasi.*' => 'image|mimes:jpeg,png,jpg,gif|max:51200',
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
