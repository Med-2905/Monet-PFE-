<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $specialties = [
            'Médecine générale',
            'Cardiologie',
            'Dermatologie',
            'Pédiatrie',
            'Gynécologie',
            'Dentisterie',
            'Ophtalmologie',
            'Orthopédie',
            'Neurologie',
            'Psychiatrie',
            'ORL',
            'Urologie',
            'Gastro-entérologie',
            'Endocrinologie',
            'Rhumatologie',
            'Pneumologie',
            'Néphrologie',
            'Oncologie',
            'Radiologie',
            'Chirurgie générale',
            'Chirurgie plastique',
            'Anesthésie-réanimation',
            'Allergologie',
            'Nutrition',
            'Kinésithérapie',
        ];

        foreach ($specialties as $specialty) {
            DB::table('specialties')->updateOrInsert(
                ['name' => $specialty],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
