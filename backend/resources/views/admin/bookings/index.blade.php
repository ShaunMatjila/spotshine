<x-app-layout>
    <x-slot name="header"><h2 class="font-semibold text-xl text-gray-800 leading-tight">Bookings</h2></x-slot>
    <div class="py-8">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
            <div class="rounded-xl bg-white p-5 shadow">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead><tr class="border-b"><th class="py-2">Customer</th><th>Service</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                        @foreach($bookings as $booking)
                            <tr class="border-b">
                                <td class="py-2">{{ $booking->user?->name }}<br><span class="text-xs text-gray-500">{{ $booking->user?->email }}</span></td>
                                <td>{{ $booking->service?->name }}</td>
                                <td>{{ $booking->scheduled_at?->format('Y-m-d H:i') }}</td>
                                <td class="capitalize">{{ $booking->status }}</td>
                                <td class="space-x-2">
                                    <form method="POST" action="{{ route('admin.bookings.update', $booking) }}" class="inline">
                                        @csrf
                                        @method('PUT')
                                        <input type="hidden" name="service_id" value="{{ $booking->service_id }}" />
                                        <input type="hidden" name="scheduled_at" value="{{ $booking->scheduled_at }}" />
                                        <input type="hidden" name="notes" value="{{ $booking->notes }}" />
                                        <input type="hidden" name="status" value="confirmed" />
                                        <button type="submit" class="text-xs text-sky-600">Confirm</button>
                                    </form>
                                    <form method="POST" action="{{ route('admin.bookings.destroy', $booking) }}" class="inline">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-xs text-red-600">Cancel</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="mt-4">
                    {{ $bookings->links() }}
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
