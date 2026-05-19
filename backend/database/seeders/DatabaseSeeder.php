<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@spotshine.test',
            'role' => 'super_admin',
            'phone_number' => '+27110000000',
        ]);

        User::factory()->create([
            'name' => 'Test Customer',
            'email' => 'customer@spotshine.test',
            'role' => 'customer',
            'phone_number' => '+27110000001',
        ]);

        Service::insert([
            [
                'name' => 'Express Wash',
                'description' => 'Exterior wash, dry, and tire shine.',
                'price' => 150,
                'duration_minutes' => 45,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Deluxe Detail',
                'description' => 'Full interior detailing and exterior polish.',
                'price' => 420,
                'duration_minutes' => 120,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ceramic Protection',
                'description' => 'Premium ceramic coating for long-term protection.',
                'price' => 1450,
                'duration_minutes' => 240,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
