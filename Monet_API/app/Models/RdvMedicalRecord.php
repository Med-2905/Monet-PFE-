<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\RDV;
use App\Models\Patient;
use App\Models\Doctor;
class RdvMedicalRecord extends Model
{
    //
    protected $fillable = [
        'rdv_id',
        'patient_id',
        'doctor_id',
        'condition',
        'symptoms',
        'diagnosis',
        'treatment_plan',
        'doctor_notes',
    ];

    public function rdv()
    {
        return $this->belongsTo(RDV::class, 'rdv_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
