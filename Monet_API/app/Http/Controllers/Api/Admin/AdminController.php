<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\User;
use App\Models\Admin;
use App\Http\Controllers\Controller;
use App\Models\cities;
use App\Models\Specialties;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\UserRole;

use Illuminate\Support\Str;

use Illuminate\Support\Facades\Hash;
use App\Models\Doctor;
use App\Models\Reviews;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    //







    //Ajouter un nouveau admin
    public function addAdmin(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'regex:/^[0-9\+\-\(\)\s]+$/', 'min:10', 'max:20'],
        ]);

        $admin = DB::transaction(function () use ($validated) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => UserRole::ADMIN->value,
            ]);

            $adminProfile = Admin::create([
                'user_id' => $user->id,
            ]);

            return [
                'user' => $user,
                'admin_profile' => $adminProfile,
            ];
        });

        return response()->json([
            'message' => 'Admin created successfully',
            'admin' => $admin,
        ], 201);
    }



    // 
    private function findCityIdByName(string $cityName): int
    {
        $city = cities::whereRaw('LOWER(name) = ?', [
            strtolower(trim($cityName))
        ])->first();

        if (! $city) {
            abort(404, 'City not found');
        }

        return $city->id;
    }

    private function findSpecialtyIdByName(string $specialtyName): int
    {
        $specialty = Specialties::whereRaw('LOWER(name) = ?', [
            strtolower(trim($specialtyName))
        ])->first();

        if (! $specialty) {
            abort(404, 'Specialty not found');
        }

        return $specialty->id;
    }

    // For Postman testing city id
    public function getCityIdByName(string $cityName)
    {
        $cityId = $this->findCityIdByName($cityName);

        return response()->json([
            'city_id' => $cityId,
            'city_name' => $cityName,
        ]);
    }

    // For Postman testing specialty id
    public function getSpecialtyIdByName(string $specialtyName)
    {
        $specialtyId = $this->findSpecialtyIdByName($specialtyName);

        return response()->json([
            'specialty_id' => $specialtyId,
            'specialty_name' => $specialtyName,
        ]);
    }


    public function getCities()
    {
        return response()->json([
            'cities' => cities::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function getSpecialties()
    {
        return response()->json([
            'specialties' => Specialties::orderBy('name')->get(['id', 'name']),
        ]);
    }

    // ajouter un nouveau doctor
    public function addDoctor(Request $request)
    {
        /*
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'regex:/^[0-9\+\-\(\)\s]+$/', 'min:10', 'max:20'],


            'city_id' => ['required', 'exists:cities,id'],
            'specialty_id' => ['required', 'exists:specialties,id'],

            'address' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255', 'unique:doctors,license_number'],
            'bio' => ['nullable', 'string'],
        ]);

        $cityId = $this->findCityIdByName($validated['city_name']);
        $specialtyId = $this->findSpecialtyIdByName($validated['specialty_name']);

        $doctor = DB::transaction(function () use ($validated, $cityId, $specialtyId) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => UserRole::DOCTOR->value,
            ]);

            $doctorProfile = Doctor::create([
                'user_id' => $user->id,
                'city_id' => $validated['city_id'],
                'specialty_id' => $validated['specialty_id'],
                'address' => $validated['address'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'bio' => $validated['bio'] ?? null,
            ]);

            return [
                'user' => $user,
                'doctor_profile' => $doctorProfile,
            ];
        });

        return response()->json([
            'message' => 'Doctor created successfully',
            'doctor' => $doctor,
        ], 201);*/
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:30'],

            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'specialty_id' => ['required', 'integer', 'exists:specialties,id'],

            'address' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
        ]);

        $doctor = DB::transaction(function () use ($validated) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => UserRole::DOCTOR->value,
            ]);

            return Doctor::create([
                'user_id' => $user->id,
                'city_id' => $validated['city_id'],
                'specialty_id' => $validated['specialty_id'],
                'address' => $validated['address'] ?? null,
                'license_number' => $validated['license_number'] ?? null,
                'bio' => $validated['bio'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Doctor created successfully',
            'doctor' => $doctor->load(['user', 'city', 'specialty']),
        ], 201);
    }




    // Ajouter un neveau city
    public function Add_city(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);


        $cityName = trim($validated['name']);


        $exists = cities::whereRaw('Lower(name) =?', Str::lower($cityName))->exists();

        if ($exists) {
            return response()->json([
                'message' =>  'City already exists',

            ], 404);
        }


        $city = cities::create([
            'name' => $cityName,
        ]);


        return response()->json([
            'message' => 'City created successfully',
            'city' => $city,
        ], 201);
    }





    public function Add_Specialty(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);



        $specialtyName = trim($validated['name']);

        $exists = Specialties::whereRaw('LOWER(name) = ? ', Str::lower($specialtyName))->exists();

        if ($exists) {
            return response()->json([
                'message' =>  'Specialty already exists',

            ], 404);
        }


        $specialty = Specialties::create([
            'name' => $specialtyName,
        ]);

        return response()->json([
            'message' => 'Specialty created successfully',
            'specialty' => $specialty,
        ], 201);
    }



    // role helper 
    public function roleValue($role)
    {
        return $role instanceof UserRole ? $role->value : $role;
    }



    public function deleteReview($reviewId)
    {


        $review = Reviews::findOrFail($reviewId);
        $review->delete();
        return response()->json([
            'message' => 'Review deleted succefully',
        ]);
    }




    // function for deleting a patient by admin 
    public function deletePatient($patientId)
    {
        $patient = User::findOrFail($patientId);

        if ($this->roleValue($patient->role) !== UserRole::PATIENT->value) {
            return response()->json([
                'message' => 'This user is not a patient',
            ], 422);
        }

        $patient->delete();

        return response()->json([
            'message' => 'Patient deleted successfully',
        ]);
    }




    // read all patient 

    public function getAllPatients(Request $request)
    {
        $patients = User::query()
            ->where('role', UserRole::PATIENT->value)

            ->when($request->filled('name'), function ($query) use ($request) {
                $name = strtolower($request->name);

                $query->where(function ($q) use ($name) {
                    $q->whereRaw('LOWER(first_name) LIKE ?', ["%{$name}%"])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$name}%"])
                        ->orWhereRaw('LOWER(username) LIKE ?', ["%{$name}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$name}%"]);
                });
            })

            ->select([
                'id',
                'first_name',
                'last_name',
                'username',
                'email',
                'phone',
                'role',
                'created_at',
            ])

            ->latest()
            ->paginate(15);

        return response()->json([
            'patients' => $patients,
        ]);
    }




    // get all doctors with their city and specialty names with filtring by name and specialty

    public function getAllDoctors(Request $request)
    {
        $doctors = Doctor::query()
            ->with([

                'user:id,first_name,last_name,username,email,phone,role',
                'city:id,name',
                'specialty:id,name',
            ])
            ->when($request->filled('name'), function ($query) use ($request) {
                $name = strtolower($request->name);

                $query->whereHas('user', function ($q) use ($name) {
                    $q->whereRaw('LOWER(first_name) LIKE ?', ["%{$name}%"])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$name}%"])
                        ->orWhereRaw('LOWER(username) LIKE ?', ["%{$name}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$name}%"]);
                });
            })

            ->when($request->filled('city'), function ($query) use ($request) {
                $city = strtolower($request->city);

                $query->whereHas('city', function ($q) use ($city) {
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$city}%"]);
                });
            })

            ->when($request->filled('specialty'), function ($query) use ($request) {
                $specialty = strtolower($request->specialty);

                $query->whereHas('specialty', function ($q) use ($specialty) {
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$specialty}%"]);
                });
            })

            ->when($request->filled('city_id'), function ($query) use ($request) {
                $query->where('city_id', $request->city_id);
            })

            ->when($request->filled('specialty_id'), function ($query) use ($request) {
                $query->where('specialty_id', $request->specialty_id);
            })

            ->latest()
            ->paginate(15);

        return response()->json([
            'doctors' => $doctors,
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        /** @var \App\Models\Admin $admin */
        $admin = auth('api')->user();

        if (! $admin) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($this->roleValue($admin->role) !== UserRole::ADMIN->value) {
            return response()->json([
                'message' => 'Only admins can change password here',
            ], 403);
        }

        if (! Hash::check($validated['current_password'], $admin->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $admin->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    public function updateMyInfo(Request $request)
    {
        /** @var \App\Models\Admin $admin */
        $admin = auth('api')->user();

        if (! $admin) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],

            'username' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($admin->id),
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($admin->id),
            ],

            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^[0-9\+\-\(\)\s]+$/',
                'min:10',
                'max:20',
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'message' => 'No data provided to update',
            ], 422);
        }

        $admin->update($validated);

        return response()->json([
            'message' => 'Admin information updated successfully',
            'admin' => $admin->only([
                'id',
                'first_name',
                'last_name',
                'username',
                'email',
                'phone',
                'role',
                'updated_at',
            ]),
        ]);
    }

    public function getAllReviews(Request $request)
    {
        $reviews = Reviews::query()
            ->with([
                'patient:id,first_name,last_name,username,email,phone',
                'doctor:id,user_id,specialty_id,city_id',
                'doctor.user:id,first_name,last_name,username,email,phone',
                'doctor.city:id,name',
                'doctor.specialty:id,name',
            ])

            ->when($request->filled('rating'), function ($query) use ($request) {
                $query->where('rating', $request->rating);
            })

            ->when($request->filled('patient'), function ($query) use ($request) {
                $patient = strtolower($request->patient);

                $query->whereHas('patient', function ($q) use ($patient) {
                    $q->whereRaw('LOWER(first_name) LIKE ?', ["%{$patient}%"])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$patient}%"])
                        ->orWhereRaw('LOWER(username) LIKE ?', ["%{$patient}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$patient}%"]);
                });
            })

            ->when($request->filled('doctor'), function ($query) use ($request) {
                $doctor = strtolower($request->doctor);

                $query->whereHas('doctor.user', function ($q) use ($doctor) {
                    $q->whereRaw('LOWER(first_name) LIKE ?', ["%{$doctor}%"])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$doctor}%"])
                        ->orWhereRaw('LOWER(username) LIKE ?', ["%{$doctor}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$doctor}%"]);
                });
            })

            ->latest()
            ->paginate(15);

        return response()->json([
            'reviews' => $reviews,
        ]);
    }


    public function dashboard()
    {
        return response()->json([
            'admins' => User::where('role', UserRole::ADMIN->value)->count(),
            'doctors' => User::where('role', UserRole::DOCTOR->value)->count(),
            'patients' => User::where('role', UserRole::PATIENT->value)->count(),
        ]);
    }
}
