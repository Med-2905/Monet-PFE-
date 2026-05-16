<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reviews extends Model
{
    //

    protected $fillable = [
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





