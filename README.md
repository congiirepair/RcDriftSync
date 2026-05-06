# RC Drift Sync

Mobile-first PWA for RC drift tuning, setup sheet storage, public tune sharing, cloneable tune links, public driver profiles, and official PDF setup-sheet export.

Production domain:

- Main app: `https://rcdriftsync.com`
- Shared tune: `https://rcdriftsync.com/t/:shareId`
- Driver profile: `https://rcdriftsync.com/u/:username`
- Public library: `https://rcdriftsync.com/library`
- Admin/template editor: `https://rcdriftsync.com/admin`
- Optional beta: `https://beta.rcdriftsync.com`

## Local Development

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`.

## Routes

The app has client-side production routes for:

- `/`
- `/garage`
- `/cars`
- `/tunes`
- `/tune/:tuneId`
- `/tune/share/:shareId`
- `/t/:shareId`
- `/u/:username`
- `/library`
- `/admin`
- `/settings`
- `/login`
- `/signup`

Firebase Hosting and Vercel are both configured to rewrite all routes to `index.html`, so refresh works on nested routes.

## PWA Install

The app includes:

- `public/manifest.webmanifest`
- `public/sw.js`
- installable SVG icon at `public/icons/icon.svg`
- mobile viewport and Apple web app metadata in `index.html`
- offline cache for the app shell and official setup-sheet images

iPhone install:

1. Open `https://rcdriftsync.com` in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch RC Drift Sync from the home screen.

Android install:

1. Open `https://rcdriftsync.com` in Chrome.
2. Tap Install app or Add to Home screen.
3. Launch RC Drift Sync from the app icon.

## Firebase Setup

1. Create a Firebase project, suggested ID: `rcdriftsync`.
2. Enable Authentication providers, starting with Email/Password and Google.
3. Create a Firestore database in production mode.
4. Enable Firebase Storage if your project plan allows it.
5. Add a Web App in Firebase project settings.
6. Copy `.env.example` to `.env.local` and fill in the Firebase Web App values.
7. Copy `.firebaserc.example` to `.firebaserc` and set your actual project IDs.

Build and deploy:

```bash
npm run build
firebase login
firebase use rcdriftsync
firebase deploy
```

Deployed Firebase files:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`

Firebase Storage is optional. RC Drift Sync can use Cloudinary for tune photos instead, so the app does not require the Firebase Storage paid setup step.

Official Firebase references:

- Hosting overview: https://firebase.google.com/docs/hosting
- Hosting quickstart: https://firebase.google.com/docs/hosting/quickstart
- SPA rewrites and headers: https://firebase.google.com/docs/hosting/full-config
- Custom domains and SSL: https://firebase.google.com/docs/hosting/custom-domain

### Production Deployment Runbook

Use this checklist for `rcdriftsync.com`.

1. Create or open the Firebase project named `rcdriftsync`.
2. In Firebase Console, open Authentication, then enable Email/Password. Add Google later if desired.
3. In Firestore Database, create the database in production mode.
4. In Storage, enable Firebase Storage if you want Firebase-hosted photos and generated PDFs. If you do not want the paid Firebase Storage setup yet, keep Cloudinary configured for photos and skip Firebase Storage uploads.
5. In Project settings, create a Web App and copy the Firebase config into `.env.local`.
6. Confirm `.firebaserc` points to the production project:

```json
{
  "projects": {
    "default": "rcdriftsync"
  }
}
```

7. Build locally:

```bash
npm run build
```

8. Deploy Hosting, Firestore rules, indexes, and Storage rules:

```bash
firebase deploy --project rcdriftsync
```

9. Smoke test the default Firebase Hosting URL first:

```text
https://rcdriftsync.web.app
https://rcdriftsync.web.app/library
https://rcdriftsync.web.app/t/share-rdx-baseline
```

10. Confirm route refresh works on:

```text
/
/home
/garage
/cars
/tunes
/tune/tune-rdx-baseline
/builder
/community
/profile
/u/demo-driver
/t/share-rdx-baseline
/admin
/settings
/login
/signup
```

The app now includes Firebase-ready screens and services:

- Email/password sign up, log in, log out, and password reset.
- User profile fields for display name, username, and profile photo URL.
- IndexedDB remains the local source for offline editing.
- When a user signs in, the app can import the local garage, tunes, profiles, photos, and electronics profiles to Firebase.
- Personal edits continue to save locally if Firebase permissions or connection fail.

## Cloudinary Photo Setup

RC Drift Sync supports optional Cloudinary uploads for tune photos while keeping local offline previews. If Cloudinary is not configured, photos remain local-only on the device.

1. Create a free Cloudinary account.
2. In Cloudinary, open Settings.
3. Copy your `Cloud name`.
4. Open Settings, then Upload.
5. Add an upload preset.
6. Set the preset signing mode to `Unsigned`.
7. Name it something like `rc_drift_sync_unsigned`.
8. Restrict the preset to images if Cloudinary shows that option.
9. Save the preset.
10. Add these values to `.env.local`:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=rc_drift_sync_unsigned
VITE_CLOUDINARY_FOLDER=rc-drift-sync/tune-photos
```

