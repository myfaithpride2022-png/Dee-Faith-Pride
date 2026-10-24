# PROJECT BLUEPRINT — DEE-FAITH PRIDE MULTI-BIZ

**Project type:** Digital services, online ordering and manual payment management platform  
**Business name:** Dee-Faith Pride Multi-Biz  
**Tagline:** Your Trusted Hub for Digital Services.  
**Primary market:** Nigeria  
**Currency:** Nigerian Naira (NGN / ₦)  
**Frontend framework:** Astro  
**Styling:** Tailwind CSS  
**Language:** TypeScript  
**Database and authentication:** Supabase + PostgreSQL  
**Payment model:** Manual payment and administrator confirmation  
**Primary objective:** Build a production-oriented, responsive digital services platform with a public storefront, order management, manual payment verification, advertisements, appointment booking and a secure administrative dashboard.

---

## 1. YOUR ROLE

Act as a senior full-stack engineer, UI/UX designer, database architect and security-conscious technical lead.

Build this project incrementally, following this specification.

Do not treat this as a simple landing page or static template. The goal is a functioning business application.

Before changing any files:

1. Inspect the existing repository, its folder structure, package.json, dependencies, source code and available assets.
2. Determine whether this is an existing project or a new project.
3. Preserve working code and useful existing configurations.
4. Identify the installed versions of Astro, Tailwind CSS and other dependencies.
5. Produce a concise implementation plan based on the actual repository.
6. Identify missing credentials, external services and decisions that prevent genuine end-to-end functionality.

Do not delete or replace existing work without a clear technical reason.

Implement one milestone at a time. After each milestone, run the relevant checks, resolve errors and report what is actually working.

Do not stop after generating a plan unless an essential decision or permission is required. Continue implementation where the requirements are sufficiently defined.

## 2. NON-NEGOTIABLE BUSINESS REQUIREMENTS

### 2.1 Manual payments only

The initial version MUST use manual payment and confirmation.

Customers will:

1. Select a service.
2. Complete the required form.
3. Submit an order.
4. Receive a unique order reference.
5. View the amount payable and administrator-configured payment instructions.
6. Make payment using the configured manual payment channel.
7. Optionally submit a transaction reference or payment receipt.
8. Track their order.
9. Receive the service after payment is verified and the order is processed.

Administrators must verify payments before marking orders as paid.

Uploading a receipt must never automatically confirm payment.

A customer must not be able to change their own payment status, service fulfilment status, price or order ownership.

Do not integrate Paystack, Flutterwave, Stripe or any payment gateway in this release.

Do not introduce automated debits, wallet deposits, automatic payment collection or other payment-processing features.

Design the architecture so payment gateways could be considered in a future, separately authorised phase, without implementing them now.

### 2.2 Manual service fulfilment

Do not claim that airtime, mobile data, electricity tokens, decoder subscriptions, examination registrations or other services are automatically fulfilled.

In this version, administrators handle fulfilment manually and update the order status.

Provider APIs may be considered later, but must not be integrated without explicit approval.

### 2.3 No fabricated integrations

Do not invent API credentials, bank account details, official registration fees, provider connections, delivery confirmations or transaction results.

Use clearly labelled development data where necessary. Production services must not be represented as operational until their configuration and functionality have been verified.

### 2.4 Business identity

Use the exact business name:

Dee-Faith Pride Multi-Biz

Use the proposed tagline:

Your Trusted Hub for Digital Services.

Keep branding, contact details, payment instructions and other business configuration editable rather than scattering hardcoded values across components.

---

## 3. TECHNOLOGY STACK

Use the following architecture unless repository inspection reveals a concrete compatibility issue.

- Astro for pages, routing, layouts, server-rendered features and server endpoints.
- TypeScript with strict checking.
- Tailwind CSS for styling.
- Supabase PostgreSQL for persistent application data.
- Supabase Auth for administrator authentication.
- Supabase Storage or an equivalent private object-storage service for payment receipts and approved documents.
- Astro server endpoints or server actions for validated operations.
- Zod or a compatible schema-validation library for request validation.
- Git for version control.

Use current, mutually compatible stable releases when creating a new project. Inspect existing dependency versions before upgrading anything.

Use Astro's server output and a compatible deployment adapter for routes requiring server-side execution.

Do not build a static-only application that pretends to support persistent orders, authentication or payment verification.

Do not add React, Vue or another UI framework unless a documented requirement justifies it.

Prefer native Astro components and lightweight client-side JavaScript.

