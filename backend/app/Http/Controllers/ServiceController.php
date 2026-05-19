<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class ServiceController extends Controller
{
    public function index(): View
    {
        return view('admin.services.index', [
            'services' => Service::query()->latest()->paginate(10),
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('admin.services.index');
    }

    public function store(Request $request): RedirectResponse
    {
        Service::create($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:15'],
            'is_active' => ['required', 'boolean'],
        ]));

        return redirect()->route('admin.services.index')->with('status', 'Service created.');
    }

    public function show(Service $service): RedirectResponse
    {
        return redirect()->route('admin.services.index');
    }

    public function edit(Service $service): RedirectResponse
    {
        return redirect()->route('admin.services.index');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $service->update($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:15'],
            'is_active' => ['required', 'boolean'],
        ]));

        return redirect()->route('admin.services.index')->with('status', 'Service updated.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return redirect()->route('admin.services.index')->with('status', 'Service deleted.');
    }

    public function toggle(Service $service): RedirectResponse
    {
        $service->update([
            'is_active' => ! $service->is_active,
        ]);

        return redirect()->route('admin.services.index')->with('status', 'Service status updated.');
    }
}