Then restart the dev server:

```bash
npm run dev -- --host 127.0.0.1
```

For production, add the same `VITE_CLOUDINARY_*` values before running `npm run build`, then deploy Hosting:

```bash
npm run build
firebase deploy --only hosting --project rcdriftsync
```

Photo behavior:

- The app always creates a local preview for offline use.
- If Cloudinary is configured, the original uploaded image is sent to Cloudinary.
- Shared tune pages display `cloudUrl` first and fall back to the local preview.
- Firebase Storage can stay disabled unless you later decide to move photo storage back into Firebase.

## Custom Domain: rcdriftsync.com

1. In Firebase Console, open Hosting.
2. Click Add custom domain.
3. Enter `rcdriftsync.com`.
4. Follow Firebase ownership verification.
5. Add the DNS records Firebase provides at your DNS host.
6. Wait for DNS propagation and SSL provisioning.
7. Test:
   - `https://rcdriftsync.com`
   - `https://rcdriftsync.com/library`
   - `https://rcdriftsync.com/t/share-rdx-baseline`

Firebase will provide exact DNS records during setup. Common records are apex `A` records to Firebase Hosting IPs, but use the current values Firebase shows for your project.

Cloudflare DNS notes:

- Keep Firebase Hosting verification `TXT` records as `DNS only`.
- Apex/root records usually use `A` records for `rcdriftsync.com`; add the exact Firebase IP values shown in the Hosting wizard.
- `www` usually uses a `CNAME` pointing to the Firebase Hosting target shown by Firebase, commonly `rcdriftsync.web.app`.
- Keep Firebase Hosting records `DNS only` until Firebase shows the domain as connected and SSL is provisioned.
- After Firebase marks SSL as connected, you can keep Cloudflare proxy off for simplest Firebase troubleshooting. If you later enable the proxy, use Cloudflare Full or Full strict SSL and retest PWA install and shared links.
- SSL provisioning can take up to 24 hours after DNS points at Firebase. During that window, browsers may show certificate warnings or Firebase may show `Pending` / `Minting Certificate`.

After custom domain connection, test:

```text
https://rcdriftsync.com
https://rcdriftsync.com/home
https://rcdriftsync.com/library
https://rcdriftsync.com/t/share-rdx-baseline
https://rcdriftsync.com/u/demo-driver
```

Share links and QR codes are generated with:

```text
https://rcdriftsync.com/t/:shareId
```

## Beta Domain

Use a separate Firebase Hosting site, preview channel, or separate Firebase project for beta.

Recommended:

```bash
firebase hosting:channel:deploy beta
```

For a permanent beta domain, create a second Hosting site or Firebase project such as `rcdriftsync-beta`, then add `beta.rcdriftsync.com` as a custom domain in Firebase Hosting. Keep beta environment variables separate from production and add `beta.rcdriftsync.com` to Firebase Auth authorized domains before testing login.

Suggested beta flow:

```bash
npm run build
firebase hosting:channel:deploy beta --project rcdriftsync
```

Use beta for new features before deploying production:

```bash
firebase deploy --only hosting --project rcdriftsync
```

## Optional Vercel Frontend

