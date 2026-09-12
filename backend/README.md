# Kaushal Refrigeration & Interior — Backend Architecture

This directory houses the backend schema, database migration scripts, and service configurations for Kaushal Refrigeration & Interior.

## Database (Supabase PostgreSQL)

- **Schema File**: [`database/supabase_schema.sql`](./database/supabase_schema.sql)
- **Tables**:
  1. `public.quotes`: Customer inquiries, leads, contact details, requirement type, and status (`NEW`, `CONTACTED`, `CLOSED`).
  2. `public.gallery_items`: Live dynamic portfolio items, specs, photos, and categories (Display counters, cake showcases, chillers, hot cases).
  3. `storage.buckets ('gallery-images')`: Public storage bucket for uploaded counter photos.

## Security & Row Level Security (RLS)

All tables have RLS policies enabled:
- Public anonymous users can view active gallery items and submit new quote requests.
- RLS blocks unauthorized modifications or data deletion.

## Notifications & Email Dispatch

- **Service**: Resend REST API
- **Trigger**: Automatic email alert sent to `VITE_OWNER_EMAIL` whenever a new lead is captured.
