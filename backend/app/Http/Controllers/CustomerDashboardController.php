<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class CustomerDashboardController extends Controller
{
    public function __invoke(): RedirectResponse|View
    {
        $user = auth()->user();

        if (in_array($user->role, ['super_admin', 'manager'], true)) {
            return redirect()->route('admin.dashboard');
        }

        return view('dashboard', [
            'bookings' => $user->bookings()->with('service')->latest()->get(),
        ]);
    }
}
