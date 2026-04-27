import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { SlideshowProvider } from "@/lib/slideshow-context";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import CartSidebar from "@/components/CartSidebar";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rift & Root | Taste of the Rift",
    template: "%s | Rift & Root",
  },
  description:
    "Rift & Root Kenya — Health food restaurant and packaged products in Kahawa Sukari, Nairobi. Probiotic beverages, heritage flour blends, and ready meals formulated by a food scientist. Countrywide delivery.",
  keywords: [
    "Rift & Root",
    "Rift and Root Kenya",
    "healthy food Nairobi",
    "probiotic beverages Kenya",
    "gut health Kenya",
    "plantain kvass",
    "heritage flour blend",
    "ugali blend",
    "uji flour",
    "finger millet",
    "sorghum",
    "Kahawa Sukari restaurant",
    "healthy meals Nairobi",
  ],
  openGraph: {
    title: "Rift & Root | Taste of the Rift",
    description:
      "Health food restaurant & packaged products in Kahawa Sukari, Nairobi. Probiotic beverages, heritage flour blends, ready meals. Formulated by a food scientist.",
    locale: "en_KE",
    type: "website",
    siteName: "Rift & Root Kenya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rift & Root | Taste of the Rift",
    description:
      "Health food restaurant & packaged products in Kahawa Sukari, Nairobi. Probiotic beverages, heritage flour blends, ready meals.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://riftandroot.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Rift & Root Kenya",
    alternateName: "Rift and Root",
    description:
      "Heritage African meals, probiotic beverages, and pantry goods hand-crafted in small batches in Nairobi. Countrywide delivery.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://riftandroot.com",
    telephone: "+254713280550",
    email: "admin@riftandroot.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -1.1834,
      longitude: 36.9281,
    },
    founder: {
      "@type": "Person",
      name: "Prisca Kiragu",
      jobTitle: "Food Scientist",
    },
    servesCuisine: ["Kenyan", "African", "Healthy"],
    priceRange: "KES 120-800",
    sameAs: [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline dark-mode detection — runs before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
        {/* JSON-LD structured data — Schema.org Restaurant */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${plusJakartaSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          <SlideshowProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartSidebar />
          <FloatingWhatsApp />
          <Toaster richColors position="bottom-right" />
          </SlideshowProvider>
        </CartProvider>
      </body>
    </html>
  );
}
