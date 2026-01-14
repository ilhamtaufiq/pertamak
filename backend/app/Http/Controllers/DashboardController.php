<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\Karyawan;
use App\Models\JadwalPiket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics with optional date filtering
     */
    public function stats(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // day, month, year
        $date = $request->get('date', Carbon::today()->toDateString());
        
        $targetDate = Carbon::parse($date);
        
        // Build kegiatan query based on period
        $kegiatanQuery = Kegiatan::query();
        
        switch ($period) {
            case 'day':
                $kegiatanQuery->whereDate('tanggal', $targetDate);
                break;
            case 'month':
                $kegiatanQuery->whereYear('tanggal', $targetDate->year)
                              ->whereMonth('tanggal', $targetDate->month);
                break;
            case 'year':
                $kegiatanQuery->whereYear('tanggal', $targetDate->year);
                break;
        }
        
        // Get counts
        $kegiatanCount = $kegiatanQuery->count();
        $karyawanCount = Karyawan::count();
        
        // Get today's jadwal piket count
        $jadwalPiketTodayCount = JadwalPiket::whereDate('tanggal', Carbon::today())->count();
        
        return response()->json([
            'data' => [
                'kegiatan_count' => $kegiatanCount,
                'karyawan_count' => $karyawanCount,
                'jadwal_piket_today_count' => $jadwalPiketTodayCount,
                'period' => $period,
                'date' => $date,
            ]
        ]);
    }
}