You can deploy the Vite frontend to Vercel and keep Firebase for Auth, Firestore, and Storage.

1. Import the repo into Vercel.
2. Set build command: `npm run build`.
3. Set output directory: `dist`.
4. Add all `VITE_FIREBASE_*` environment variables.
5. Add `rcdriftsync.com` in Vercel Domains.
6. Configure DNS records shown by Vercel.
7. Keep Firebase Auth authorized domains updated with `rcdriftsync.com`.

`vercel.json` rewrites all frontend routes to the app shell.

## Data Model

Suggested Firestore collections:

- `users/{uid}`: private account settings and public profile settings.
- `cars/{carId}`: private garage cars owned by `ownerId`.
- `tunes/{tuneId}`: private owner tune documents with `visibility`, `shareId`, setup values, electronics, photos, notes, clone metadata, and stats.
- `electronicsProfiles/{profileId}`: reusable ESC, servo, gyro, and radio profiles owned by `ownerId`.
- `setupTemplates/{templateId}`: published official/universal setup sheet templates.
- `sharedTunes/{shareId}`: sanitized public/unlisted shared tune snapshots for `/t/:shareId`.
- `comments/{commentId}`: public tune comments.
- `likes/{likeId}`: user likes for public tunes.
- `follows/{followId}`: driver follows.
- `trackSessions/{sessionId}`: private track session logs owned by `ownerId`.
- `publicTuneStats/{tuneId}`: public counters for views, likes, clones, shares, and comments.

## Community

The Community tab is mobile-first and intentionally simple:

- Category rails for Featured, Trending, Most cloned, Newest, Highest rated, RDX, MC-3, Universal, ESC, servo, gyro, and track-specific tunes.
- Search across chassis, electronics, tires, track, surface, body, tags, and setup values.
- Sort by newest, most cloned, most liked, most viewed, or rating.
- Tune cards show chassis, driver, thumbnail/PDF preview, track, surface, tire, rating, tags, likes, clones, views, comments, View, Clone, Like, Favorite, Follow, and Comment.
- Public driver profiles live at `/u/:username`.
- Track pages live at `/track/:track-slug`.
- Cloned tunes show remix source metadata when available.

Local-first community actions are stored in IndexedDB now and map to Firebase collections later:

- Likes -> `likes`
- Favorites -> `users/{uid}` or a future `favorites` collection
- Comments -> `comments`
- Follows -> `follows`
- Track pages -> `trackSessions` plus public tune stats

Tune visibility:

- `private`: owner only.
- `unlisted`: visible through share link.
- `public`: visible through share link and public library.

Privacy flags:

- `sharedNotesEnabled`
- `sharedPhotosEnabled`
- `cloneEnabled`
- `sharedChassisSetupEnabled`
- `sharedEscTuneEnabled`
- `sharedServoTuneEnabled`
- `sharedGyroTuneEnabled`
- `sharedRadioTuneEnabled`
- `sharedHistoryEnabled`
- `sharedOwnerNameEnabled`
- `pdfDownloadEnabled`

Clone fields:

- `clonedFromTuneId`
- `clonedFromOwnerId`
- `clonedFromShareId`

Share stats:

- `viewCount`
- `likeCount`
- `cloneCount`
- `shareCount`

## Form-to-PDF Workflow

The app uses a clean mobile form for tune entry. Users do not type directly onto the PDF.

Workflow:

1. Choose a chassis/template.
2. Fill the mobile form sections: General, Front, Rear, Chassis, Wheel, Electrical.
3. Save the tune.
4. Open Preview.
5. Export the completed setup sheet PDF.

PDF generation uses `pdf-lib`:

- Loads the correct original PDF template.
- Stamps saved form values onto mapped PDF coordinates.
- Stamps checkmarks onto checkbox coordinates.
- Stamps circles onto selected hole positions.
- Preserves the official PDF labels, diagrams, and divider lines.

Coordinate maps live in:

- `src/data/pdfTemplates.ts`

Admin calibration is available at `/admin`. It shows normalized image coordinates and real PDF coordinates for tapped points, supports hotspot editing, and exports/imports JSON.

## Setup Sheet Assets

Official PDF-derived images:

