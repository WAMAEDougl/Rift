import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";

interface FooterSettings {
  store_name?: string | null;
  address?: string | null;
  city?: string | null;
  support_email?: string | null;
}

export function Footer({ settings }: { settings?: FooterSettings | null }) {
  const storeName = settings?.store_name ?? "Rift & Root";
  const address = settings?.address ?? "Ruhan Plaza, Ground Floor";
  const city = settings?.city ?? "Kahawa Sukari, Nairobi";
  const email = settings?.support_email ?? "hello@riftandroot.com";
  return (
    <footer className="ink-gradient mt-16 md:mt-32">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20 lg:px-10">
        <div className="grid gap-8 md:gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg">
                R
              </span>
              <span className="font-display text-xl tracking-tight text-white">
                {storeName}
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              Cultivating a legacy of natural nourishment and African artisanal craftsmanship
              since 2018. From the volcanic soils of the Rift Valley to your table.
            </p>
            <div className="mt-8 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Shop
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              <li><Link href="/shop" className="hover:text-accent transition-colors">Meals</Link></li>
              <li><Link href="/shop" className="hover:text-accent transition-colors">Beverages</Link></li>
              <li><Link href="/shop" className="hover:text-accent transition-colors">Pantry</Link></li>
              <li><Link href="/shop" className="hover:text-accent transition-colors">Gifting</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Help
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              <li><Link href="/returns" className="hover:text-accent transition-colors">Shipping</Link></li>
              <li><Link href="/wholesale" className="hover:text-accent transition-colors">Wholesale</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Our Roots
            </h4>
            <p className="mt-5 text-sm leading-relaxed text-white/75">
              {address}<br />
              {city}
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-block text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {storeName}. Earth-first sophistication.</p>
          <div className="flex gap-4 uppercase tracking-[0.2em]">
            <span>Sustainably Sourced</span>
            <span>·</span>
            <span>Hand-Packed in Nairobi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
