<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\Api\Admin\AdminController;


Route::prefix('admin')
        ->middleware(['auth:api', 'role:admin'])
        ->group(function () {
                Route::get('/test', [AdminController::class, 'index']);

                Route::post('/Add_admin', [AdminController::class, 'addAdmin']);

                Route::get('/cities/{cityName}/id', [AdminController::class, 'getCityIdByName']);
                Route::get('/specialties/{specialtyName}/id', [AdminController::class, 'getSpecialtyIdByName']);


                Route::post('/doctors', [AdminController::class, 'addDoctor']);

                Route::post('/Addcities', [AdminController::class, 'Add_city']);
                Route::post('/Addspecialties', [AdminController::class, 'Add_Specialty']);



                Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);

                Route::get('/patients', [AdminController::class, 'getAllPatients']);
                Route::delete('/patients/{id}', [AdminController::class, 'deletePatient']);

                Route::get('/doctors', [AdminController::class, 'getAllDoctors']);

                Route::put('/password', [AdminController::class, 'changePassword']);
                Route::get('/dashboard', [AdminController::class, 'dashboard']);
                Route::patch('/me', [AdminController::class, 'updateMyInfo']);
                
        });
