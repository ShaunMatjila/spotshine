<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SpotShine | Premium Car Detailing</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-slate-950 text-slate-100">
    <main class="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <section class="rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-500 p-8 shadow-xl lg:p-12">
            <p class="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-widest">SpotShine</p>
            <h1 class="text-3xl font-bold lg:text-5xl">Bolt-fast booking for premium car wash & detailing.</h1>
            <p class="mt-4 max-w-3xl text-sky-50">Book in a few taps using our Expo mobile app, or sign in to the dashboard to manage operations, services, and bookings.</p>
            <div class="mt-6 flex flex-wrap gap-3">
                @auth
                    <a href="{{ route('dashboard') }}" class="rounded-lg bg-white px-5 py-3 font-semibold text-sky-700">Open Dashboard</a>
                @else
                    <a href="{{ route('register') }}" class="rounded-lg bg-white px-5 py-3 font-semibold text-sky-700">Get Started</a>
                    <a href="{{ route('login') }}" class="rounded-lg border border-white px-5 py-3 font-semibold text-white">Log in</a>
                @endauth
            </div>
        </section>

        <section class="mt-12">
            <h2 class="text-2xl font-semibold">Services & pricing</h2>
            <div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                @forelse($services as $service)
                    <article class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <h3 class="text-lg font-semibold text-sky-300">{{ $service->name }}</h3>
                        <p class="mt-2 text-sm text-slate-300">{{ $service->description }}</p>
                        <p class="mt-3 text-lg font-bold">R{{ number_format((float) $service->price, 2) }}</p>
                        <p class="text-sm text-slate-400">{{ $service->duration_minutes }} min</p>
                    </article>
                @empty
                    <p class="text-slate-400">No active services yet.</p>
                @endforelse
            </div>
        </section>

        <section class="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
                <h2 class="text-2xl font-semibold">Contact</h2>
                <p class="mt-2 text-slate-300">📞 +27 11 000 0000<br>✉️ hello@spotshine.app</p>
            </div>
            <form method="POST" action="{{ route('contact.store') }}" class="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                @csrf
                <div>
                    <x-input-label for="name" value="Name" />
                    <x-text-input id="name" name="name" class="mt-1 block w-full" required />
                </div>
                <div>
                    <x-input-label for="email" value="Email" />
                    <x-text-input id="email" type="email" name="email" class="mt-1 block w-full" required />
                </div>
                <div>
                    <x-input-label for="message" value="Message" />
                    <textarea id="message" name="message" rows="4" class="mt-1 block w-full rounded-md border-slate-700 bg-slate-800 text-slate-100" required></textarea>
                </div>
                <x-primary-button>Send message</x-primary-button>
                @if (session('status'))
                    <p class="text-sm text-emerald-400">{{ session('status') }}</p>
                @endif
            </form>
        </section>
    </main>
</body>
</html>
