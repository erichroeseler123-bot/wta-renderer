import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CruiseProvider } from "@/context/CruiseContext";
import CartProvider from "@/app/components/cart/CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC]">
        <CartProvider>
          <CruiseProvider>
            <Header />
            {children}
            <Footer />
          </CruiseProvider>
        </CartProvider>
      </body>
    </html>
  );
}
