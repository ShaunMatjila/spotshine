<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeSlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'date' => ['required', 'date'],
        ]);

        $date = CarbonImmutable::parse(
            $request->string('date'),
            (string) config('app.timezone')
        )->startOfDay();
        $slots = collect(range(8, 17))
            ->map(fn (int $hour) => $date->setTime($hour, 0));

        $startOfWindowUtc = $date->startOfDay()->utc();
        $endOfWindowUtc = $date->endOfDay()->utc();

        $booked = Booking::query()
            ->where('service_id', $request->integer('service_id'))
            ->whereBetween('scheduled_at', [$startOfWindowUtc, $endOfWindowUtc])
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->pluck('scheduled_at')
            ->map(fn ($value) => CarbonImmutable::parse($value)->utc()->startOfMinute()->getTimestamp())
            ->all();

        return response()->json([
            'date' => $date->toDateString(),
            'slots' => $slots
                ->reject(fn (CarbonImmutable $slot) => in_array($slot->utc()->startOfMinute()->getTimestamp(), $booked, true))
                ->values()
                ->map(fn (CarbonImmutable $slot) => $slot->toIso8601String()),
        ]);
    }
}
