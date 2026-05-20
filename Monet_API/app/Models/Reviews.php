<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Rdv;
use App\Models\Ordonnance;
use Illuminate\Database\Eloquent\Relations\HasOne;
class Reviews extends Model
{
    //

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'rdv_id',
        'rating',
        'comment',
    ];




    public function doctor() : BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient() : BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function rdv() : BelongsTo
    {
        return $this->belongsTo(Rdv::class);
    }
    

    
}





