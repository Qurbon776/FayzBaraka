# FAYZ BARAKA

Premium Telegram Mini App online store for sweets and toys, built with Vite, React, TailwindCSS, TypeScript, Express, and the Telegram WebApp API.

## Run

```bash
npm install
npm run dev
npm run build
```

Frontend: `http://127.0.0.1:5173`

Backend API: `http://127.0.0.1:3001`

## Environment

Create `.env` from `.env.example` and set:

- `VITE_ADMIN_IDS` for frontend admin visibility
- `ADMIN_IDS` for backend admin write access
- `BOT_TOKEN` for strict Telegram `initData` verification
- `PORT` if you want a different API port

## Supabase

- Run [supabase/schema.sql](C:/Users/ASUS%20ROGG/OneDrive/%D0%A0%D0%B0%D0%B1%D0%BE%D1%87%D0%B8%D0%B9%20%D1%81%D1%82%D0%BE%D0%BB/fayz%20baraka/supabase/schema.sql) in the Supabase SQL editor
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Backend automatically uses Supabase when those vars are present, otherwise it falls back to local JSON storage

## Notes

- The hidden admin panel opens after tapping the centered logo 7 times
- Products, categories, orders, and uploads now persist through the local API instead of browser-only storage
- Order submission writes to the backend and also uses `Telegram.WebApp.sendData()` when opened inside Telegram
- Geolocation uses `Telegram.WebApp.LocationManager` when available and falls back cleanly outside Telegram
- Uploaded files are served from `public/uploads/`
