# FAYZ BARAKA

Premium Telegram Mini App online store for sweets and toys, built with Vite, React, TailwindCSS, TypeScript, and the Telegram WebApp API.

## Run

```bash
npm install
npm run dev
npm run build
```

## Notes

- Set admin access in `.env` using `VITE_ADMIN_IDS=123456789,987654321`
- The hidden admin panel opens after tapping the centered logo 7 times, but actions are only available for listed Telegram admin IDs
- Order submission uses `Telegram.WebApp.sendData()`, which Telegram documents as available when the Mini App is launched via a keyboard-button web app flow
- Geolocation uses `Telegram.WebApp.LocationManager` (Bot API 8.0+). Outside Telegram it gracefully falls back
- Product and category management are persisted locally in `localStorage`
