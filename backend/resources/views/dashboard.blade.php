<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
    </x-slot>

    <div class="py-8">
        @if(in_array(auth()->user()->role, ['super_admin', 'manager'], true))
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-xl bg-white p-4 shadow">
                        <p class="text-sm text-gray-500">Total bookings</p>
                        <p class="text-3xl font-bold text-slate-900">{{ $metrics['total_bookings'] }}</p>
                    </div>
                    <div class="rounded-xl bg-white p-4 shadow">
                        <p class="text-sm text-gray-500">Revenue</p>
                        <p class="text-3xl font-bold text-slate-900">R{{ number_format((float) $metrics['total_revenue'], 2) }}</p>
                    </div>
                    <div class="rounded-xl bg-white p-4 shadow">
                        <p class="text-sm text-gray-500">Active customers</p>
                        <p class="text-3xl font-bold text-slate-900">{{ $metrics['active_users'] }}</p>
                    </div>
                    <div class="rounded-xl bg-white p-4 shadow">
                        <p class="text-sm text-gray-500">Services</p>
                        <p class="text-3xl font-bold text-slate-900">{{ $metrics['service_count'] }}</p>
                    </div>
                </div>

                <div class="grid gap-5 lg:grid-cols-2">
                    <div class="rounded-xl bg-white p-4 shadow">
                        <h3 class="font-semibold text-slate-900">Bookings over time</h3>
                        <ul class="mt-3 space-y-2 text-sm text-slate-700">
                            @forelse($bookingsOverTime as $item)
                                <li class="flex justify-between border-b pb-1"><span>{{ $item->booking_date }}</span><strong>{{ $item->total }}</strong></li>
                            @empty
                                <li>No booking data yet.</li>
                            @endforelse
                        </ul>
                    </div>
                    <div class="rounded-xl bg-white p-4 shadow">
                        <h3 class="font-semibold text-slate-900">Revenue trends</h3>
                        <ul class="mt-3 space-y-2 text-sm text-slate-700">
                            @forelse($revenueByService as $item)
                                <li class="flex justify-between border-b pb-1"><span>{{ $item->name }}</span><strong>R{{ number_format((float) $item->revenue, 2) }}</strong></li>
                            @empty
                                <li>No revenue data yet.</li>
                            @endforelse
                        </ul>
                    </div>
                </div>
            </div>
        @else
            <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div class="rounded-xl bg-white p-6 shadow">
                    <h3 class="text-lg font-semibold text-slate-900">Your booking history</h3>
                    <div class="mt-4 overflow-x-auto">
                        <table class="min-w-full text-left text-sm">
                            <thead>
                                <tr class="border-b">
                                    <th class="py-2 pe-4">Service</th>
                                    <th class="py-2 pe-4">Scheduled</th>
                                    <th class="py-2 pe-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($bookings as $booking)
                                    <tr class="border-b">
                                        <td class="py-2 pe-4">{{ $booking->service?->name }}</td>
                                        <td class="py-2 pe-4">{{ $booking->scheduled_at?->format('Y-m-d H:i') }}</td>
                                        <td class="py-2 pe-4 capitalize">{{ $booking->status }}</td>
                                    </tr>
                                @empty
                                    <tr><td class="py-3 text-gray-500" colspan="3">No bookings yet.</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endif
    </div>
</x-app-layout>
