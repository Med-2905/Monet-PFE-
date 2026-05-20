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
use App\Models\doctor_unavailable_days;
use App\Models\Ordonnance;
use App\Models\RDV;
use App\Models\Reviews;
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



    public function reserve_RDV(Request $request, Doctor $doctor)
    {
        $patient = $this->currentPatient();


        $validated = $request->validate([
            'rdv_date' => ['required', 'date', 'after_or_equal:today'],
            'rdv_time' => ['required', 'date_format:H:i'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);


        $date = $validated['rdv_date'];
        $time = $validated['rdv_time'];

        $idUnavailable = doctor_unavailable_days::where('doctor_id', $doctor->id)
            ->wheredate('unavailable_date_start', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereDate('unavailable_date_end', '>=', $date)
                    ->orWhere(function ($q2) use ($date) {
                        $q2->whereNull('unavailable_date_end')
                            ->whereDate('unavailable_date_start', $date);
                    });
            })
            ->exists();



        if ($idUnavailable) {
            return response()->json([
                'message' => 'The doctor is unavailable on the selected date.',
            ], 422);
        }



        $alreadyReserved = RDV::where('doctor_id', $doctor->id)
            ->whereDate('rdv_date', $date)
            ->whereTime('rdv_time', $time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();



        if ($alreadyReserved) {
            return response()->json([
                'message' => 'The selected time slot is already reserved. Please choose a different time.',
            ], 422);
        }



        $rdv = RDV::create(
            [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'rdv_date' => $date,
                'rdv_time' => $time,
                'status' => 'pending',
                'reason' => $validated['reason'] ?? null,
            ]
        );


        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $rdv->load(['doctor.user', 'doctor.city', 'doctor.specialty']),
        ], 201);
    }




    public function Rdvs()
    {
        $patient = $this->currentPatient();

        $rdvs = RDV::where('patient_id', $patient->id)
            ->with(['doctor.user', 'doctor.city', 'doctor.specialty', 'review'])
            ->orderByDesc('rdv_date')
            ->orderByDesc('rdv_time')
            ->paginate(10);

        return response()->json([
            'appointments' => $rdvs,
        ]);
    }




    public function RdvStatus(RDV $rdv)
    {
        $patient = $this->currentPatient();

        if ($rdv->patient_id !== $patient->id) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        return response()->json([
            'appointment_id' => $rdv->id,
            'status' => $rdv->status,
            'reason' => $rdv->reason,
            'rdv_date' => $rdv->rdv_date,
            'rdv_time' => $rdv->rdv_time,
        ]);
    }


    public function cancelRdv(Request $request, RDV $rdv)
    {
        $patient = $this->currentPatient();

        if ($rdv->patient_id !== $patient->id) {
            return response()->json([
                'message' => 'forbidden',
            ], 403);
        }


        if (!in_array($rdv->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Only pending or confirmed appointments can be cancelled.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);


        $rdv->update([
            'status' => 'cancelled',
            'reason' => $validated['reason'] ?? 'Cancelled by patient',
        ]);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'appointment' => $rdv->fresh(),
        ]);
    }


    public function RdvHistory()
    {
        $patient = $this->currentPatient();

        $history = RDV::where('patient_id', $patient->id)
            ->where(function ($q) {
                $q->whereIn('status', ['completed', 'cancelled', 'no_show'])
                    ->orWhereDate('rdv_date', '<', now()->toDateString());
            })
            ->with(['doctor.user', 'doctor.city', 'doctor.specialty', 'review'])
            ->orderByDesc('rdv_date')
            ->orderByDesc('rdv_time')
            ->paginate(10);

        return response()->json([
            'history' => $history,
        ]);
    }


    public function Ordonnances()
    {
        $patient = $this->currentPatient();
        $ordonnances = Ordonnance::where('patient_id', $patient->id)
            ->with([
                'rdv',
                'doctor.user',
                'doctor.specialty',
                'doctor.city',
            ])
            ->orderByDesc('created_at')
            ->paginate(10);



            return response()->json([
            'Ordonnances' => $ordonnances,
        ]);
    }

    public function addReview(Request $request, RDV $rdv)
    {
        $patient = $this->currentPatient();

        if ($rdv->patient_id !== $patient->id) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        if ($rdv->status !== 'completed') {
            return response()->json([
                'message' => 'You can only review completed appointments',
            ], 422);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $alreadyReviewed = Reviews::where('rdv_id', $rdv->id)->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'You already reviewed this appointment',
            ], 422);
        }

        $review = Reviews::create([
            'patient_id' => $patient->id,
            'doctor_id' => $rdv->doctor_id,
            'rdv_id' => $rdv->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Review added successfully',
            'review' => $review,
        ], 201);
    }
}
