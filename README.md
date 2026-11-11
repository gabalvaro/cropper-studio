# Cropper Studio — redesigned

A Nuxt 4 + Vuetify 4 + Cropper.js classroom project with a consistent minimalist interface.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure Google Sign-In

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Select your Google Cloud project.
3. Create or select an OAuth 2.0 Client ID for a **Web application**.
4. Under **Authorized JavaScript origins**, add `http://localhost:3000`.
5. Copy `.env.example` to a new file named `.env`.
6. Put your Google Client ID in `.env`:

```env
NUXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Do not put a Google client secret in this frontend project. Do not commit your `.env` file.

## 3. Run the application

```bash
npm run dev
```

Open http://localhost:3000/login

## 4. Main project files

- `app/pages/login.vue` — redesigned Google sign-in page
- `app/pages/index.vue` — redesigned dashboard
- `app/pages/cropper.vue` — redesigned Cropper.js editor
- `app/assets/css/main.css` — shared minimalist design system
- `app/composables/useAuth.ts` — Google profile storage and sign-out
- `app/middleware/auth.ts` — classroom client-side route guard
- `nuxt.config.ts` — Nuxt, Vuetify, CSS, and public runtime config

## 5. Image editor features

- Select an image or drag and drop it into the upload area
- Crop using Cropper.js
- Rotate left and right
- Zoom in and out
- Reset the crop area
- Preview the cropped result
- Download the result as a PNG

Images are processed in the browser. The editor does not upload selected images to a server.

## Security note

This is a classroom demonstration. The browser decodes the Google ID token to display profile fields, but it does not verify the token signature. LocalStorage-based route protection is not secure authentication and must not be used for production. A production app must send the ID token to a backend and verify it using Google's supported libraries.
