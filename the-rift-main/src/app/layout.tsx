import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { unstable_noStore as noStore } from "next/cache";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { SlideshowProvider } from "@/lib/slideshow-context";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import CartSidebar from "@/components/CartSidebar";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Toaster } from "sonner";
import { createClient } from "@supabase/supabase-js";

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

export default async function RootLayout({
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

  // Always fetch fresh — never serve a cached theme/settings
  noStore();

  let activeTheme = "theme-earth";
  let siteSettings: Record<string, string | null> | null = null;
  const personalizationStyle: Record<string, string> = {};
  let googleFontsHref: string | null = null;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("store_settings")
      .select(
        "active_theme, store_name, support_phone, support_email, whatsapp_number, address, city, primary_color, secondary_color, accent_color, font_heading, font_body"
      )
      .eq("id", 1)
      .single();

    if (data?.active_theme) activeTheme = data.active_theme;
    if (data) siteSettings = data;

    // Inject personalization colors as CSS variable overrides (inline style wins over theme)
    if (data?.primary_color) personalizationStyle["--primary"] = data.primary_color;
    if (data?.secondary_color) personalizationStyle["--secondary"] = data.secondary_color;
    if (data?.accent_color) personalizationStyle["--accent"] = data.accent_color;

    // Inject custom fonts — only if different from the built-in next/font fonts
    const builtInFonts = ["Fraunces", "Plus Jakarta Sans"];
    const fontsToLoad: string[] = [];
    if (data?.font_heading && !builtInFonts.includes(data.font_heading)) {
      personalizationStyle["--font-display"] = `'${data.font_heading}', serif`;
      fontsToLoad.push(data.font_heading);
    }
    if (data?.font_body && !builtInFonts.includes(data.font_body) && data.font_body !== data.font_heading) {
      personalizationStyle["--font-sans"] = `'${data.font_body}', sans-serif`;
      fontsToLoad.push(data.font_body);
    }
    if (fontsToLoad.length > 0) {
      const families = fontsToLoad
        .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`)
        .join("&");
      googleFontsHref = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    }
  } catch {
    // fallback to defaults
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={activeTheme}
      style={Object.keys(personalizationStyle).length > 0
        ? personalizationStyle as React.CSSProperties
        : undefined}
    >
      <head>
        {/* Google Fonts for custom personalization fonts */}
        {googleFontsHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleFontsHref} />
          </>
        )}
        {/* Light mode is default — only apply dark if user explicitly chose it */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
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
          <Header storeName={siteSettings?.store_name ?? undefined} />
          <main>{children}</main>
          <Footer settings={siteSettings} />
          <CartSidebar />
          <FloatingWhatsApp
            whatsappNumber={siteSettings?.whatsapp_number ?? undefined}
            storeName={siteSettings?.store_name ?? undefined}
            supportPhone={siteSettings?.support_phone ?? undefined}
          />
          <Toaster richColors position="bottom-right" />
          </SlideshowProvider>
        </CartProvider>
      </body>
    </html>
  );
}
