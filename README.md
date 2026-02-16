# HourGym

> Rent gym space by the hour. A marketplace connecting personal trainers with gym owners in Denver.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe (Connect for marketplace)
- **Email:** Resend
- **SMS:** Twilio
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Features

### For Trainers (Renters)
- Browse available gym spaces
- Filter by space type (mats, turf, cage, studio)
- View space details and photos
- Book spaces by the hour (1-4 hours)
- Secure payment via Stripe
- View and manage bookings
- Cancel bookings (with refund based on policy)
- Email/SMS notifications

### For Gym Owners
- Create gym listing
- Add multiple spaces with photos
- Set weekly availability templates
- Block specific dates/times
- Connect Stripe for payouts
- View dashboard with earnings and bookings
- Manage cancellation policy

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Twilio account (optional, for SMS)
- Resend account (for email)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/hourgym.git
cd hourgym
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment example:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations from the spec
3. Enable Row Level Security policies
4. Configure storage buckets for photos

### Stripe Setup

1. Create a Stripe account
2. Enable Stripe Connect (Express accounts)
3. Set up webhook endpoint for:
   - `checkout.session.completed`
   - `account.updated`
4. Configure webhook secret in environment

## Project Structure

```
hourgym/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (gym)/             # Gym owner dashboard
│   ├── (marketing)/       # Landing page
│   ├── (renter)/          # Renter pages (browse, book)
│   └── api/               # API routes
├── components/            # React components
│   ├── booking/          # Booking-related components
│   ├── gym/              # Gym dashboard components
│   ├── layout/           # Header, Footer, Navigation
│   └── ui/               # Shared UI components
├── lib/                   # Utilities and clients
│   ├── booking/          # Booking logic
│   ├── notifications/    # Email & SMS
│   ├── stripe/           # Stripe client
│   ├── supabase/         # Supabase clients
│   └── utils/            # Helpers & constants
├── actions/              # Server actions
├── emails/               # React Email templates
├── types/                # TypeScript types
└── public/               # Static assets
```

## Key Business Rules

- **Booking Duration:** 1-4 hours
- **Buffer Time:** 30 minutes between bookings
- **Platform Fee:** 15%
- **Cancellation Policies:**
  - Flexible: Full refund 24+ hours before
  - Moderate: Full refund 48+ hours before
  - Strict: Full refund 7+ days before

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy

### Post-Deployment

1. Update Stripe webhook URL to production
2. Verify Resend domain
3. Configure Twilio phone number
4. Update `NEXT_PUBLIC_APP_URL`

## Testing Checklist

- [ ] User can sign up and log in
- [ ] User can browse spaces
- [ ] User can complete booking flow
- [ ] Stripe payment works
- [ ] Gym owner can onboard
- [ ] Gym owner can add spaces
- [ ] Gym owner can set availability
- [ ] Stripe Connect works
- [ ] Cancellations and refunds work
- [ ] Email notifications send
- [ ] SMS notifications send (if configured)
- [ ] Mobile responsive on all pages

## License

MIT
