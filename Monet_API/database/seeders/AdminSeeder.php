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
                ['email' => 'admin@test.com'],
                [
                    'first_name' => 'Main',
                    'last_name' => 'Admin',
                    'username' => 'main_admin',
                    'password' => Hash::make(env('ADMIN_SEED_PASSWORD', 'password123')),
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
