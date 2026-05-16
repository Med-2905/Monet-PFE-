<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;  

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $cities = [
            'Casablanca',
            'Rabat',
            'Marrakech',
            'Fès',
            'Tanger',
            'Agadir',
            'Meknès',
            'Oujda',
            'Salé',
            'Kénitra',
            'Tétouan',
            'Safi',
            'El Jadida',
            'Mohammedia',
            'Béni Mellal',
            'Nador',
            'Taza',
            'Khouribga',
            'Settat',
            'Larache',
            'Ksar El Kebir',
            'Khemisset',
            'Berrechid',
            'Inezgane',
            'Ait Melloul',
            'Guelmim',
            'Errachidia',
            'Ouarzazate',
            'Tiznit',
            'Taroudant',
            'Essaouira',
            'Al Hoceima',
            'Chefchaouen',
            'Berkane',
            'Taourirt',
            'Midelt',
            'Khenifra',
            'Fquih Ben Salah',
            'Dakhla',
            'Laayoune',];



            foreach ($cities as $city) {
            DB::table('cities')->updateOrInsert(
                ['name' => $city],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
