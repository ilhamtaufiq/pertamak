<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_pikets', function (Blueprint $table) {
            $table->id();
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);
            $table->enum('shift', ['Pagi', 'Siang', 'Malam']);
            $table->foreignId('karyawan_id')->constrained('karyawans')->onDelete('cascade');
            $table->timestamps();
            
            // Unique constraint: one employee per shift per day
            $table->unique(['hari', 'shift', 'karyawan_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_pikets');
    }
};
