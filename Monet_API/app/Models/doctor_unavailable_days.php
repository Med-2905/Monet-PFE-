<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class doctor_unavailable_days extends Model
{
    //

    protected $fillable = [
        'unavailable_date_start',
        'unavailable_date_end',
        'reason',
    ];


    public function doctor() : BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
