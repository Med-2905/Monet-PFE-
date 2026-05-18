<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\RoleMiddleware;

use App\Http\Controllers\Api\Patient\PatientController;
use App\Models\Patient;


Route::prefix('patient')
        ->middleware(['auth:api', 'role:patient'])
        ->group(function () {
                Route::get('/test', function() {
                        return response()->json([
                                'message' => 'Patient API is working!'
                        ]);
                });
                
                Route::get('/profile', [PatientController::class, 'profile']);
                Route::put('/profile', [PatientController::class, 'updateProfile']);
                
                Route::put('/password', [PatientController::class, 'updatePassword']);
                Route::get('/doctors', [PatientController::class, 'doctors']);
        });
