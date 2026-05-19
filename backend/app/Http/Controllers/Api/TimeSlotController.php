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

        $date = CarbonImmutable::parse($request->string('date'))->startOfDay();
        $slots = collect(range(8, 17))
            ->map(fn (int $hour) => $date->setTime($hour, 0)->toIso8601String());

        $booked = Booking::query()
            ->where('service_id', $request->integer('service_id'))
            ->whereDate('scheduled_at', $date)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->pluck('scheduled_at')
            ->map(fn ($value) => CarbonImmutable::parse($value)->setSeconds(0)->toIso8601String())
            ->all();

        return response()->json([
            'date' => $date->toDateString(),
            'slots' => $slots->reject(fn ($slot) => in_array($slot, $booked, true))->values(),
        ]);
    }
}
