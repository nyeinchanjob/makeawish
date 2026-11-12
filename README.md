# Share the Light

A Tazaungdaing Festival wish wall with a live all-plant display, employee submissions,
and PIN-protected moderation, backed by Azure Cosmos DB for NoSQL.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d4b71084-67ff-4358-92d5-632768a476b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Pages

- `/`: employee name, company email, plant and a wish with at least three
  non-whitespace characters, with no application character maximum.
- `/display`: live TV display of approved wishes from HTY, HB, CDC and JC, with aggregate plant counts.
- `/submit`: redirects to `/`, preserving existing submission QR links.
- `/admin`: PIN login, auto-approval, moderation, search, CSV export and confirmed clear-all.
- `/admin/login`: redirects to `/admin`.

QR codes can point to the root domain to open the submission form immediately.
Static Web Apps rewrites non-API/non-asset navigation to `/index.html`, supporting
direct visits and refreshes on `/display`, `/submit` and `/admin`.

The display renders its last public snapshot from localStorage immediately and refreshes
every five seconds without a blocking spinner. Only the latest 120 approved wishes are
downloaded; counts include **all** approved wishes. A missing/unreachable API activates
a browser demo labeled on Submit and Admin (see below); other server errors leave the last snapshot
visible with a retry notice. This avoids a network wait for cached content, but cannot
guarantee literal zero-millisecond browser rendering or the first visit's load time.
Do not use the former browser-only demo records as event data; they are not uploaded.

The clean display has no title stack or demo banner, leaving the official background
visible. Only unique approved wishes are shown, up to fourteen at once.
One to four wishes form a centered cluster with matching columns; five to eight expand
into three or four vertically centered desktop columns. Nine or more use the full
four-column independent flex masonry wall. Phones/tablets use one or two columns.
The full-width upper sky stage
runs from 2.5% to 78% of the screen with 3% side margins and 16px gaps. Only column four
has a 210px top spacer to clear the artwork; the other columns have modest top spacing.
Initial and incoming wishes balance estimated/measured column heights, then stay locked
to their assigned column through edits, font loading, moderation and rotations.
Only a responsive or wish-count-driven column-count change redistributes cards.
When more than fourteen unique wishes are available, every three seconds one column's
top card fades upward and out; a different, off-screen wish enters
at the bottom of that same column. Remaining items glide vertically for 700ms, without
cross-column reflow. When fewer than fourteen approved wishes exist, only those available
are shown, without duplicates. New arrivals take priority in the next
rotation and briefly glow with a `✨ New` badge.
When all wishes are already visible, cards remain mounted: no repeated frames or
duplicates are generated to fill slots. Cards have aligned widths up to 380px, compact
20px corner ornaments, and natural content height. Long messages use a smaller font,
with no height cap, truncation or inner scrollbars. The whole wall scrolls if full
messages exceed the safe sky area.
Wishes have no application length cap, but Cosmos DB's **2 MB document limit**
and hosting/browser-storage limits still apply. Cosmos size failures return HTTP 413.

## Azure Static Web Apps and Cosmos DB

The workflow builds the SPA directly to `.output/public/index.html`, builds the Node.js
TypeScript Functions in `api`, and deploys both to Static Web Apps. The in-memory Vite
middleware is **serve-only**, never included in a production build. Static Web Apps
routes `/api/*` to its built-in Functions; no external API URL is used.

1. Provision a Cosmos DB **NoSQL account**. On the first API request, the app creates
   database `makeawish-db` and container `wishes` with partition key **`/plant`** if
   missing; the account key must permit database/container creation. An existing
   container with a different partition key fails explicitly rather than being replaced.
   Keep consistent automatic indexing (including `/status/?`
   and `/created_on/?`); a composite index on `status ASC, created_on DESC` can reduce
   the RU cost of filtered recent-wish queries. This implementation deliberately fans
   out across the four plants for the combined display; `/plant` has low cardinality,
   so monitor hot partitions and RU consumption as the event scales.
2. Set these **server-side Static Web Apps application settings**, never `VITE_*` variables:

   | Setting            | Default                                     |
   | ------------------ | ------------------------------------------- |
   | `COSMOS_ENDPOINT`  | required Cosmos account endpoint            |
   | `COSMOS_KEY`       | required Cosmos account key                 |
   | `COSMOS_DATABASE`  | `makeawish-db`                              |
   | `COSMOS_CONTAINER` | `wishes`                                    |
   | `ADMIN_PIN`        | `2026` — **override before a public event** |

