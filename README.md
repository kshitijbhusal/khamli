# Khamli — Anonymous File & Message Sharing

> Share anything with a 6-character code. No login, no signup. Everything self-destructs in 10 minutes.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | Neon (PostgreSQL, serverless) |
| File storage | AWS S3 |
| Deployment | Vercel |

---

## Local Development

### 1. Clone & install

```bash
git clone https://github.com/yourname/khamli.git
cd khamli
npm install
```

### 2. Set up Neon DB

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. In your project dashboard, go to **Connection Details**.
3. Copy the **Pooled connection string** → `DATABASE_URL`
4. Copy the **Direct connection string** → `DIRECT_URL`

### 3. Set up AWS S3

1. Create an S3 bucket (e.g. `khamli-files`).
2. Set the bucket region (e.g. `us-east-1`).
3. Create an IAM user with programmatic access and attach this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::khamli-files/*"
    }
  ]
}
```

4. Enable CORS on the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://khamli.com", "http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

### 4. Environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 5. Push DB schema & generate Prisma client

```bash
npm run db:push
npm run db:generate
```

### 6. Run dev server

```bash
npm run dev
# http://localhost:3000
```

---

## Deployment (Vercel)

1. Push to GitHub and import the repo on [vercel.com](https://vercel.com).
2. Add all environment variables from `.env.example` in the Vercel dashboard.
3. Deploy. Vercel will automatically run the cron job at `*/5 * * * *` using `vercel.json`.

> **Note:** Vercel Cron requires a Pro plan for custom schedules. On the free Hobby plan, you can instead use a free external service like [cron-job.org](https://cron-job.org) to call `GET https://khamli.com/api/cleanup` every 5 minutes with header `x-cron-secret: <your-secret>`.

---

## Customisation

### Solana wallet address
Open `app/support/page.tsx` and replace `YOUR_SOLANA_USDT_ADDRESS_HERE` with your actual Solana wallet address.

### Expiry time
Change the 10-minute window in `lib/code.ts`:
```ts
// getExpiryTime() — currently 10 minutes
return new Date(Date.now() + 10 * 60 * 1000);
```

### Max file size
Change the limit in `app/api/send/route.ts`:
```ts
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
```

---

## Project Structure

```
khamli/
├── app/
│   ├── layout.tsx          # Root layout + Navbar
│   ├── globals.css         # Design tokens + utilities
│   ├── page.tsx            # Home: Send + Receive panels
│   ├── about/page.tsx      # About page
│   ├── support/page.tsx    # Solana donation page
│   └── api/
│       ├── send/route.ts      # POST — create message/upload
│       ├── receive/route.ts   # GET  — retrieve by code
│       └── cleanup/route.ts   # GET  — cron: delete expired
├── components/
│   ├── Navbar.tsx
│   ├── SendPanel.tsx       # WhatsApp-style composer
│   └── ReceivePanel.tsx    # Code input + result display
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── s3.ts               # AWS S3 helpers (upload/download/delete URLs)
│   └── code.ts             # 6-char alphanumeric code generator
├── prisma/
│   └── schema.prisma       # Message model
├── vercel.json             # Cron schedule
└── .env.example            # Environment variable template
```

---

## Data Flow

```
SEND (file)
Browser → POST /api/send (metadata) → DB record created → pre-signed S3 URL returned
Browser → PUT <s3-url> (file bytes, direct to S3) → 200 OK
Browser ← { code, expiresAt }

RECEIVE
Browser → GET /api/receive?code=A1B2C3
Server → DB lookup → S3 pre-signed download URL generated (15 min TTL)
Browser ← { type, content/urls, expiresAt }

CLEANUP (every 5 min)
Cron → GET /api/cleanup
Server → find expired DB rows → delete S3 objects → delete DB rows
```

---

## License

MIT — do whatever you want with it.
