import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Visit us at Kahawa Sukari, order via WhatsApp, or send us a message. We deliver across Nairobi and ship packaged products countrywide.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
