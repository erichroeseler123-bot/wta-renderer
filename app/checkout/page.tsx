import StripeProvider from "@/app/components/stripe/StripeProvider";
import CheckoutClient from "@/app/components/cart/CheckoutClient";

export default function CheckoutPage() {
  return (
    <StripeProvider>
      <CheckoutClient />
    </StripeProvider>
  );
}