Use environment variables for secrets and configuration.

Create an `.env.example` file containing placeholder variable names only. Never commit actual credentials.

Suggested configuration variables include:

- `PUBLIC_SITE_URL`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Use only the variables genuinely needed by the selected Supabase integration. Never expose a service-role key or other privileged credential to the browser.

---

## 4. SERVICE CATALOGUE

Create a configurable service catalogue with categories.

### Category A: Airtime and mobile data

- MTN airtime and data.
- Airtel airtime and data.
- Glo airtime and data.
- 9mobile airtime and data.

Allow administrators to create and manage individual service offerings, plan descriptions, amounts, service charges and availability.

Do not invent actual data-plan prices or claim discounts without configured values.

### Category B: Examination services

- JAMB-related services.
- WAEC-related services.
- NECO-related services.
- Result checking.
- Scratch cards or PIN-based products where lawfully available.
- Registration assistance and related application services.

Clearly distinguish registration assistance, official fees, result-checking products and the business's service charges.

Do not imply affiliation with examination bodies without authorisation.

### Category C: Electricity

- Supported prepaid electricity services.
- Meter-related service requests.
- Token purchase assistance.

Collect only the details required for the selected service. Do not claim a token has been generated until the administrator has actually completed the transaction.

### Category D: Television subscriptions

- DStv.
- GOtv.
- StarTimes.
- Other configurable providers.

Support the relevant customer identifier, package and subscription details where applicable.

### Category E: Education

- School fee payment assistance.
- Admission applications.
- School forms.
- Online registrations.
- Other educational services.

Make it possible to collect additional service-specific fields without redesigning the entire ordering system.

### Category F: Cybercafé services

- Typing.
- Printing.
- Scanning.
- Photocopying.
- Document preparation.
- Online application assistance.

### Category G: Other digital services

Allow administrators to create additional categories and offerings.

### Service catalogue data

Each service should support:

- Name.
- Slug.
- Category.
- Description.
- Instructions.
- Required customer fields.
- Price or quotation-based pricing.
- Service charge where applicable.
- Optional image or icon.
- Availability status.
- Estimated processing time.
- Featured status.
- Sort order.
- Created and updated timestamps.

Some services have fixed prices; others require a quotation. Support both.

---

## 5. PUBLIC WEBSITE PAGES

Implement the following pages.

### `/`

Homepage containing:

- Responsive header and navigation.
- Brand logo or a typographic brand treatment.
- Hero section with a strong value proposition.
- Primary action to explore services.
- Search or prominent service navigation.
- Popular service categories.
- Featured services.
- Promotional banners.
- How-it-works section.
- Trust and service information.
- Announcements or important notices.
- Frequently asked questions.
- Contact and WhatsApp actions.
- Footer with policies and contact information.

Avoid excessive animations, clutter and unnecessary visual effects.

### `/services`

- Complete service catalogue.
- Search by service name.
- Category filters.
- Featured services.
- Clear availability indicators.
- Responsive service cards.

### `/services/[slug]`

Individual service page containing:

- Service description.
- Requirements.
- Price or quotation information.
- Processing-time estimate.
- Instructions.
- Availability.
- Relevant promotional content.
- Order action.

Use appropriate forms for different service types.

### `/order/[serviceSlug]`

Create a service-specific ordering interface.

Collect only the fields necessary for that service.

Show a clear review step before final submission, including the service selected, customer-provided details, service charge and total amount where applicable.

### `/track-order`

Allow customers to look up their order through a secure mechanism.

Use a combination of an order reference and an appropriate verification factor, such as a private tracking token or verified contact challenge.

An order reference alone must not reveal sensitive customer information.

### `/order-status/[token]`

If using token-based tracking, make tokens cryptographically random, sufficiently long, stored securely where appropriate, revocable and excluded from analytics and public logs.

Expose only information needed for customer tracking.

### `/promotions`

Display active offers and promotional campaigns.

Expired campaigns must not appear as active offers.

### `/announcements`

Display notices, deadlines and important service information.

### `/about`

Explain the business and its services without inventing credentials, partnerships or years of experience.

### `/contact`

Include configurable telephone, WhatsApp, business address and email details.

Include a validated contact form with spam protection.

### `/book-appointment`

Allow customers to request appointments.

Fields may include:

- Customer name.
- Contact details.
- Requested service.
- Preferred date.
- Available time slot.
- Notes.

Do not expose unavailable appointment slots as bookable.

### `/faq`

