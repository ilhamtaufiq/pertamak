<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
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
        $filters = $this->validatedFilters($request);
        $perPage = $request->integer('per_page', 15);

        $kegiatans = $this->filteredQuery($filters)
            ->orderBy('tanggal', 'desc')
            ->paginate($perPage);

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

        $filters = $this->validatedFilters($request);
        $kegiatans = $this->filteredQuery($filters)
            ->orderBy('tanggal', 'asc')
            ->get();

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
        
        if ($periode = $this->periodeLabel($filters)) {
            $section->addText("Periode: $periode", ['bold' => true], ['alignment' => Jc::CENTER]);
        }

        if ($exportUser = $this->exportUser($filters)) {
            $section->addText("Nama: {$exportUser->name}", ['bold' => true], ['alignment' => Jc::CENTER]);
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
                $imagePath = $media->getPath('optimized');
                
                // Fallback to original if optimized doesn't exist
                if (!file_exists($imagePath)) {
                    $imagePath = $media->getPath();
                }

                if (file_exists($imagePath)) {
                    try {
                        $docCell->addImage($imagePath, [
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

        $filename = $this->exportFilename($filters, 'docx');

        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        
        $tempFile = tempnam(sys_get_temp_dir(), 'docx');
        $objWriter->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Export kegiatan to PDF
     */
    public function exportPdf(Request $request)
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        $filters = $this->validatedFilters($request);
        $kegiatans = $this->filteredQuery($filters)
            ->orderBy('tanggal', 'asc')
            ->get();

        // Embed photos as data URIs so dompdf never needs filesystem or remote access.
        // Capped per export to keep memory bounded; the cap is reported via headers.
        $limit = (int) config('kegiatan.pdf_max_images', 150);
        $embedded = 0;
        $skipped = 0;

        $rows = $kegiatans->map(function (Kegiatan $kegiatan) use ($limit, &$embedded, &$skipped) {
            $images = [];
            foreach ($kegiatan->media as $media) {
                if ($embedded >= $limit) {
                    $skipped++;
                    continue;
                }

                $imagePath = $media->getPath('optimized');
                if (!file_exists($imagePath)) {
                    $imagePath = $media->getPath();
                }
                if (file_exists($imagePath)) {
                    $mime = mime_content_type($imagePath) ?: $media->mime_type;
                    $images[] = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($imagePath));
                    $embedded++;
                }
            }

            return [
                'tanggal' => $kegiatan->hari . ', ' . $kegiatan->tanggal->format('d-m-Y'),
                'lokasi' => $kegiatan->lokasi,
                'uraian' => $kegiatan->uraian_kegiatan,
                'images' => $images,
            ];
        });

        $pdf = Pdf::loadView('exports.kegiatan-pdf', [
            'rows' => $rows,
            'periode' => $this->periodeLabel($filters),
            'nama' => $this->exportUser($filters)?->name,
        ])->setPaper([0, 0, 595.28, 935.43]); // F4 (210 x 330 mm), same as the DOCX export

        return $pdf->download($this->exportFilename($filters, 'pdf'))
            ->header('X-Export-Images-Limit', (string) $limit)
            ->header('X-Export-Images-Skipped', (string) $skipped);
    }

    /**
     * Validate the shared list/export filters.
     */
    private function validatedFilters(Request $request): array
    {
        return $request->validate([
            'day' => 'nullable|integer|between:1,31',
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|between:2000,2100',
            'user_id' => 'nullable|integer|exists:users,id',
            'per_page' => 'nullable|integer|between:1,100',
        ]);
    }

    /**
     * Base query honoring filters. Non-admins are always scoped to their own kegiatan.
     */
    private function filteredQuery(array $filters): Builder
    {
        $user = auth()->user();
        $query = Kegiatan::with(['media', 'user.karyawan']);

        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        } elseif (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['day'])) {
            $query->whereDay('tanggal', $filters['day']);
        }
        if (!empty($filters['month'])) {
            $query->whereMonth('tanggal', $filters['month']);
        }
        if (!empty($filters['year'])) {
            $query->whereYear('tanggal', $filters['year']);
        }

        return $query;
    }

    /**
     * Human readable period for export headers, e.g. "Maret 2026" or "2026".
     */
    private function periodeLabel(array $filters): ?string
    {
        if (!empty($filters['month']) && !empty($filters['year'])) {
            return Carbon::createFromDate((int) $filters['year'], (int) $filters['month'], 1)->locale('id')->translatedFormat('F Y');
        }
        if (!empty($filters['year'])) {
            return (string) $filters['year'];
        }

        return null;
    }

    /**
     * The user whose kegiatan are exported (null when an admin exports everyone).
     */
    private function exportUser(array $filters): ?User
    {
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            return $user;
        }

        return !empty($filters['user_id']) ? User::find($filters['user_id']) : null;
    }

    private function exportFilename(array $filters, string $extension): string
    {
        $filename = 'Laporan_Kegiatan';
        if (!empty($filters['year'])) {
            $filename .= '_' . $filters['year'];
            if (!empty($filters['month'])) {
                $filename .= '_' . str_pad($filters['month'], 2, '0', STR_PAD_LEFT);
            }
        }

        return $filename . '_' . now()->format('His') . '.' . $extension;
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
        $user = auth()->user();
        if (!$user->hasRole('admin') && $kegiatan->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
