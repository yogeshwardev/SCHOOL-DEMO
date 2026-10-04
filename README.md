# Rainbow's English Medium High School, Chittoor – School Management System

A complete school ERP in two parts:

| Part | Entry point | What it is |
|---|---|---|
| **Public website** | `index.html` | Premium marketing site: home, about, principal's message, vision, academics, classes, faculty, facilities, infrastructure, labs, library, transport, sports, achievements, events, gallery, news, admissions (with enquiry form), contact, location, login portal. Announcements, events, headcount and faculty are pulled live from the same data the portal uses. |
| **Secure portal** | `portal.html` | One login for 8 roles, each with its own dashboard, navigation and data permissions. |

No build step, no dependencies. Open `index.html` (or `portal.html`) in a browser, or run any static server in this folder.

## Demo accounts

Password for **every** account: `School@123`. There is **one sign-in page for everyone**: parents use their registered mobile number, students their admission number, staff their username. Parents and students open the same family portal (a parent with two children can switch between them; a student sees only their own record). The login page lists demo accounts in a collapsed *Demo accounts* box – remove it before going live.

| Role | Username | Notes |
|---|---|---|
| Principal | `principal` | M. Sujana Sree |
| Dean | `dean` | |
| Accountant | `accountant` | |
| Teachers | shown on login page | Class teacher of 5A and a subject teacher |
| Operations Supervisor | `supervisor` | Staff: `ops.lakshmi` |
| Administrator | `admin` | |

## Seeded demo data

140 students in 20 sections (Classes 1–10, A & B) with Telugu-region names, parents, 30 teachers, Principal, Dean, Accountant, 9 operations staff, administrator; a conflict-free 6-day × 7-period timetable for every class; ~60 days of attendance; 5 examinations (two with marks); fee structure and ~100 receipts with Paid / Partially Paid / Pending / Overdue mixes; monthly payroll and expenses; holidays, events, announcements, cleaning tasks, maintenance requests, leave requests, enquiries, WhatsApp history and an audit trail.
All dates are generated relative to today's date the first time the app loads. *Settings → Data & backup* (Administrator) resets the demo data.

## How the modules are connected

All screens read and write through one data layer (`js/store.js`), so a change in one place appears everywhere:

* **Attendance** – Class teacher submits → student/parent calendar, Dean/Principal analytics and dashboards update → absent parents get the WhatsApp message.
* **Marks** – Dean creates exam → subject teacher (only for their own class + subject) saves a draft / submits → Dean approves & publishes (or returns with a note) → student & parent results/report card update → WhatsApp message per parent.
* **Fees** – Accountant (or parent online) records a payment → balance, status, receipt, parent portal, class-wise status, reports and Principal finance dashboards update → WhatsApp confirmation.
* **Timetable** – Dean edits a class timetable (teacher double-booking is blocked instantly) → *Publish* → teacher and student timetables change.
* **Class teacher** – Dean assigns → that teacher immediately gets the class dashboard, full student details and attendance rights.
* **Hall tickets** – Dean generates per student or per class; optional rule *“block for overdue fees”* is a setting; parents download from their portal.
* **Operations** – Staff update tasks → supervisor verifies → Principal sees cleanliness/maintenance status. Teachers and staff report issues with photos.
* **Audit log** – marks, attendance, payments, student details, timetable, hall tickets, salaries, settings: user, role, time, previous & new value.

## Role access (enforced on every page, query and search result)

Principal – everything (read) plus student admissions, leave decisions, announcements, settings. Dean – academics. Accountant – fees, payroll, expenses, receipts, financial reports (no academics/medical data). Teacher – own classes; full student details only for the class they are class teacher of; marks only for assigned class + subject; own salary only. Parent/Student – only their own child; students cannot see payment details. Operations – only assigned tasks and maintenance. Administrator – accounts, settings, notifications, audit (no student, academic or financial data).

## Files

```
index.html / portal.html        entry pages
css/site.css, css/app.css       public-site and portal design systems
js/core.js                      constants, date/money helpers, grading
js/seed.js                      demo-data generator (timetable solver included)
js/store.js                     data layer, business rules, permissions, audit, notifications
js/ui.js, js/docs.js            UI toolkit, charts, list views; receipts / report cards / hall tickets / salary slips
js/pages-*.js, js/portal.js     role dashboards and modules; router, shell, login, global search
js/site.js                      public website
```

## Branding & content

Logo, school photographs, address, phone numbers, Chairman, Principal, RICRAC values and the mandatory-disclosure PDFs (in /files) were copied from the school's previous website; nothing links back to it. **Students, teachers, fees and marks are sample records** – replace them with real data. The public site deliberately avoids numbers the school has not published (strength, fees, facilities counts); add them in js/site.js when confirmed.

## Before going to production (important)

This build is a **front-end product running on browser storage** so it can be demonstrated without a server. For real use you must add:

1. **A backend + database** (e.g. Node/PostgreSQL or Django). `js/store.js` is the only data layer – replace it with API calls. Move every permission check (`studentAccess`, route roles, search scoping) to the server.
2. **Real authentication** – hashed passwords (bcrypt/argon2), sessions/JWT, forced password change, rate-limiting, optional OTP for parents. Demo passwords here are stored in plain text for convenience.
3. **WhatsApp Business Cloud API** – today `S.notify()` writes to the notification history with status *Delivered* (simulated). Call the API from the server there; templates must be pre-approved by Meta.
4. **Payment gateway** – the online payment dialog is a simulation. Integrate Razorpay/PayU server-side with signature verification and webhooks before recording a payment.
5. Replace the illustrated gallery, placeholder affiliation number and sample statistics on the public site with the school's own content; use real photographs for students and staff.
6. Backups, HTTPS, and a data-protection policy for children's records.
