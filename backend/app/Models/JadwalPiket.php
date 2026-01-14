<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JadwalPiket extends Model
{
    use HasFactory;

    protected $fillable = [
        'hari',
        'tanggal',
        'shift',
        'karyawan_id',
    ];

    /**
     * Karyawan relation
     */
    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class);
    }

    /**
     * Get hari order for sorting
     */
    public static function getHariOrder(): array
    {
        return [
            'Senin' => 1,
            'Selasa' => 2,
            'Rabu' => 3,
            'Kamis' => 4,
            'Jumat' => 5,
            'Sabtu' => 6,
            'Minggu' => 7,
        ];
    }

    /**
     * Get shift order for sorting
     */
    public static function getShiftOrder(): array
    {
        return [
            'Pagi' => 1,
            'Siang' => 2,
            'Malam' => 3,
        ];
    }
}
