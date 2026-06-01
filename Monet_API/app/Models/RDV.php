<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Reviews;
use Illuminate\Database\Eloquent\Relations\HasOne;

use App\Models\Rdv;
use App\Models\Ordonnance;
use App\Models\RdvMedicalRecord;

class RDV extends Model
{
    //

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'rdv_date',
        'rdv_time',
        'status',
        'reason',
    ];

    protected $casts = [
        'rdv_date' => 'date',
        'rdv_time' => 'string',

    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
    public function review(): HasOne
    {
        return $this->hasOne(Reviews::class, 'rdv_id');
    }


    public function ordonnance(): HasOne
    {
        return $this->hasOne(Ordonnance::class, 'rdv_id');
    }

    public function medicalRecord() : hasOne
    {
        return $this->hasOne(RdvMedicalRecord::class, 'rdv_id');
    }
}
