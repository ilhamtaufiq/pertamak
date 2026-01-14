<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jadwal_pikets', function (Blueprint $table) {
            $table->date('tanggal')->nullable()->after('hari');
            
            // Re-define unique constraint to include tanggal
            $table->dropUnique(['hari', 'shift', 'karyawan_id']);
            $table->unique(['tanggal', 'shift', 'karyawan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jadwal_pikets', function (Blueprint $table) {
            $table->dropUnique(['tanggal', 'shift', 'karyawan_id']);
            $table->unique(['hari', 'shift', 'karyawan_id']);
            $table->dropColumn('tanggal');
        });
    }
};
