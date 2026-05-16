<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;


Route::get('/test', function () {
    return response()->json([
        'message' => 'API works haahhahhahahh',
        'status' => true
    ]);
});

require __DIR__.'/Admin/AdminApi.php';
/*
// Public (no auth needed)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected (auth required)
Route::middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});
*/


Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', 'me');
        Route::post('/logout', 'logout');
        Route::post('/refresh', 'refresh');
    });
});
