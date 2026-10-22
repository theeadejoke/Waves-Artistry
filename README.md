# Waves Artistry Beauty Therapy: website + salon management

Static front end (`index.html`) on GitHub Pages, with a real database and staff login on Supabase (free tier is enough to start).

## How it fits together
| Part | Where | Job |
|---|---|---|
| `index.html` | GitHub Pages | Public site and staff dashboard (all HTML, CSS, JS in one file) |
| `backend.js` | GitHub Pages | Connects the app to Supabase |
| `config.js` | GitHub Pages (you create it) | Your Supabase URL and public anon key |
| `supabase/schema.sql` | Supabase | Tables and access rules |
| Supabase Auth | Supabase | Staff email/password login |

Data lives in one table, `docs`, keyed by collection: `svc` services, `cus` customers, `ap` appointments, `tx` transactions, `cfg` settings. Access rules are enforced by the database itself (row level security), not just the interface.

## Setup (about 20 minutes)
1. **Supabase project:** supabase.com > New project. Choose a region near Nigeria/Europe, set a strong database password and save it.
2. **Tables:** SQL Editor > New query > paste `supabase/schema.sql` > Run.
3. **Your login:** Authentication > Users > Add user (your email + password, tick auto-confirm). Then in the SQL Editor run the commented line at the bottom of `schema.sql` with your email, to make yourself `owner`.
4. **Disable public sign-ups:** Authentication > Sign In / Providers > turn off "Allow new users to sign up". Add staff yourself under Users, then run `insert into staff (user_id, role) select id, 'staff' from auth.users where email = 'staff@email';`
5. **Keys:** Project Settings > API. Copy the Project URL and the `anon` public key. Copy `config.example.js` to `config.js` and paste them in. Do not use the `service_role` key.
6. **GitHub:** create a repo, upload everything (including `config.js`; the anon key is designed to be public and the rules protect your data). Settings > Pages > deploy from `main` / root.
7. **Test:** open your Pages URL, go to the footer "Staff sign in", log in, add a service in Services & Pricing, record a service in Daily Records, refresh and confirm it stays.

## Roles
- `owner`: edit services, prices, settings, delete records.
- `staff`: customers, appointments, record services and payments. Cannot change prices or settings.
Change a role by editing the `staff` table in Supabase (Table Editor).

## Editing the look and the app
- **Colours and fonts:** the `:root` variables at the top of `index.html`.
- **Public pages:** functions `homeV`, `svcV`, `bookV`, `contactV`.
- **Dashboard:** `ovV` overview, `dyV` Daily Records, `apV` appointments, `cuV` customers, `svV` services, `rpV` reports, `stV` settings.
- **Contact details, hours, payment methods:** Business Settings in the dashboard, no code needed.
- Edit directly on GitHub (pencil icon), commit, and Pages redeploys in about a minute.

## Backups
Supabase free tier does not include automatic backups you can restore. Either upgrade to Pro, or export regularly: Table Editor > `docs` > Export CSV (monthly at minimum). Reports > Export CSV in the dashboard also exports transactions.

## Not built yet
1. **Email** (confirmations, reminders, campaigns): add a Supabase Edge Function that calls an email provider such as Resend or Brevo, with the API key stored as a Supabase secret, never in this repo. Marketing consent and unsubscribe dates are already stored on each customer.
2. **Customer self-booking from the public site:** needs a Postgres function (RPC) that inserts only an appointment and a customer for anonymous visitors, with rate limiting. It is switched off so customers' data stays private.
3. **About page, enquiry form, photos, testimonials.**
4. **Per-record edit history beyond payments**, and finer permissions.
