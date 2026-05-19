<x-app-layout>
    <x-slot name="header"><h2 class="font-semibold text-xl text-gray-800 leading-tight">Services</h2></x-slot>
    <div class="py-8">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
            <form method="POST" action="{{ route('admin.services.store') }}" class="rounded-xl bg-white p-5 shadow space-y-3">
                @csrf
                <h3 class="font-semibold text-slate-900">Add service</h3>
                <div class="grid gap-3 md:grid-cols-2">
                    <x-text-input name="name" placeholder="Service name" required />
                    <x-text-input name="price" type="number" step="0.01" min="0" placeholder="Price" required />
                    <x-text-input name="duration_minutes" type="number" min="15" placeholder="Duration (minutes)" required />
                    <select name="is_active" class="rounded-md border-gray-300" required>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
                <textarea name="description" rows="3" class="block w-full rounded-md border-gray-300" placeholder="Description" required></textarea>
                <x-primary-button>Create Service</x-primary-button>
            </form>

            <div class="rounded-xl bg-white p-5 shadow">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead><tr class="border-b"><th class="py-2">Service</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                        @foreach($services as $service)
                            <tr class="border-b align-top">
                                <td class="py-3 pe-4">
                                    <p class="font-semibold">{{ $service->name }}</p>
                                    <p class="text-xs text-gray-500">{{ $service->description }}</p>
                                </td>
                                <td>R{{ number_format((float) $service->price, 2) }}</td>
                                <td>{{ $service->duration_minutes }}m</td>
                                <td class="capitalize">{{ $service->is_active ? 'active' : 'inactive' }}</td>
                                <td>
                                    <form method="POST" action="{{ route('admin.services.update', $service) }}" class="mb-2 flex gap-2">
                                        @csrf
                                        @method('PUT')
                                        <input type="hidden" name="name" value="{{ $service->name }}" />
                                        <input type="hidden" name="description" value="{{ $service->description }}" />
                                        <input type="hidden" name="price" value="{{ $service->price }}" />
                                        <input type="hidden" name="duration_minutes" value="{{ $service->duration_minutes }}" />
                                        <input type="hidden" name="is_active" value="{{ $service->is_active ? 0 : 1 }}" />
                                        <button type="submit" class="text-xs text-sky-600">Toggle</button>
                                    </form>
                                    <form method="POST" action="{{ route('admin.services.destroy', $service) }}">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-xs text-red-600">Remove</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
