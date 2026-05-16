<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\User;
use App\Models\RDV;
use App\Models\Ordonnance;
use App\Models\Reviews;
class Doctor extends Model
{
    protected $fillable = [
        'user_id',
        'city_id',
        'specialty_id',
        'address',
        'license_number',
        'bio',
        
    ];
    
    
    public function user() : BelongsTo 
    {
        return $this->belongsTo(User::class);
    }
    
    public function city() : BelongsTo 
    {
        return $this->belongsTo(cities::class);
    }
    
    
    public function specialty() : BelongsTo 
    {
        return $this->belongsTo(specialties::class);
    }
    
    
    
    
    public function appointments() : HasMany
    {
        return $this->hasMany(RDV::class);
    }
    
    public function unavailableSlots() : HasMany
    {
        return $this->hasMany(doctor_unavailable_days::class);
    }
    
    
    public function ordonnances() : HasMany
    {
        return $this->hasMany(Ordonnance::class);
    }

    public function reviews() : HasMany
    {
        return $this->hasMany(Reviews::class);
    }

}