- `public/sheets/RDX_Setting-Sheet_A4_20260325.pdf`
- `public/sheets/MC-3_Setting-Sheet_A4_20260325.pdf`
- `public/sheets/reve-d-rdx-official.png`
- `public/sheets/mc-3-official.png`
- `public/sheets/rdx-template-20260325.png`
- `public/sheets/mc3-template-20260325.png`

Template definitions and hotspot coordinates:

- `src/data/sheets.ts`

Each hotspot is defined in the sheet image coordinate system. The active official sheets use a `1786 x 2526` canvas.

## Production QA Checklist

- App opens at `https://rcdriftsync.com`.
- PWA install works from Safari on iPhone.
- PWA install works from Chrome on Android.
- `/library` loads after refresh.
- `/u/:username` loads after refresh.
- `/t/:shareId` loads after refresh.
- Shared tune pages work without login when visibility is `public` or `unlisted`.
- Private tunes cannot be accessed publicly.
- Clone-to-my-garage creates a new tune owned by the cloning user.
- QR code opens the correct `rcdriftsync.com/t/:shareId` URL.
- Interactive setup sheet displays selected holes and values on public pages.
- Photos respect `sharedPhotosEnabled`.
- Notes respect `sharedNotesEnabled`.
- Firestore rules reject edits by non-owners.
- Storage rules reject private photo reads by non-owners.
- Mobile layout remains usable on 390px and 430px wide phones.

## Launch QA Status

Last local launch QA pass: May 5, 2026.

Automated launch coverage now includes:

- iPhone-size, Android-size, small-mobile, and desktop viewport smoke checks.
- Horizontal overflow checks on Home, Garage, Tune Builder, Community, Profile, Settings, Track Sessions, and public shared tune pages.
- Touch-target checks for visible buttons.
- Sign up, log in, password reset, and profile form visibility.
- First-run onboarding and skip behavior.
- Add car, edit car, delete car, and friendly empty states.
- Universal, RDX, and MC-3 tune creation paths.
- Front setup, rear setup, drivetrain, ESC, servo, gyro, and radio tune fields through the mobile Tune Builder.
- Photo upload in tune and track-session flows.
- Autosave, manual save, duplicate tune, and revision/history behavior.
- Universal PDF preview/export.
- Official RDX filled PDF preview/export.
- Official MC-3 filled PDF preview/export.
- Share links using `https://rcdriftsync.com/t/:shareId`.
- Shared tune public page, QR code, like, clone, and privacy toggles.
- Community browsing, filters, likes, favorites, comments, follows, public profiles, and track pages.
- Track session logging.
- Setup Assistant recommendations saved to tune notes.
- PWA manifest, service worker, icons, shortcuts, and offline app-shell behavior.
- Route refresh coverage for production routes.
- Dark mode and light mode toggle.
- Offline banner.

Commands run:

```bash
npm run build
npx playwright test
npm run lint
```

Current result:

- `npm run build`: passing.
- `npx playwright test`: passing, 15/15 tests.
- `npm run lint`: not passing yet because of existing React hook lint rules in `src/App.tsx`, `src/components/GarageManager.tsx`, `src/components/PublicTunePage.tsx`, and `src/components/UniversalTuneBuilder.tsx`.

Known launch issues / follow-ups:

- Refactor older hook patterns flagged by `react-hooks/set-state-in-effect`, `react-hooks/exhaustive-deps`, and `react-hooks/purity`.
- Production Firebase Auth, Firestore permission-denied cases, and Storage/photo permissions still need one live-project QA pass after deployment with real Firebase credentials.
- PWA install must be manually verified on a real iPhone Safari and Android Chrome device after `https://rcdriftsync.com` SSL is provisioned.
- Firebase Storage can remain disabled if Cloudinary is used for photos.

## Verification

```bash
npm run build
npx playwright test
```

Firebase QA that needs real project credentials:

- Enable Email/Password Auth in Firebase.
- Add valid `VITE_FIREBASE_*` values to `.env.local`.
- Restart the dev server.
- Test sign up, login, logout, password reset, profile save, local import, photo upload to Storage, Firestore permission denied cases, public/unlisted shared tune reads, and private tune rejection.
