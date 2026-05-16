<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class cities extends Model
{
    //
    protected $fillable = [
        'name',
    ];



    public function doctors() : HasMany
    {
        return $this->hasMany(Doctor::class);
    }
}
