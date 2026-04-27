import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wholesale & B2B",
  description:
    "Partner with Rift & Root. We supply supermarkets, schools, hotels, restaurants, and corporate events with premium heritage flour blends and catering services.",
};

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
