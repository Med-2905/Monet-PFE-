<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Override;

class Patient extends Model
{
    //


    protected $fillable = [
        'adress',
        'date_of_birth',
        'gender', 
        "emrgency_contact",
    ];


    protected $casts = [
        'date_of_birth' => 'date',
    ];






    public function user() : BelongsTo
    {
        return $this->belongsTo(User::class);
    }


    public function rdvs() : HasMany
    {
        return $this->hasMany(RDV::class);
    }


    public function ordonances() : HasMany
    {
        return $this->hasMany(Ordonnance::class);
    }



    public function reviews() : HasMany
    {
        return $this->hasMany(Reviews::class);
    }
}
