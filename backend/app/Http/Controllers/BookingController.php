<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Notifications\BookingStatusNotification;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class BookingController extends Controller
{
    public function index(): View
    {
        return view('admin.bookings.index', [
            'bookings' => Booking::with(['user', 'service'])->latest()->paginate(12),
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('admin.bookings.index');
    }

    public function store(Request $request): RedirectResponse
    {
        Booking::create($request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'service_id' => ['required', 'exists:services,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'status' => ['required', 'in:pending,confirmed,cancelled,completed'],
            'notes' => ['nullable', 'string'],
        ]));

        return redirect()->route('admin.bookings.index')->with('status', 'Booking created.');
    }

    public function show(Booking $booking): RedirectResponse
    {
        return redirect()->route('admin.bookings.index');
    }

    public function edit(Booking $booking): RedirectResponse
    {
        return redirect()->route('admin.bookings.index');
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $booking->update($request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'scheduled_at' => ['required', 'date'],
            'status' => ['required', 'in:pending,confirmed,cancelled,completed'],
            'notes' => ['nullable', 'string'],
        ]));
        $booking->user?->notify(new BookingStatusNotification($booking->fresh('service'), 'Your booking was updated by the team.'));

        return redirect()->route('admin.bookings.index')->with('status', 'Booking updated.');
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'cancelled']);
        $booking->user?->notify(new BookingStatusNotification($booking->fresh('service'), 'Your booking was cancelled by the team.'));

        return redirect()->route('admin.bookings.index')->with('status', 'Booking cancelled.');
    }
}
