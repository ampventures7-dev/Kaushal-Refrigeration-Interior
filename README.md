# Kaushal Refrigeration & Interior

Commercial Display Counters, Chillers, Cake Showcases & Stainless Steel Kitchen Fabrication — Jhotwara, Jaipur.

## Repository Structure

```
.
├── frontend/                  # React + Vite Client Application
│   ├── src/                   # Components, styling, assets, and service integrations
│   ├── public/                # Static assets, sitemap.xml, robots.txt
│   ├── index.html             # Entry HTML with Schema.org JSON-LD structured data
│   ├── vite.config.js         # Vite configuration
│   ├── package.json           # Dependencies & build scripts
│   └── .env                   # Frontend API keys (Supabase URL, Anon Key, Resend)
│
└── backend/                   # Cloud Services & Database Architecture
    ├── database/
    │   └── supabase_schema.sql # PostgreSQL schema, RLS policies & storage bucket
    └── README.md              # Database documentation & backend architecture guide
```

## Running the Application Locally

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
The app will be available at [http://localhost:5174/](http://localhost:5174/).

### Building for Production:
```bash
cd frontend
npm run build
```

### Database Setup:
Open Supabase SQL Editor and execute [`backend/database/supabase_schema.sql`](./backend/database/supabase_schema.sql).
