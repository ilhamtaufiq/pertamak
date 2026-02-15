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

Route::middleware(['auth:sanctum', 'last_seen'])->group(function () {
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

    // Media Library Organizer
    Route::prefix('v1/media')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\MediaController::class, 'index']);
        Route::get('/all-folders', [\App\Http\Controllers\Api\V1\MediaController::class, 'allFolders']);
        Route::post('/upload', [\App\Http\Controllers\Api\V1\MediaController::class, 'upload']);
        Route::post('/folders', [\App\Http\Controllers\Api\V1\MediaController::class, 'createFolder']);
        Route::patch('/{type}/{id}', [\App\Http\Controllers\Api\V1\MediaController::class, 'rename']);
        Route::delete('/{type}/{id}', [\App\Http\Controllers\Api\V1\MediaController::class, 'destroy']);
    });
});
