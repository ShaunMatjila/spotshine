<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $bookingsOverTime = Booking::query()
            ->selectRaw('date(scheduled_at) as booking_date, count(*) as total')
            ->groupBy('booking_date')
            ->orderBy('booking_date')
            ->limit(14)
            ->get();

        $revenueByService = Booking::query()
            ->join('services', 'services.id', '=', 'bookings.service_id')
            ->select('services.name', DB::raw('sum(services.price) as revenue'))
            ->where('bookings.status', 'confirmed')
            ->groupBy('services.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return view('dashboard', [
            'metrics' => [
                'total_bookings' => Booking::count(),
                'confirmed_bookings' => Booking::where('status', 'confirmed')->count(),
                'active_users' => User::where('role', 'customer')->count(),
                'total_revenue' => Booking::join('services', 'services.id', '=', 'bookings.service_id')
                    ->where('bookings.status', 'confirmed')
                    ->sum('services.price'),
                'service_count' => Service::count(),
            ],
            'bookingsOverTime' => $bookingsOverTime,
            'revenueByService' => $revenueByService,
            'recentBookings' => Booking::with(['user', 'service'])->latest()->limit(8)->get(),
        ]);
    }
}
