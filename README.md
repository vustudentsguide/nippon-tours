# Nippon Travel Tours

A complete Tour Booking System built with React.js (Vite), Tailwind CSS, React Router, and Supabase.

## Project Structure

```
nippon-tours/
├── user-website/     # Customer-facing tour booking website
└── admin-portal/     # Admin dashboard for managing tours and bookings
```

## Prerequisites

- Node.js 18+ and npm
- A Supabase project (already configured)

## Environment Setup

### User Website (`/user-website`)

Create a `.env` file in the `/user-website` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin Portal (`/admin-portal`)

Create a `.env` file in the `/admin-portal` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Started

### User Website

```bash
cd user-website
npm install
cp .env.example .env  # Then fill in your credentials
npm run dev
```

The user website runs at http://localhost:5173

### Admin Portal

```bash
cd admin-portal
npm install
cp .env.example .env  # Then fill in your credentials
npm run dev
```

The admin portal runs at http://localhost:5174

**Admin Credentials:**
- Username: `admin`
- Password: `admin1243`

## Database Schema (Supabase)

### `tours` table
| Column | Type |
|--------|------|
| id | uuid (PK) |
| title | text |
| description | text |
| price | numeric |
| image_url | text |
| created_at | timestamptz |

### `bookings` table
| Column | Type |
|--------|------|
| id | uuid (PK) |
| tour_id | uuid (FK) |
| customer_name | text |
| customer_email | text |
| customer_phone | text |
| booking_date | date |
| flight_details | text |
| hotel_details | text |
| special_requests | text |
| status | text (pending/confirmed/deleted) |
| created_at | timestamptz |

### `reviews` table
| Column | Type |
|--------|------|
| id | uuid (PK) |
| tour_id | uuid (FK) |
| reviewer_name | text |
| rating | integer |
| comment | text |
| created_at | timestamptz |

### Storage
- Bucket: `tour-images` (Public)

## Features

### User Website
- 🏠 Home page with hero section and tour grid
- 📖 Tour details page with reviews
- 📝 Booking form with full travel details
- 📱 Fully responsive (mobile-first)

### Admin Portal
- 🔐 Simple login authentication
- 📊 Bookings dashboard with confirm/delete/contact actions
- ✏️ Tour CRUD with image upload to Supabase Storage
- ⭐ Review management (create/delete)