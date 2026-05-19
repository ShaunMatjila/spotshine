<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Notifications\BookingStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->bookings()->with('service')->latest()->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $booking = $request->user()->bookings()->create($request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'notes' => ['nullable', 'string'],
        ]) + ['status' => 'pending']);
        $request->user()->notify(new BookingStatusNotification($booking->load('service'), 'Booking received and pending confirmation.'));

        return response()->json($booking->load('service'), 201);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 403);

        $booking->update($request->validate([
            'scheduled_at' => ['sometimes', 'date', 'after:now'],
            'status' => ['sometimes', 'in:pending,confirmed,cancelled'],
            'notes' => ['nullable', 'string'],
        ]));
        $request->user()->notify(new BookingStatusNotification($booking->fresh('service'), 'Booking updated.'));

        return response()->json($booking->fresh('service'));
    }

    public function destroy(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 403);
        $booking->update(['status' => 'cancelled']);
        $request->user()->notify(new BookingStatusNotification($booking->fresh('service'), 'Booking has been cancelled.'));

        return response()->json(['message' => 'Booking cancelled']);
    }
}
