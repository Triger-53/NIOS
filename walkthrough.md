# Walkthrough - Fixing Vercel Build Error

I have fixed the build error that was occurring on Vercel.

## The Issue

The build was failing with the error:
```
Error: `key_id` or `oauthToken` is mandatory
```
This was happening because the Razorpay SDK was being initialized at the top level of `src/app/api/razorpay/create-order/route.ts`. When Next.js builds the application, it may import this file. If the environment variables `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` are not present in the build environment (which is common for secrets), the initialization fails.

## The Fix

I moved the Razorpay initialization inside the `POST` request handler. This ensures that the SDK is only initialized when the API endpoint is actually called at runtime, not during the build process.

### Modified `src/app/api/razorpay/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// REMOVED: Top-level initialization
// const razorpay = new Razorpay({ ... });

export async function POST(request: NextRequest) {
  // ADDED: Initialization inside the handler
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!,
  });

  const { amount, currency } = await request.json();
  // ... rest of the function
}
```

## Verification

I checked other files for similar issues:
- `src/app/api/razorpay/verify-payment/route.ts`: Uses `process.env.RAZORPAY_SECRET` inside the handler, so it is safe.
- `src/components/PurchaseButton.tsx`: Uses `window.Razorpay` on the client side, so it is safe.

This change should resolve the Vercel build error.
