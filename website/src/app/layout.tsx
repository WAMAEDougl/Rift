import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import CartSidebar from "@/components/CartSidebar";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Ayola Foods KE | Eat Healthy, Enjoy Life",
    template: "%s | Ayola Foods KE",
  },
  description:
    "Ayola Foods Kenya — Health food restaurant and packaged products in Kahawa Sukari, Nairobi. Probiotic beverages, heritage flour blends, and ready meals formulated by a food scientist. Countrywide delivery.",
  keywords: [
    "Ayola Foods", "Ayola Foods Kenya", "healthy food Nairobi",
    "probiotic beverages Kenya", "gut health Kenya", "plantain kvass",
    "heritage flour blend", "ugali blend", "uji flour", "finger millet",
    "sorghum", "Kahawa Sukari restaurant", "healthy meals Nairobi",
  ],
  openGraph: {
    title: "Ayola Foods KE | Eat Healthy, Enjoy Life",
    description:
      "Health food restaurant & packaged products in Kahawa Sukari, Nairobi. Probiotic beverages, heritage flour blends, ready meals. Formulated by a food scientist.",
    locale: "en_KE",
    type: "website",
    siteName: "Ayola Foods Kenya",
  },
  metadataBase: new URL("https://ayola-foods-ke.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Ayola Foods Kenya",
    alternateName: "Ayola Foods Limited",
    description:
      "Health food restaurant and packaged food products in Kahawa Sukari, Nairobi. Probiotic beverages, heritage flour blends, and ready meals formulated by a food scientist.",
    url: "https://ayola-foods-ke.vercel.app",
    telephone: "+254713280550",
    email: "ayola.foods.kenya@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    geo: { "@type": "GeoCoordinates", latitude: -1.1834, longitude: 36.9281 },
    founder: { "@type": "Person", name: "Prisca Kiragu", jobTitle: "Food Scientist" },
    servesCuisine: ["Kenyan", "African", "Healthy"],
    priceRange: "KES 120-800",
    sameAs: [
      "https://www.facebook.com/p/Ayola-Foods-Kenya-100087278121034/",
      "https://www.instagram.com/ayolafoods/",
      "https://www.tiktok.com/@priscakiragu",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <CartProvider>
                <Navbar />
                <CartSidebar />
                <main>{children}</main>
                <Footer />
                <FloatingWhatsApp />
                <Toaster richColors position="bottom-right" />
              </CartProvider>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
