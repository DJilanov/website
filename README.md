# Jilanov Engineering Website

Lead-generation website that reports traffic and contact requests into the EU Webstore admin.

## Run Locally

```bash
npm install
npm run dev
```

Open:

- Website: `http://localhost:5173`
- Local admin handoff: `http://localhost:5173/admin`

The real admin section is inside the EU Webstore admin:

```text
https://admin.jilanov.com/ecommerce/software-leads
```

## Production

By default, the local website backend targets the deployed jilanov admin API:

```text
https://admin.jilanov.com/api
```

Project requests are submitted to `/store/contact` with `source=software-lead`.
Traffic events are forwarded to `/store/analytics/events` with `category=software-development`,
so the EU Webstore admin can show visitors, sources, campaigns, referrers and leads in one place.

Useful environment overrides:

```bash
ADMIN_SECRET="replace-with-a-random-secret"
ANALYTICS_SALT="replace-with-a-random-secret"
ADMIN_EMAIL="toni-website@jilanov.com"
CONTACT_TO_EMAIL="dimitar@jilanov.com"
JILANOV_API_BASE="https://admin.jilanov.com/api"
JILANOV_ADMIN_URL="https://admin.jilanov.com"
JILANOV_ANALYTICS_CATEGORY="software-development"
JILANOV_STORE_REQUEST_SOURCE="software-lead"
```

The deployed API controls actual owner email delivery. Set the API notification recipient to
`dimitar@jilanov.com` in the jilanov API environment before deploy.

Direct Postgres mode still exists for isolated local testing, but it is opt-in:

```bash
REQUESTS_BACKEND="postgres"
DB_HOST="..."
DB_PORT="5432"
DB_NAME="..."
DB_USERNAME="..."
DB_PASSWORD="..."
CLIENT_CONFIG_PATH="/absolute/path/to/client-config.json"
```

Analytics events are still mirrored locally in `data/events.jsonl` for development diagnostics.

## Campaign Links

Use source-specific URLs when sharing:

```text
/?utm_source=hackernews&utm_medium=community&utm_campaign=software_leads_launch
/?utm_source=reddit&utm_medium=community&utm_campaign=software_leads_launch
/?utm_source=indiehackers&utm_medium=community&utm_campaign=software_leads_launch
/?utm_source=linkedin&utm_medium=social&utm_campaign=software_leads_launch
```

The EU Webstore admin tracks page views, referrers, UTM sources, campaigns, devices, languages, scroll depth, CTA clicks, engagement time and project requests.
