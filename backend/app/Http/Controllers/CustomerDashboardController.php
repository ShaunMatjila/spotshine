<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class CustomerDashboardController extends Controller
{
    public function __invoke(): RedirectResponse|View
    {
        if (in_array(auth()->user()->role, ['super_admin', 'manager'], true)) {
            return redirect()->route('admin.dashboard');
        }

        return view('dashboard', [
            'bookings' => auth()->user()->bookings()->with('service')->latest()->get(),
        ]);
    }
}
