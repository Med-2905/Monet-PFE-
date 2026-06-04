<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Doctor;
use App\Models\doctor_unavailable_days;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\RDV;
use App\Models\Ordonnance;
use App\Models\Reviews;

use App\Models\RdvMedicalRecord;

use App\Models\Cities;
use App\Models\Specialties;
use App\Models\Patient;
class DoctorController extends Controller
{
    //


    public function currentDoctor(): Doctor
    {
        $user = auth('api')->user();

        if (! $user) {
            abort(response()->json([
                'message' => 'Unauthenticated',
            ], 401));
        }

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (! $doctor) {
            abort(response()->json([
                'message' => 'Doctor profile not found',
            ], 404));
        }

        return $doctor;
    }


    public function me()
    {
        $doctor = $this->currentDoctor();

        return response()->json([
            'doctor' => $doctor->load([
                'user:id,first_name,last_name,username,email,phone,role',
                'city:id,name',
                'specialty:id,name',
            ]),
        ]);
    }




    public function cities(Request $request)
{
    $query = Cities::query()
        ->select('id', 'name')
        ->orderBy('name' , 'asc');

    if ($request->filled('search')) {
        $search = $request->search;

        $query->where('name', 'ilike', "%{$search}%");
    }

    return response()->json([
        'cities' => $query->get(),
    ]);
}

public function specialties(Request $request)
{
    $query = Specialties::query()
        ->select('id', 'name')
        ->orderBy('name' , 'asc');

    if ($request->filled('search')) {
        $search = $request->search;

        $query->where('name', 'ilike', "%{$search}%");
    }

    return response()->json([
        'specialties' => $query->get(),
    ]);
}