Provide editable answers about ordering, manual payments, processing times, refunds and common questions.

### `/privacy`, `/terms`, `/refund-policy`

Create editable policy pages.

Mark any business-specific policy that requires the owner's approval before publication.

### Error pages

Implement a branded 404 page and sensible error states for failed requests.

---

## 6. CUSTOMER ORDER WORKFLOW

Implement the complete workflow.

1. Customer selects a service.
2. Customer completes and submits the order form.
3. Server validates the input.
4. Server calculates the price using trusted server-side data.
5. The system generates a unique order reference.
6. The order is stored in the database.
7. The customer receives the order reference and payment instructions.
8. Customer makes manual payment.
9. Customer optionally submits payment proof or a transaction reference.
10. Administrator checks the actual payment.
11. Administrator confirms or rejects the payment submission.
12. Once confirmed, the order becomes eligible for fulfilment.
13. Administrator processes the requested service.
14. Administrator records completion or a failure.
15. Customer can view permitted status updates.

Use a human-readable order reference, for example:

`DFP-2026-000123`

Generate references safely on the server and enforce uniqueness in the database. Do not rely on sequential values alone for security.

### Separate payment and fulfilment states

Payment status:

- `unpaid`
- `submitted`
- `under_review`
- `confirmed`
- `rejected`
- `refund_pending`
- `refunded`

Fulfilment status:

- `not_started`
- `queued`
- `processing`
- `completed`
- `failed`
- `cancelled`

Define and validate allowed state transitions on the server.

A rejected receipt does not automatically mean the order is cancelled.

A confirmed payment does not mean the service is completed.

Do not allow a fulfilment process to begin until the payment has been confirmed, except for an explicitly configured quotation or unpaid-request workflow approved by the administrator.

Record every important transition in an audit log.

---

## 7. MANUAL PAYMENT MANAGEMENT

Build an administrator-configurable payment instruction system.

Support configuration for approved channels such as bank transfer, with fields appropriate to each channel.

Do not populate production bank details with fictional information.

Display the payment instructions associated with an order so the customer can refer to them later.

Allow customers to submit:

- Payment reference.
- Payment date, if known.
- Amount paid.
- Receipt image or document where needed.
- Optional explanatory note.

Validate uploads by actual file type, permitted size and other security controls.

Store receipts privately. Never expose public object-storage URLs for sensitive receipts.

Create a payment-review screen where authorised staff can:

- Inspect the order.
- View the expected amount.
- Review submitted payment details.
- Access the receipt securely.
- Confirm payment.
- Reject a submission with a reason.
- Record relevant transaction references.
- Initiate a refund record when appropriate.

Payment confirmation must be an explicit, authenticated server-side action.

Do not treat screenshots as proof that money was received. The administrator must verify payment using the appropriate financial channel.

Record the actor, timestamp, decision and reason for every payment-review action.

---

## 8. ADMINISTRATIVE DASHBOARD

Create a protected `/admin` area.

Recommended pages:

