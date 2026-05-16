<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ordonnance extends Model
{
    //
    protected $fillable = [
        'rdv_id',
        'diagnosis',
        'medications',
        'notes',
    ];



    public function rdv() : BelongsTo
    {
        return $this->belongsTo(Rdv::class);
    }



    public function  patient() : BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }


    public function doctor() : BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    
}
