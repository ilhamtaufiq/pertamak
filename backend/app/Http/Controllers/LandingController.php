<?php

namespace App\Http\Controllers;

use App\Models\JadwalPiket;
use App\Models\Karyawan;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

class LandingController extends Controller
{
    public function __invoke(): View
    {
        $stats = [
            'kegiatan' => $this->safeCount(Kegiatan::class),
            'karyawan' => $this->safeCount(Karyawan::class),
            'users' => $this->safeCount(User::class),
            'piket_hari_ini' => 0,
        ];

        try {
            if (Schema::hasTable((new JadwalPiket)->getTable())) {
                $stats['piket_hari_ini'] = JadwalPiket::query()
                    ->whereDate('tanggal', today())
                    ->count();
            }
        } catch (\Throwable) {
            // ignore if schema differs
        }

        $simanUrl = config('services.siman.url', 'https://siman.cianjur.space');

        return view('landing', [
            'stats' => $stats,
            'simanUrl' => $simanUrl,
        ]);
    }

    protected function safeCount(string $modelClass): int
    {
        try {
            return $modelClass::query()->count();
        } catch (\Throwable) {
            return 0;
        }
    }
}
