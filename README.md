# SpotShine

Monorepo with:

- `backend/` Laravel 12 + Breeze + Tailwind CSS 3 admin/dashboard and REST API
- `mobile/` Expo app with splash, auth, booking flow, booking history, and notifications UI

## Backend quick start

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run build
php artisan serve
```

### Demo users

- Super admin: `admin@spotshine.test` / `password`
- Customer: `customer@spotshine.test` / `password`

## Mobile quick start

```bash
cd mobile
npm install
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api npm run web
```

For social login buttons, configure provider credentials for Google/Facebook in your Expo environment.
