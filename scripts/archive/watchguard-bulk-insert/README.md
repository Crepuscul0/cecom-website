# WatchGuard Bulk Insert (Supabase)

This portable bundle contains everything needed to bulk insert the WatchGuard products catalog into your Supabase project.

## Contents
- `bulk-insert-products.js`: CLI script to upsert products into Supabase
- `data/scraped/watchguard/watchguard-catalog.json`: WatchGuard catalog (products)
- `package.json`: Dependencies and scripts
- `.env.example`: Sample environment variables

## Requirements
- Node.js v18+
- Supabase project with tables: `products`, `categories`, `vendors`
- The following categories are recommended: `firewalls`, `endpoint-security`, `wifi-security`, `access-points`, `cybersecurity`
- A `vendors` row with name: `WatchGuard`

## Environment variables
Copy `.env.example` to `.env.local` and set values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

- Use `SUPABASE_SERVICE_ROLE_KEY` for writes
- The script automatically uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` when `--dry-run` is set

## Install
```
npm install
```

## Dry run (no writes)
```
# Preview first 50 items
npm run dry
# or
node bulk-insert-products.js --file=data/scraped/watchguard/watchguard-catalog.json --limit=50 --dry-run
```

## Execute (writes to DB)
```
# Insert all items
npm start
# or
node bulk-insert-products.js --file=data/scraped/watchguard/watchguard-catalog.json

# Insert only first 10 items
node bulk-insert-products.js --file=data/scraped/watchguard/watchguard-catalog.json --limit=10
```

## Notes
- Category mapping is keyword-based when the incoming category slug does not exist:
  - `firebox`, `firewall`, `firecloud` → `firewalls`
  - `endpoint`, `edr`, `epp`, `epdr`, `aepdr` → `endpoint-security`
  - `wi-fi`, `wireless`, `access point` → `wifi-security` (fallback `access-points`)
  - `identity`, `authpoint`, `mfa`, `sso`, `xdr`, `mdr`, `threatsync` → `cybersecurity`
  - `cloud`, `security` → `cybersecurity` fallback
- Assets are stored in `external_image_url` and `external_datasheet_url` columns to align with the frontend API.
