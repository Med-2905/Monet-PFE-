<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\RoleMiddleware;

use App\Http\Controllers\Api\Patient\PatientController;
use App\Models\Patient;


Route::prefix('patient')
        ->middleware(['auth:api', 'role:patient'])
        ->group(function () {
                Route::get('/test', function () {
                        return response()->json([
                                'message' => 'Patient API is working!'
                        ]);
                });

                Route::get('/profile', [PatientController::class, 'profile']);
                Route::put('/profile', [PatientController::class, 'updateProfile']);

                Route::put('/password', [PatientController::class, 'updatePassword']);


                Route::get('/cities', [PatientController::class, 'cities']);
                Route::get('/specialties', [PatientController::class, 'specialties']);
                Route::get('/doctors', [PatientController::class, 'doctors']);

                Route::post('/doctors/{doctor}/rdv', [PatientController::class, 'reserve_RDV']);
                Route::get('/rdvs', [PatientController::class, 'Rdvs']);
                Route::get('/rdvs/{rdv}/status', [PatientController::class, 'RdvStatus']);
                Route::get('/rdvs/history', [PatientController::class, 'RdvHistory']);
                Route::post('/rdvs/{rdv}/cancel', [PatientController::class, 'cancelRdv']);
                
                Route::get('/ordonnances', [PatientController::class, 'Ordonnances']);
                Route::post('/rdvs/{rdv}/review', [PatientController::class, 'addReview']);
        });
