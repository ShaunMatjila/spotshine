<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_customer_can_create_booking(): void
    {
        $user = User::factory()->create();
        $service = Service::create([
            'name' => 'Express Wash',
            'description' => 'Quick clean',
            'price' => 100,
            'duration_minutes' => 45,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/bookings', [
            'service_id' => $service->id,
            'scheduled_at' => now()->addDay()->toIso8601String(),
            'notes' => 'Please focus on wheels.',
        ]);

        $response->assertCreated()->assertJsonPath('service.id', $service->id);
        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'pending',
        ]);
    }

    public function test_customer_cannot_update_another_users_booking(): void
    {
        $service = Service::create([
            'name' => 'Express Wash',
            'description' => 'Quick clean',
            'price' => 100,
            'duration_minutes' => 45,
            'is_active' => true,
        ]);

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $booking = Booking::create([
            'user_id' => $owner->id,
            'service_id' => $service->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'pending',
        ]);

        Sanctum::actingAs($otherUser);

        $this->patchJson("/api/bookings/{$booking->id}", [
            'status' => 'confirmed',
        ])->assertForbidden();
    }

    public function test_admin_routes_are_protected_by_role_middleware(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }
}
