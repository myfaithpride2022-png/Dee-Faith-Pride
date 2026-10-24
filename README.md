# Dee-Faith Pride Multi-Biz

An Astro and Tailwind CSS web application foundation for Dee-Faith Pride Multi-Biz, a Nigerian digital services business. The planned service ordering workflow uses manual payment and administrator verification, followed by manual fulfilment.

## Current status

The public storefront includes the cybercafé services specified by the owner, mobile-friendly search/category shortcuts, service-specific WhatsApp enquiry prompts, provider identity tiles, and the owner-supplied location and 24-hour opening information. An optional fixed-price order flow can collect a payment report for an existing order; protected staff pages support manual payment review and fulfilment updates. The new manual-operations migration must be applied in Supabase before those operations work. See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for progress and remaining requirements.

## Technology

- Astro with server output and the standalone Node adapter
- TypeScript with Astro's strict configuration
- Tailwind CSS v4 through its Vite plugin
- Prettier with Astro file support
- pnpm for package management

No payment gateway or automatic vending is configured. Payment reports are customer-provided claims only; an administrator must check the business's actual payment records before confirming payment. Service fulfilment is manual. Supabase access is server-side for order creation and uses the public key for active service reads and token-authorized payment reporting. No production payment instructions are configured.

## Prerequisites

- Node.js `>=22.23.4` for the current Astro release
- pnpm `12.15.0` (the project pins this version for Corepack)

Check the installed tools before installing packages:

```sh
node --version
corepack pnpm --version
```

If Corepack is not available in your Node.js installation, install pnpm `12.15.0` using the official pnpm installation instructions. Do not switch package managers in this project without first removing the existing lockfile and agreeing on the change.

## Install and run locally

```sh
corepack pnpm install
corepack pnpm dev
```

Astro prints the local development URL in the terminal. Stop the server with `Ctrl+C`.

## Environment

Copy `.env.example` to `.env` and set the local values below to run the Supabase-backed service pages and order endpoint. Never put a secret key in client-side code or commit a populated `.env` file.

The following configuration is required for the Supabase-backed pages and admin tools:

- `PUBLIC_SITE_URL`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

## Checks and production build

```sh
corepack pnpm check
corepack pnpm format:check
corepack pnpm build
```

To format supported project files:

```sh
corepack pnpm format
```

The Node adapter produces a standalone server build. A deployment host, domain, and production environment variables have not yet been selected or configured.

## Public pages currently implemented

- `/` — introduction, original digital-life illustration, and provider highlights
- `/services` — cybercafé service catalogue with browser-side search, mobile category shortcuts, provider identity tiles, and WhatsApp enquiries
- `/services/[slug]` — service details with a guided, service-specific WhatsApp message; an order form also appears for an active database service with a valid form schema and configured fixed price
- `/promotions`, `/announcements`, `/about`, `/contact`, `/book-appointment`, `/faq`
- `/privacy`, `/terms`, `/refund-policy` — explicitly marked drafts that require owner approval
- Branded 404 page

The catalogue reflects services the owner says Dee-Faith Pride offers, including coding and website design, AI-assisted content creation, and project research support. Exact availability, official fees, and service charges are confirmed in WhatsApp before work starts. Customers can enquire/book via a prefilled WhatsApp message and attach print/design files directly in that chat; the website does not receive those files. Provider logo images are bundled in `public/images/provider-logos`, so they load from the hosted site without depending on an external image service. The 9mobile and BEDC images were supplied in the workspace; the remaining images were retrieved from public source pages. Initial badges remain as fallbacks if an image fails to load. Logos identify service providers only and do not imply affiliation. The home page includes a custom inline illustration of a customer using a laptop and getting phone support, inspired by the workspace references without copying their imagery. The business WhatsApp contact, address, hours, and map search are editable in `src/data/site.ts`.

Provider logo source pages: [MTN](https://commons.wikimedia.org/wiki/File:MTN_2022_logo.svg), [Airtel](https://commons.wikimedia.org/wiki/File:Bharti_Airtel_Logo.svg), [Glo](https://commons.wikimedia.org/wiki/File:Glo_button.png), [JAMB](https://en.wikipedia.org/wiki/File:Official_JAMB_logo.png), [WAEC](https://en.wikipedia.org/wiki/File:Waec_logo.png), and [DStv](<https://commons.wikimedia.org/wiki/File:DStv_Logo_(2023).svg>). NECO, NABTEB, GOtv, and StarTimes icons were retrieved from the corresponding public websites' favicons. Each brand remains the property of its respective owner; confirm permission and usage requirements before production.

For an active database service with an approved fixed price, a customer can submit an order and receive a private order token. The token authorizes a payment report for that order; it is not a public order-tracking lookup. A customer must first receive verified payment instructions directly from the business. The website accepts only the customer's report of an amount, date/reference, and optional note—no money, card details, receipt upload, passwords, PINs, or one-time codes. The admin order page requires staff sign-in and provides manual payment review and manual fulfilment transitions with database audit events. No automatic verification, payment gateway, or provider fulfilment is used.

## Planned database and operations

The initial Supabase migration was reported applied by the project owner. Apply `supabase/migrations/20261023190000_manual_order_operations.sql` in the Supabase SQL Editor to enable customer payment reports and atomic, audited staff review/fulfilment transitions. No live credentials or bank details are included. Administrator creation must use a verified Supabase Auth account and a controlled server-side role assignment; no predictable seeded administrator will be added.

## Design references

The workspace contains four visual references: a productivity landing page, a compact banking dashboard, an education storefront, and a Nigerian fintech landing page. The foundation takes inspiration from their clear hierarchy, compact cards, strong navigation, and restrained green/blue accents. It does not reuse their brand, copy, photography, or unsupported statistics.

## Known limitations

- The new manual-operations SQL migration must be run and checked in the owner's Supabase project before using `/admin/orders` or submitting payment reports. Live database workflows have not been independently verified.
- Business prices, verified payment instructions, policies, and legal approvals must be supplied by the business owner before publication.
- Payment receipt uploads, a customer order-status lookup, automatic notifications, and automated fulfilment are not implemented.

## Admin access setup

The protected admin area uses Supabase Auth passwords and server-managed,
HTTP-only session cookies. The first administrator must be provisioned by the
project owner; no public sign-up or self-service role promotion is provided.

1. In Supabase **Authentication → Users**, create the owner's Auth account.
   Keep public sign-ups disabled.
2. In the Supabase SQL Editor, replace the two example values below with the
   owner's approved display name and exact Auth email, then run the statement:

   ```sql
   insert into public.profiles (id, display_name, email, role, is_active)
   select id, 'Owner Name', email, 'admin', true
   from auth.users
   where email = 'owner@example.com'
   limit 1;
   ```

3. Confirm exactly one profile row was inserted and that it belongs to the
   intended Auth user. Then sign in at `/admin/login`.
4. Create services only with owner-approved descriptions, request fields,
   pricing, and availability. Only activate a service when it is approved for
   customer requests.

Do not insert credentials in the SQL editor or application data. Never assign
roles from a browser form. Additional staff must be created as Auth users and
given an explicitly approved profile by a trusted project owner. Admin access
and service changes are protected by active-profile checks and the database's
staff RLS policies. Customer payment reports are not payment confirmation.
Review the corresponding payment against the business's actual records before
manually confirming it. Only then may a staff member start or complete manual
fulfilment.
