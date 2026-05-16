<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RDV extends Model
{
    //

    protected $fillable = [
        
        'doctor_id',
        'rdv_date',
        'rdv_time',
        
        'reason',
    ];

    protected $casts = [
        'rdv_date' => 'date',
        'rdv_time' => 'string',
       
    ];

    // Relationships
    public function patient() : BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor() : BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
