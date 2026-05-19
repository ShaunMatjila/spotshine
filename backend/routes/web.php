<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServiceController;
use App\Models\Service;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/', function () {
    return view('welcome', [
        'services' => Schema::hasTable('services')
            ? Service::where('is_active', true)->orderBy('price')->get()
            : collect(),
    ]);
})->name('landing');

Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/dashboard', function () {
    if (in_array(auth()->user()->role, ['super_admin', 'manager'], true)) {
        return redirect()->route('admin.dashboard');
    }

    return view('dashboard', [
        'bookings' => auth()->user()->bookings()->with('service')->latest()->get(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role:super_admin,manager'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::resource('services', ServiceController::class);
    Route::resource('bookings', BookingController::class);
});

require __DIR__.'/auth.php';
