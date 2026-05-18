<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;


use Illuminate\Support\Facades\DB;

use App\Models\Doctor;
//use App\Models\User;

class PatientController extends Controller
{
    //


    private function currentPatient()
    {
        /*
        $user  = auth('api')->user();

        if (!$user || $user->role !== 'patient') {
            abort(response()->json([
                'message' => 'Unauthorized'
            ], 401));
        }


        $patient = Patient::where('usert_id', $user->id)->first();


        if (!$patient) {
            abort(response()->json(
                ['message' => 'Patient profile not found'],
                404
            ));
        }


        return $patient;*/
        $userId = auth('api')->id();

        if (! $userId) {
            abort(response()->json([
                'message' => 'Unauthenticated',
            ], 401));
        }

        $patient = Patient::where('user_id', $userId)->first();

        if (! $patient) {
            abort(response()->json([
                'message' => 'Patient profile not found',
            ], 404));
        }

        return $patient;
    }



    public function profile()
    {
        $patient = $this->currentPatient();
        $patient->load('user');
        return response()->json($patient);
    }


    public function updatePassword(Request $request)
    {

        $user = User::findOrFail(auth('api')->id());

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }



    public function updateProfile(Request $request)
    {
        $patient = $this->currentPatient();
        $user = auth('api')->user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'username' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],

            // patients table
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:50'],
            'emergency_contact' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);
        /** @var \App\Models\User $user */
        /** @var \App\Models\Patient $patient */
        DB::transaction(function () use ($validated, $user, $patient) {
            $userFields = collect($validated)->only([
                'first_name',
                'last_name',
                'username',
                'email',
                'phone',
            ])->toArray();

            $patientFields = collect($validated)->only([
                'address',
                'date_of_birth',
                'gender',
                'emergency_contact',
            ])->toArray();

            if (! empty($userFields)) {
                $user->update($userFields);
            }

            if (! empty($patientFields)) {
                $patient->update($patientFields);
            }
        });

        return response()->json([
            'message' => 'Profile updated successfully',
            'patient' => $patient->fresh()->load('user'),
        ]);
    }



    public function doctors(Request $request)
    {
        $query = Doctor::query()
            ->with(['user', 'city', 'specialty'])
            ->withAvg('reviews', 'rating');

        if ($request->filled('name')) {
            $name = $request->name;

            $query->whereHas('user', function ($q) use ($name) {
                $q->where('first_name', 'ilike', "%{$name}%")
                    ->orWhere('last_name', 'ilike', "%{$name}%")
                    ->orWhere('username', 'ilike', "%{$name}%");
            });
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->filled('city')) {
            $city = $request->city;

            $query->whereHas('city', function ($q) use ($city) {
                $q->where('name', 'ilike', "%{$city}%");
            });
        }

        if ($request->filled('specialty_id')) {
            $query->where('specialty_id', $request->specialty_id);
        }

        if ($request->filled('specialty')) {
            $specialty = $request->specialty;

            $query->whereHas('specialty', function ($q) use ($specialty) {
                $q->where('name', 'ilike', "%{$specialty}%");
            });
        }

        return response()->json([
            'doctors' => $query->paginate(10),
        ]);
    }
    


    
}
