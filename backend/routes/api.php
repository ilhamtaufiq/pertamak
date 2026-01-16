<?php

use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\JadwalPiketController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    Route::apiResource('kegiatans', KegiatanController::class);
    Route::apiResource('karyawans', KaryawanController::class);
    Route::apiResource('jadwal-pikets', JadwalPiketController::class);
    
    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/users/online', [UserController::class, 'online']);
        Route::apiResource('users', UserController::class);
    });
});
