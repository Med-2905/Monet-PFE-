<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Admin;
use App\UserRole;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::transaction(function () {
            $user = User::updateOrCreate(
                ['email' => 'medamine@gmail.com'],
                [
                    'first_name' => 'amine',
                    'last_name' => 'jaoui',
                    'username' => 'admin_med',
                    'password' => Hash::make(env('ADMIN_SEED_PASSWORD', 'amine&&2005')),
                    'phone' => '0600000000',
                    'role' => UserRole::ADMIN->value,
                ]
            );

            Admin::updateOrCreate(
                ['user_id' => $user->id],
                []
            );
        });
    }
}
