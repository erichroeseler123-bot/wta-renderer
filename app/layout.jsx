import "./globals.css";

export const metadata = {
  title: "Welcome to Alaska Tours",
  description: "Explore Alaska cruise ports, tours, and real-time destination intelligence."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 
        🔴 IMPORTANT FIX:
        DO NOT lock scrolling on <body>.
        Removing overflow-hidden allows pages like /ports/juneau
        to scroll beyond the map section.
      */}
      <body className="m-0 p-0 bg-black text-cyan-300 font-mono overflow-auto">
        <main className="w-full min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
