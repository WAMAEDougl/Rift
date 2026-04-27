import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Everything you need to know about Rift & Root — our products, ordering, and delivery.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
