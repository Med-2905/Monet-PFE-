<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Models\Admin;

Route::prefix('admin')
        ->middleware(['auth:api', 'role:admin'])
        ->group(function () {
                Route::get('/test', [AdminController::class, 'index']);

                Route::post('/Add_admin', [AdminController::class, 'addAdmin']);
                Route::put('/password', [AdminController::class, 'changePassword']);
                Route::patch('/me', [AdminController::class, 'updateMyInfo']);
                


                Route::get('/cities', [AdminController::class, 'getCities']);
                Route::get('/specialties', [AdminController::class, 'getSpecialties']);

                Route::get('/cities/{cityName}/id', [AdminController::class, 'getCityIdByName']);
                Route::get('/specialties/{specialtyName}/id', [AdminController::class, 'getSpecialtyIdByName']);


                Route::post('/doctors', [AdminController::class, 'addDoctor']);

                Route::post('/Addcities', [AdminController::class, 'Add_city']);
                Route::post('/Addspecialties', [AdminController::class, 'Add_Specialty']);



                Route::get("/reviews" , [AdminController::class , 'getAllReviews']);
                Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);

                Route::get('/patients', [AdminController::class, 'getAllPatients']);
                Route::delete('/patients/{id}', [AdminController::class, 'deletePatient']);

                Route::get('/doctors', [AdminController::class, 'getAllDoctors']);

                Route::get('/dashboard', [AdminController::class, 'dashboard']);
                
        });