3. Configure the existing GitHub Actions Static Web Apps deployment secret and deploy.
   The API uses the Node 20 Functions runtime. Cosmos credentials never reach the browser.
   The client is reused across warm invocations; the JavaScript SDK uses HTTPS gateway
   connections (not the .NET SDK's Direct/TCP mode).

The workflow compiles and installs API dependencies under Node 20 before switching
to Node 24 for the frontend. The Functions entry is `api/dist/api/src/index.js`;
compiled shared validation is included under `api/dist/shared`. The prebuilt API
deployment includes `api/package.json`, `api/host.json`, `api/dist` and production
dependencies. No Cosmos network operation or credential validation runs during worker
module loading. Requests share a cached initialization promise; failed provisioning
is retried on the next request without replacing the singleton client.

For a submission failure, inspect the JSON response in the browser Network tab.
Unexpected/configuration/Cosmos failures return HTTP **500** with `{ error, details }`,
with Cosmos keys and configured admin PINs redacted. Validation/authentication,
wish-not-found, size-limit and rate-limit responses keep their specific statuses.
Enable Application Insights for full server logs. A platform-level 503 before the
handler runs still requires checking Azure deployment/runtime logs.
The root `.env` is local-only: it does **not** populate Azure application settings.
After changing settings or deploying these fixes, verify the live API before the event;
this repository's mocked tests do not establish live account connectivity.

Wishes use UUID v4 `id`, `employee_name`, normalized company `email`, `plant`, `message`,
`status`, and ISO `created_on`. The singleton `{ id: "app-settings", plant: "SYSTEM",
autoApprove: true, updatedAt: "<ISO timestamp>" }` is upserted on the first settings read
if missing or malformed. Repairs persist the default `autoApprove: true` before any wish
is saved. Legacy settings with a valid boolean flag receive timestamp metadata without
changing that flag. GET settings and submissions share this repair logic; PATCH/PUT
always upsert a complete document in the `SYSTEM` partition with a fresh timestamp.
Changing Auto-Approve affects future submissions only. Real database read/write failures
still surface; they do not silently approve or pretend a submission was saved.

### API

| Method and path                   | Access / body                                                           |
| --------------------------------- | ----------------------------------------------------------------------- |
| `GET /api/wishes?status=approved` | Public: `{ wishes, counts: { HTY, HB, CDC, JC } }`; no emails           |
| `GET /api/wishes?status=all`      | `x-admin-pin`: all wishes including emails, newest first                |
| `POST /api/wishes`                | `{ employee_name, email, plant, message }`; returns created wish        |
| `PATCH /api/wishes/:id`           | `x-admin-pin`; `{ plant, status?: "approved" \| "rejected", message? }` |
| `DELETE /api/wishes/:id`          | `x-admin-pin`; JSON `{ plant }`                                         |
| `DELETE /api/wishes/all`          | `x-admin-pin`; deletes wishes, preserves settings                       |
| `GET /api/settings`               | Public `{ autoApprove }`                                                |
| `PATCH / PUT /api/settings`       | `x-admin-pin`; `{ autoApprove: boolean }`                               |

The admin PIN is kept in page memory, not localStorage. This shared PIN is a lightweight
event gate, not individual corporate authentication. Use HTTPS and a strong non-default PIN;
for a broadly public deployment, add platform-level abuse protection and managed identity/
company sign-in as appropriate. The company email suffix is validated, not email ownership.
CSV includes employee emails; treat exports as private. Reset is permanent, non-transactional
across partitions, and bounded to ten concurrent deletes. Avoid new submissions during an
event reset; on an error, refresh and retry to clear any remaining documents.

### Local development and validation

For ordinary local testing, no Azure tools or credentials are required:

```sh
npm ci
npm run dev -- --port 8081
```

Open `http://localhost:8081`. The dev-only middleware handles all wish/settings endpoints
in memory, with festive Burmese/English samples across every plant. Its admin PIN is
`ADMIN_PIN` from the process or local Vite environment, default `2026`. All tabs connected
to that server share its state. It resets on restart and **never writes to Cosmos DB**.

The root `.env.example` lists all settings; copy it to `.env` if a local template is
not already present. Both `.env` and `api/local.settings.json` are gitignored.
Vite reads `.env` for development; real Functions read `process.env`, populated by
Azure application settings or the Functions `local.settings.json` file. Set Cosmos
credentials only in those server-side settings, never in `VITE_*` variables.

For production-style static preview, run `npm run build` then `npm run preview`.
The dedicated preview config serves `.output/public` directly instead of starting
TanStack's SSR preview (which expects a different server output). `/api/*` deliberately
returns 404 there so the browser fallback can take over, rather than returning SPA HTML.

For static preview (or when `/api` is missing/unreachable), the API client uses the
separate `share-light.local-api.v1` localStorage store, seeded once with the same samples.
Display, submission, moderation, settings, CSV and reset all work against this store.
The browser-demo admin PIN is `VITE_ADMIN_PIN` (default `2026`): this public build-time
value is demo-only UI gating, not security. Real API authorization uses only `ADMIN_PIN`.
Names and emails saved there can be read or changed by anyone using that browser.
Blocked/full or malformed storage produces an explicit error, not a false successful save.
Clearing wishes persists an empty collection; samples do not reappear after refresh.

Submit and Admin show the mode notice; the public display deliberately has no demo banner.
Browser fallback stays
active for the page session until **Retry live API** succeeds (or the page reloads), so
local edits aren't silently mixed with live data. No automatic upload/replay happens when
connectivity returns; browser demo data remains isolated and can be exported before switching.
Only missing-endpoint 404s and failed network connections trigger fallback: validation,
authentication, rate-limit and server errors still surface, as does a real API's
`Wish not found.` response. Aborting a request never activates the fallback.

To test the **real Cosmos-backed Functions** locally, install Azure Functions Core Tools v4
and the Azure Static Web Apps CLI separately, then:

```sh
npm ci
npm ci --prefix api
npm run build --prefix api
cp api/local.settings.json.example api/local.settings.json
# Fill in local.settings.json with your development Cosmos account credentials.
# In separate terminals:
npm run dev -- --port 5173
cd api && npm start
# From the repository root, proxy both:
swa start http://localhost:5173 --api-devserver-url http://localhost:7071
```

Use the SWA proxy URL (normally `http://localhost:4280`) so `/api` reaches Functions
rather than Vite's local demo. Never commit `local.settings.json`.

```sh
npm test
npx tsc --noEmit
npm run build --prefix api
npm run build
```

API tests mock the Cosmos boundary; a real account/emulator smoke test is still needed
after configuring credentials. Production assets are `/background.png`, `/qr-code.png`
and `/TCCC-UnityText-Regular.ttf`. Ensure the supplied QR image encodes the deployed
root URL (or the compatible `/submit` URL) before displaying it at the event.
