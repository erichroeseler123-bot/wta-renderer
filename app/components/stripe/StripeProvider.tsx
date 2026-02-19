"use client";

import { PropsWithChildren, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

export default function StripeProvider({ children }: PropsWithChildren) {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  const stripePromise = useMemo(() => loadStripe(pk), [pk]);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