    public function updateProfile(Request $request)
    {
        $doctor = $this->currentDoctor();
        $user = $doctor->user;

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


            'phone' => ['sometimes','nullable', 'string', 'max:255'],
            'city_id' => ['sometimes', 'exists:cities,id'],
            'specialty_id' => ['sometimes', 'exists:specialties,id'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'license_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string'],
        ]);



        DB::transaction(function () use ($validated, $doctor, $user) {
            $userFields = collect($validated)->only([
                'first_name',
                'last_name',
                'username',
                'email',
                'phone',
            ])->toArray();

            $doctorFields = collect($validated)->only([
                'city_id',
                'specialty_id',
                'address',
                'license_number',
                'bio',
            ])->toArray();

            if (! empty($userFields)) {
                $user->update($userFields);
            }

            if (! empty($doctorFields)) {
                $doctor->update($doctorFields);
            }
        });

        return response()->json([
            'message' => 'Doctor profile updated successfully',
            'doctor' => $doctor->fresh()->load([
                'user:id,first_name,last_name,username,email,phone,role',
                'city:id,name',
                'specialty:id,name',
            ]),
        ]);
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



    public function RDVS(Request $request)
    {
        $doctor = $this->currentDoctor();

        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])],
            'date' => ['sometimes', 'date'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $RDVS = RDV::query()
            ->where('doctor_id', $doctor->id)
            ->with(['patient.user:id,first_name,last_name,email,phone',])
            ->when(isset($validated['status']), function ($query) use ($validated) {
                $query->where('status', $validated['status']);
            })
            ->when(isset($validated['date']), function ($query) use ($validated) {
                $query->whereDate('rdv_date', $validated['date']);
            })->orderBy('rdv_date', 'desc')
            ->orderBy('rdv_time', 'desc')
            ->paginate($validated['per_page'] ?? 15);




        return response()->json($RDVS);
    }





    public function confirmRDV(RDV $rdv)
    {
        $doctor = $this->currentDoctor();
        if ($rdv->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'Unauthorized to confirm this RDV , this RDv does not belong to you ',
            ], 403);
        }


        if ($rdv->status !== 'pending') {
            return response()->json([
                'message' => 'only pending RDV can be confirmed',
            ], 422);
        }

        /*
        $rdv->status = 'confirmed';
        $rdv->save();
        */

        $rdv->update(['status' => 'confirmed']);


        return response()->json([
            'message' => 'RDv confirmes successfully',
            'RDVS' => $rdv->fresh(),
        ]);
    }



    public function cancelRDV(Request $request, RDV $rdv)
    {
        $doctor = $this->currentDoctor();
        if ($rdv->doctor_id !== $doctor->id) {
            response()->json([
                'message' => 'Unauthorized to cancel this RDV , this RDv does not belong to you ',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        if ($rdv->status !== 'confirmed') {
            response()->json([
                'message' => ' only confirmed RDV can be canclled ',
            ], 422);
        }



        $rdv->update([
            'status' => 'cancelled',
            'reason' => $validated['reason'] ?? 'contact the doctor for information'
        ]);

        return response()->json([
            'message' =>  'RDV cancelled successfully',
            'RDVS' => $rdv->fresh(),
        ]);
    }



    public function completRDV(RDV $rdv)
    {
        $doctor = $this->currentDoctor();


        if ($rdv->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'This appointment does not belong to you',
            ], 403);
        }

        if (! in_array($rdv->status, ['confirmed'], true)) {
            return response()->json([
                'message' => 'Only confirmed RDv can be completed',
            ], 422);
        }

        $rdv->update([
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'RDV completed successfully',
            'appointment' => $rdv->fresh(),
        ]);
    }



    public function RDV_NoShow(Request $request,  RDV $rdv)
    {
        $doctor = $this->currentDoctor();



        if ($rdv->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'This appointment does not belong to you',
            ], 403);
        }

        if (! in_array($rdv->status, ['pending', 'confirmed'], true)) {
            return response()->json([
                'message' => 'Only pending or confirmed appointments can be marked as no_show',
            ], 422);
        }

        $rdv->update([
            'status' => 'no_show',
            'reason' => $validated['reason'] ?? 'Patient did not show up',
        ]);

        return response()->json([
            'message' => 'Appointment marked as no_show successfully',
            'appointment' => $rdv->fresh(),
        ]);
    }


    public function unavalaibleDays()
    {
        $doctor = $this->currentDoctor();


        $days = doctor_unavailable_days::where('doctor_id', $doctor->id)
            ->orderBy('unavailable_date_start', 'desc')
            ->get();


        return response()->json([
            'unavailable_days' => $days,
        ]);
    }

    public function addUnavailableDay(Request $request)
    {
        $doctor = $this->currentDoctor();

        $validated = $request->validate([
            'unavailable_date_start' => ['required', 'date'],
            'unavailable_date_end' => ['nullable', 'date', 'after_or_equal:unavailable_date_start'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $start = $validated['unavailable_date_start'];
        $end = $validated['unavailable_date_end'] ?? $start;

        $overlap = doctor_unavailable_days::where('doctor_id', $doctor->id)
            ->whereDate('unavailable_date_start', '<=', $end)
            ->whereRaw('COALESCE(unavailable_date_end, unavailable_date_start) >= ?', [$start])
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'This unavailable period overlaps with an existing one',
            ], 422);
        }

        $day = doctor_unavailable_days::create([
            'doctor_id' => $doctor->id,
            'unavailable_date_start' => $validated['unavailable_date_start'],
            'unavailable_date_end' => $validated['unavailable_date_end'] ?? null,
            'reason' => $validated['reason'] ?? 'Unknown',
        ]);

        return response()->json([
            'message' => 'Unavailable day added successfully',
            'unavailable_day' => $day,
        ], 201);
    }

    public function deleteUnavailableDay(doctor_unavailable_days $day)
    {
        $doctor = $this->currentDoctor();

        if ($day->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'This unavailable day does not belong to you',
            ], 403);
        }

        $day->delete();

        return response()->json([
            'message' => 'Unavailable day deleted successfully',
        ]);
    }

    public function createOrdonnance(Request $request, RDV $rdv)
    {
        $doctor = $this->currentDoctor();

        if ($rdv->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'This appointment does not belong to you',
            ], 403);
        }

        if (! in_array($rdv->status, ['confirmed', 'completed'], true)) {
            return response()->json([
                'message' => 'You can create an ordonnance only for confirmed or completed appointments',
            ], 422);
        }

        $alreadyExists = Ordonnance::where('rdv_id', $rdv->id)->exists();

        if ($alreadyExists) {
            return response()->json([
                'message' => 'An ordonnance already exists for this appointment',
            ], 409);
        }

        $validated = $request->validate([
            'diagnosis' => ['required', 'string'],
            'medications' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $ordonnance = DB::transaction(function () use ($validated, $rdv, $doctor) {
            $ordonnance = Ordonnance::create([
                'rdv_id' => $rdv->id,
                'patient_id' => $rdv->patient_id,
                'doctor_id' => $doctor->id,
                'diagnosis' => $validated['diagnosis'],
                'medications' => $validated['medications'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            if ($rdv->status !== 'completed') {
                $rdv->update([
                    'status' => 'completed',
                ]);
            }

            return $ordonnance;
        });

        return response()->json([
            'message' => 'Ordonnance created successfully',
            'ordonnance' => $ordonnance->load([
                'patient.user:id,first_name,last_name,email,phone',
                'doctor.user:id,first_name,last_name,email,phone',
                'rdv',
            ]),
        ], 201);
    }

    public function patients(Request $request)
{
    $doctor = $this->currentDoctor();

    $patientIds = RDV::where('doctor_id', $doctor->id)
        ->select('patient_id')
        ->distinct();

    $query = Patient::query()
        ->whereIn('id', $patientIds)
        ->with('user:id,first_name,last_name,email,phone')
        ->orderByDesc('created_at');

    if ($request->filled('search')) {
        $search = $request->search;

        $query->whereHas('user', function ($q) use ($search) {
            $q->where('first_name', 'ilike', "%{$search}%")
                ->orWhere('last_name', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%")
                ->orWhere('phone', 'ilike', "%{$search}%");
        });
    }

    return response()->json([
        'patients' => $query->paginate(10),
    ]);
}

    public function ordonnances(Request $request)
    {
        $doctor = $this->currentDoctor();

        $validated = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $ordonnances = Ordonnance::where('doctor_id', $doctor->id)
            ->with([
                'patient.user:id,first_name,last_name,email,phone',
                'rdv',
            ])
            ->latest()
            ->paginate($validated['per_page'] ?? 10);

        return response()->json($ordonnances);
    }

    public function reviews(Request $request)
    {
        $doctor = $this->currentDoctor();

        $validated = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $reviews = Reviews::where('doctor_id', $doctor->id)
            ->with([
                'patient.user:id,first_name,last_name,email,phone',
            ])
            ->latest()
            ->paginate($validated['per_page'] ?? 10);

        return response()->json($reviews);
    }

    public function createMedicalRecord(Request $request, RDV $rdv)
    {
        $doctor = $this->currentDoctor();

        if ($rdv->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'This RDV does not belong to you',
            ], 403);
        }

        if (! in_array($rdv->status, ['confirmed', 'completed'], true)) {
            return response()->json([
                'message' => 'You can create a medical record only for confirmed or completed RDV',
            ], 422);
        }

        $exists = RdvMedicalRecord::where('rdv_id', $rdv->id)->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Medical record already exists for this RDV',
            ], 409);
        }

        $validated = $request->validate([
            'condition' => ['nullable', 'string'],
            'symptoms' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
            'doctor_notes' => ['nullable', 'string'],
        ]);

        $record = RdvMedicalRecord::create([
            'rdv_id' => $rdv->id,
            'patient_id' => $rdv->patient_id,
            'doctor_id' => $doctor->id,
            'condition' => $validated['condition'] ?? null,
            'symptoms' => $validated['symptoms'] ?? null,
            'diagnosis' => $validated['diagnosis'] ?? null,
            'treatment_plan' => $validated['treatment_plan'] ?? null,
            'doctor_notes' => $validated['doctor_notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Medical record created successfully',
            'medical_record' => $record,
        ], 201);
    }





    public function updateMedicalRecord(Request $request, RdvMedicalRecord $record)
    {
        $doctor = $this->currentDoctor();

        if ($record->doctor_id !== $doctor->id) {
            return response()->json([
                'message' => 'This medical record does not belong to you',
            ], 403);
        }

        $validated = $request->validate([
            'condition' => ['sometimes', 'nullable', 'string'],
            'symptoms' => ['sometimes', 'nullable', 'string'],
            'diagnosis' => ['sometimes', 'nullable', 'string'],
            'treatment_plan' => ['sometimes', 'nullable', 'string'],
            'doctor_notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $record->update($validated);

        return response()->json([
            'message' => 'Medical record updated successfully',
            'medical_record' => $record->fresh(),
        ]);
    }


    public function patientMedicalHistory($patientId)
    {
        $doctor = $this->currentDoctor();

        $hasRdvWithPatient = RDV::where('doctor_id', $doctor->id)
            ->where('patient_id', $patientId)
            ->exists();

        if (! $hasRdvWithPatient) {
            return response()->json([
                'message' => 'You do not have access to this patient history',
            ], 403);
        }

        $history = RDV::where('doctor_id', $doctor->id)
            ->where('patient_id', $patientId)
            ->with([
                'patient.user:id,first_name,last_name,email,phone',
                'medicalRecord',
                'ordonnance',
            ])
            ->orderBy('rdv_date', 'desc')
            ->orderBy('rdv_time', 'desc')
            ->get();

        return response()->json([
            'patient_id' => $patientId,
            'history' => $history,
        ]);
    }

    public function dashboard()
    {
        $doctor = $this->currentDoctor();

        return response()->json([
            'appointments' => [
                'total' => RDV::where('doctor_id', $doctor->id)->count(),
                'pending' => RDV::where('doctor_id', $doctor->id)->where('status', 'pending')->count(),
                'confirmed' => RDV::where('doctor_id', $doctor->id)->where('status', 'confirmed')->count(),
                'completed' => RDV::where('doctor_id', $doctor->id)->where('status', 'completed')->count(),
                'cancelled' => RDV::where('doctor_id', $doctor->id)->where('status', 'cancelled')->count(),
                'no_show' => RDV::where('doctor_id', $doctor->id)->where('status', 'no_show')->count(),
            ],
            'reviews' => [
                'total' => Reviews::where('doctor_id', $doctor->id)->count(),
                'average_rating' => round((float) Reviews::where('doctor_id', $doctor->id)->avg('rating'), 2),
            ],
            'ordonnances' => [
                'total' => Ordonnance::where('doctor_id', $doctor->id)->count(),
            ],
        ]);
    }
}