- `/admin/login`
- `/admin`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/payments`
- `/admin/services`
- `/admin/categories`
- `/admin/pricing`
- `/admin/promotions`
- `/admin/advertisements`
- `/admin/announcements`
- `/admin/appointments`
- `/admin/customers`
- `/admin/reports`
- `/admin/staff`
- `/admin/settings`
- `/admin/audit-logs`

### Dashboard overview

Show:

- New orders.
- Orders awaiting payment.
- Payment submissions awaiting review.
- Confirmed payments.
- Orders being processed.
- Completed and failed orders.
- Pending appointments.
- Configurable date-range summaries.

### Orders

Support search, filtering, pagination and sorting.

Allow staff to inspect order details, review payment information, update permitted statuses and add internal notes.

### Service management

Allow authorised staff to:

- Create and edit services.
- Assign categories.
- Configure prices and service charges.
- Manage availability.
- Change processing estimates.
- Upload service images.
- Feature or unfeature services.

### Promotions and advertising

Support:

- Promotional banners.
- Campaign titles and descriptions.
- Images.
- Start and end dates.
- Destination URLs.
- Active/inactive status.
- Display placement.
- Display order.
- Optional campaign identifiers for analytics.

Distinguish first-party business promotions from third-party sponsored advertising.

Third-party campaign billing is outside the initial scope.

### Appointment management

Allow administrators to:

- View appointment requests.
- Configure working hours.
- Block unavailable dates.
- Define slot duration.
- Approve, reject, reschedule or cancel bookings.
- Prevent conflicting confirmed appointments.
- Record appointment status and notes.

Use server-side checks and database constraints or transactions where necessary to prevent double booking.

### Reports

Provide date-filtered reports for:

- Order counts.
- Payments confirmed.
- Outstanding orders.
- Service charges.
- Recorded refunds.
- Service volumes.
- Estimated gross margin where actual costs are available.

Do not label gross sales as net profit.

Use recorded data only; do not fabricate business statistics.

---

## 9. DATABASE DESIGN

Use PostgreSQL through Supabase.

Design and document migrations before relying on the schema.

Suggested tables:

### `profiles`

- `id`
- `display_name`
- `email`
- `role`
- `is_active`
- `created_at`
- `updated_at`

Link authenticated staff profiles to Supabase Auth users.

Do not allow users to assign themselves administrator roles.

### `service_categories`

- `id`
- `name`
- `slug`
- `description`
- `image_path`
- `is_active`
- `sort_order`
- timestamps

### `services`

- `id`
- `category_id`
- `name`
- `slug`
- `description`
- `instructions`
- `form_schema`
- `base_price`
- `service_fee`
- `pricing_type`
- `processing_estimate`
- `image_path`
- `is_active`
- `is_featured`
- timestamps

Validate service-defined form schemas on the server. Do not execute arbitrary code from database content.

### `orders`

- `id`
- `order_reference`
- `tracking_token_hash` where token-based tracking is used
- `customer_name`
- `customer_email`, nullable
- `customer_phone`
- `service_id`
- `service_name_snapshot`
- `service_details`
- `subtotal`
- `service_fee`
- `total_amount`
- `currency`
- `payment_status`
- `fulfilment_status`
- `customer_notes`
- `internal_notes`
- timestamps

Store an appropriate snapshot of the service name and agreed price so later catalogue changes do not alter historical orders.

Use a suitable decimal or integer minor-unit representation for money. Never use floating-point arithmetic for financial calculations.

### `payment_submissions`

- `id`
- `order_id`
- `amount_reported`
- `payment_reference`
- `payment_date`
- `receipt_storage_path`
- `status`
- `reviewed_by`
- `reviewed_at`
- `rejection_reason`
- timestamps

### `payment_events`

Record confirmation, rejection, refund and other important payment events.

Include the responsible staff member, relevant references, timestamp and reason.

### `order_events`

Record important order and fulfilment transitions, including the actor and timestamp.

### `promotions`

- `id`
- `title`
- `description`
- `image_path`
- `placement`
- `destination_url`
- `starts_at`
- `ends_at`
- `is_active`
- `sort_order`
- timestamps

### `appointments`

- `id`
- `customer_name`
- `customer_phone`
- `customer_email`
- `service_id`
- `requested_start`
- `requested_end`
- `status`
- `customer_notes`
- `internal_notes`
- timestamps

### `business_settings`

Store editable public business details and approved payment instructions with appropriate access controls.

### `announcements`

Store editable announcements, publication dates and visibility.

### `audit_logs`

Record sensitive administrative actions.

Suggested fields include actor, action, entity type, entity ID, timestamp and structured metadata that excludes secrets.

Add additional tables only when justified by the implementation.

Use foreign keys, indexes, uniqueness constraints, appropriate deletion policies and migrations.

Document the final schema.

---

## 10. SECURITY REQUIREMENTS

Security is mandatory.

1. Protect all administrative pages and server operations.
2. Enforce role-based access on the server, not merely in the UI.
3. Use Supabase Row Level Security for exposed database tables.
4. Deny public access by default to private customer and financial records.
5. Restrict payment confirmation to authorised staff.
6. Keep privileged Supabase credentials on the server.
7. Validate and normalise all incoming data.
8. Use server-side price calculations.
9. Prevent customers from modifying other customers' orders.
10. Restrict receipt and document access through private storage and authorised access mechanisms.
11. Use secure authentication and session handling.
12. Apply rate limiting and spam protection to public endpoints.
13. Avoid exposing stack traces, secrets or sensitive information in production errors.
14. Protect against SQL injection, cross-site scripting, CSRF where applicable, malicious uploads and insecure redirects.
15. Add audit logging for sensitive actions.
16. Avoid logging passwords, authentication tokens, private receipts or unnecessary personal data.
17. Do not collect customer passwords for examination, school or third-party accounts.
18. Implement appropriate data-retention and deletion procedures.

Create and test Row Level Security policies. Do not assume that hiding a button or page makes an operation secure.

Never expose an administrator service key to browser code.

---

## 11. DESIGN SYSTEM AND VISUAL DIRECTION

The design should look like a modern Nigerian digital-services business.

### Brand

Name: Dee-Faith Pride Multi-Biz.

Proposed tagline: Your Trusted Hub for Digital Services.

### Suggested palette

- Deep navy or royal blue as the primary brand colour.
- White or off-white backgrounds.
- Warm gold or amber as a restrained accent.
- Neutral greys for supporting text and interface surfaces.
- Clear success, warning and error colours for status indicators.

Treat these colours as an initial design proposal. Keep them configurable through design tokens.

### Visual requirements

- Mobile-first responsive design.
- Professional typography.
- Strong visual hierarchy.
- Consistent spacing.
- Reusable buttons, cards, forms, tables and status badges.
- Accessible contrast.
- Visible keyboard focus.
- Proper form labels and validation feedback.
- Loading, empty, success and error states.
- Consistent navigation and footer.
- Optimised images.
- Minimal unnecessary JavaScript.
- Reduced-motion support.
- No intrusive animations or excessive gradients.

The public website should feel welcoming and trustworthy.

The admin dashboard should prioritise operational clarity and efficient workflows.

### Inspiration assets

Inspect available reference images before finalising the visual design.

If images are present in a folder such as `design-references/` or `public/references/`, review them and identify:

- Layout patterns.
- Colour schemes.
- Typography.
- Hero compositions.
- Service-card styles.
- Promotional banner treatments.
- Navigation patterns.
- Dashboard layouts.
- Relevant responsive behaviour, where observable.

Do not copy a reference website blindly. Use the images as inspiration and create a coherent original design for Dee-Faith Pride Multi-Biz.

Do not invent the contents of reference images that have not been inspected.

If no reference images are accessible, implement the proposed design direction and document the assumptions.

---

## 12. PROJECT STRUCTURE

Use a clear, maintainable structure similar to the following. Adapt it to the conventions of the installed Astro version.

```text
dee-faith-pride-multi-biz/
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── services/
│   │   ├── orders/
│   │   ├── forms/
│   │   ├── promotions/
│   │   └── ui/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── AdminLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── services/
│   │   ├── order/
│   │   ├── track-order.astro
│   │   ├── promotions.astro
│   │   ├── announcements.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── book-appointment.astro
│   │   ├── faq.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── refund-policy.astro
│   │   ├── admin/
│   │   └── api/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   ├── validation/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── appointments/
│   │   ├── pricing/
│   │   └── utilities/
│   ├── data/
│   ├── styles/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
├── .env.example
├── .gitignore
├── astro.config.mjs
├── package.json
├── PROJECT_BLUEPRINT.md
└── README.md
```

This is a suggested structure, not a requirement to create empty files for every directory. Create files when implementing real functionality.

Use server-only modules for privileged database operations.

Keep components focused and reusable. Avoid placing the entire application inside one large page component.

---

## 13. TESTING AND QUALITY ASSURANCE

Set up appropriate tests for the actual application.

### Functional tests

- Service catalogue loads correctly.
- Search and category filtering work.
- Service-specific forms validate correctly.
- Invalid submissions are rejected.
- Valid orders receive unique references.
- Order prices are calculated on the server.
- Manual payment instructions display correctly.
- Receipt submissions are stored privately.
- Payment cannot be confirmed by an unauthorised user.
- An order cannot be marked completed before appropriate payment confirmation.
- Customers cannot access other customers' private information.
- Admin service and pricing changes persist.
- Expired promotions are not displayed as active.
- Appointment booking prevents conflicting confirmed appointments.
- Tracking reveals only permitted order information.

### Technical checks

Run and resolve the relevant project commands, including:

- Dependency installation.
- Astro checks and TypeScript checks.
- Production build.
- Unit tests.
- Integration tests for sensitive business logic.
- End-to-end tests for important customer and administrator workflows.
- Linting, if configured.

Add automated tests for critical payment and authorisation rules.

Do not report tests as passed if they were not executed.

Do not claim the application is production-ready simply because the homepage renders.

---

## 14. IMPLEMENTATION MILESTONES

Work through these milestones in order.

### Milestone 1 — Repository inspection and foundation

- Inspect the environment and existing project.
- Establish Astro and Tailwind CSS.
- Configure TypeScript and formatting/check commands.
- Establish the base layout, typography, design tokens and responsive navigation.
- Document setup instructions.

**Acceptance criteria:** The project installs, checks and builds successfully.

### Milestone 2 — Public storefront

- Build the homepage.
- Build service categories and catalogue.
- Build individual service pages.
- Add service search and filtering.
- Build promotions, announcements, contact, FAQs and policy pages.
- Ensure mobile responsiveness.

Use clearly identified development data until persistent data is configured.

**Acceptance criteria:** Customers can navigate the complete public website and inspect services.

### Milestone 3 — Database and order creation

- Configure Supabase.
- Write migrations and access policies.
- Build service-specific order forms.
- Implement server-side validation and pricing.
- Generate unique order references.
- Persist orders.
- Display manual payment instructions.

**Acceptance criteria:** A valid order is persisted and can be retrieved securely.

### Milestone 4 — Manual payment verification

- Implement payment submissions.
- Implement private receipt storage.
- Build the payment-review interface.
- Enforce administrator-only confirmation.
- Record payment events and audit logs.
- Separate payment status from fulfilment status.

**Acceptance criteria:** Customers cannot confirm their own payments, and authorised administrators can review and confirm genuine payments.

### Milestone 5 — Order tracking and fulfilment

- Implement secure tracking.
- Build the order details view.
- Implement valid status transitions.
- Record fulfilment updates.
- Handle failed and cancelled requests appropriately.

**Acceptance criteria:** Customers can safely track their own requests, and administrators can manage order fulfilment.

### Milestone 6 — Administrative dashboard

- Implement administrator authentication.
- Build overview metrics.
- Add order and payment management.
- Add service, category and pricing management.
- Add settings and announcements.

**Acceptance criteria:** An authorised administrator can manage the core business without modifying source code.

### Milestone 7 — Promotions and appointments

- Implement advertisement management.
- Implement campaign scheduling.
- Implement appointment availability and booking.
- Add enquiry handling and notifications where configured.

**Acceptance criteria:** Administrators can manage promotions and appointments, and customers can submit requests successfully.

### Milestone 8 — Security, testing and deployment

- Review permissions and Row Level Security.
- Test critical workflows.
- Review private file access.
- Configure production environment variables.
- Build and deploy using a compatible hosting adapter.
- Configure the domain and HTTPS.
- Document backups, maintenance and recovery.

**Acceptance criteria:** The production environment passes the agreed security and functional tests.

---

## 15. OUT OF SCOPE FOR THE INITIAL RELEASE

Do not implement the following unless explicitly authorised later:

- Payment gateways.
- Automated payment collection.
- Customer wallets.
- Automated airtime or data vending.
- Automated electricity token purchases.
- Automated decoder subscription fulfilment.
- Automated examination registration.
- Mobile applications.
- Loyalty points and referral systems.
- Third-party advertising billing.
- Multi-branch operations.
- Unverified integrations with schools, examination bodies or utility providers.

The system should be extensible, but these features must not delay the initial functional release.

---

## 16. PROJECT DOCUMENTATION

Maintain a useful `README.md` with:

- Project overview.
- Technology stack.
- Prerequisites.
- Installation instructions.
- Environment variable setup.
- Local development commands.
- Database migration instructions.
- How to create the first administrator securely.
- How to configure payment instructions.
- How to run tests.
- How to build for production.
- Deployment instructions.
- Known limitations.

Never seed a production administrator account with a predictable password.

Provide a safe, documented bootstrap procedure for creating the first administrator.

Maintain a short `IMPLEMENTATION_STATUS.md` documenting:

- Completed milestones.
- Outstanding tasks.
- Known issues.
- External configuration still required.
- Tests executed and their actual results.

---

## 17. FINAL INSTRUCTIONS

Start by inspecting the existing repository and any accessible design-reference images.

Then:

1. Report the existing project state and proposed implementation sequence.
2. Identify essential missing decisions or credentials.
3. Implement Milestone 1.
4. Run the appropriate checks and resolve errors.
5. Continue through the milestones in order without discarding working code.
6. Keep this blueprint updated if a necessary architectural change is made.
7. Ask before implementing a major feature that conflicts with the stated scope.
8. Clearly identify any feature that depends on an external service or owner-provided configuration.
9. Never claim that an incomplete or untested feature works.
10. At each milestone, report changed files, implemented functionality, tests run, outstanding issues and the next milestone.

Prioritise a secure, maintainable and genuinely functional business application over superficial feature count.

**The goal is a professional, mobile-friendly digital services platform that Dee-Faith Pride Multi-Biz can operate and grow, starting with manual payments and fulfilment.**