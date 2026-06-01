<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\RoleMiddleware;

use App\Http\Controllers\Api\Doctor\DoctorController;
use App\Models\Doctor;




Route::prefix('doctor')
        ->middleware(['auth:api', 'role: doctor'])
        ->group(function () {


                Route::get('/me', [DoctorController::class, 'me']);
                Route::put('/profile', [DoctorController::class, 'updateProfile']);
                Route::put('/change-password', [DoctorController::class, 'updatePassword']);

                Route::get('/RDVS', [DoctorController::class, 'RDVS']);
                Route::patch('/appointments/{rdv}/confirm', [DoctorController::class, 'confirmRDV']);
                Route::patch('/appointments/{rdv}/cancel', [DoctorController::class, 'cancelRDV']);
                Route::patch('/appointments/{rdv}/complete', [DoctorController::class, 'completRDV']);
                Route::patch('/appointments/{rdv}/no-show', [DoctorController::class, 'RDV_NoShow']);

                Route::get('/unavailable-days', [DoctorController::class, 'unavalaibleDays']);
                Route::post('/unavailable-days', [DoctorController::class, 'addUnavailableDay']);
                Route::delete('/unavailable-days/{day}', [DoctorController::class, 'deleteUnavailableDay']);

                Route::post('/appointments/{rdv}/ordonnance', [DoctorController::class, 'createOrdonnance']);
                Route::get('/ordonnances', [DoctorController::class, 'ordonnances']);

                Route::get('/reviews', [DoctorController::class, 'reviews']);


                Route::post('/appointments/{rdv}/medical-record', [DoctorController::class, 'createMedicalRecord']);

                Route::patch('/medical-records/{record}', [DoctorController::class, 'updateMedicalRecord']);

                Route::get('/patients/{patientId}/medical-history', [DoctorController::class, 'patientMedicalHistory']);
                Route::get('/dashboard', [DoctorController::class, 'dashboard']);
        });
