"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Eye, Plus, Trash2, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/fetch";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageSection {
  id: string;
  label: string;
  visible: boolean;
  editable: boolean;
  fields?: Record<string, string>;
}

interface PageConfig {
  slug: string;
  label: string;
  url: string;
  sections: PageSection[];
}

// ── Default page configs ───────────────────────────────────────────────────────

const DEFAULT_PAGES: PageConfig[] = [
  {
    slug: "home",
    label: "Home",
    url: "/",
    sections: [
      { id: "hero", label: "Hero Slideshow", visible: true, editable: true, fields: {
        eyebrow: "Earth-first · Est. 2018",
        headline: "Where the Rift feeds the table.",
        description: "Heritage African cooking, hand-crafted in small batches from the volcanic soils of the Rift Valley. Delivered to your door with care.",
        cta_text: "Order Now",
        cta_url: "/shop",
        cta2_text: "Our Story",
        cta2_url: "/story",
      }},
      { id: "pillars", label: "Pillars (Regenerative, Slow-Cooked, Small Batch, Science-Backed)", visible: true, editable: false },
      { id: "story", label: "Story / Manifesto Section", visible: true, editable: true, fields: {
        eyebrow: "The Rift & Root Promise",
        headline: "A bridge between ancestral wisdom and modern wellness.",
        body: "Every ingredient is hand-selected, honoring the rhythms of nature and the generations of farmers who have tended this land.",
        quote: "We cook the way our grandmothers did — slowly, with reverence, and with peppers that still remember the sun.",
        cta_text: "Learn more about our roots",
        cta_url: "/story",
      }},
      { id: "testimonials", label: "Testimonials", visible: true, editable: false },
      { id: "newsletter", label: "Newsletter / CTA Banner", visible: true, editable: true, fields: {
        headline: "Seasonal recipes, early crop drops & 10% off your first order.",
        subtext: "We respect your inbox as much as we respect our land.",
        cta_text: "Subscribe",
      }},
    ],
  },
  {
    slug: "shop",
    label: "Shop / Menu",
    url: "/shop",
    sections: [
      { id: "hero", label: "Hero Header", visible: true, editable: true, fields: {
        eyebrow: "Our Catalogue",
        headline: "Artisanal nourishment.",
        description: "A living collection of heritage meals and pantry goods — each shaped by the season and the hands that make it.",
      }},
      { id: "search_filters", label: "Search & Category Filters", visible: true, editable: false },
      { id: "product_grid", label: "Product Grid", visible: true, editable: false },
      { id: "cta", label: "Bottom CTA", visible: true, editable: true, fields: {
        headline: "Can't decide? Let us help.",
        cta_text: "Chat on WhatsApp",
      }},
    ],
  },
  {
    slug: "about",
    label: "About Us",
    url: "/about",
    sections: [
      { id: "hero", label: "Hero Header", visible: true, editable: true, fields: {
        eyebrow: "Our Story",
        headline: "Where the Rift Valley feeds the world.",
        description: "We started with a single question: what would African food look like if it never stopped listening to the land?",
      }},
      { id: "stats", label: "Stats Strip (42 farms, 6+ years, etc.)", visible: true, editable: false },
      { id: "mission_vision", label: "Mission & Vision", visible: true, editable: false },
      { id: "timeline", label: "Timeline / Milestones", visible: true, editable: false },
      { id: "values", label: "Values Grid", visible: true, editable: false },
      { id: "team", label: "Team Members", visible: true, editable: false },
      { id: "cta", label: "Bottom CTA", visible: true, editable: true, fields: {
        headline: "Ready to taste the difference?",
        cta_text: "Shop Now",
        cta_url: "/shop",
      }},
    ],
  },
  {
    slug: "community",
    label: "Community",
    url: "/community",
    sections: [
      { id: "hero", label: "Hero Header", visible: true, editable: true, fields: {
        eyebrow: "Join the Community",
        headline: "Food is better shared.",
        description: "2,400+ members across Kenya eating better, cooking together, and supporting the farmers who grow our food.",
      }},
      { id: "stats", label: "Community Stats", visible: true, editable: false },
      { id: "benefits", label: "Member Benefits", visible: true, editable: false },
      { id: "testimonials", label: "Community Testimonials", visible: true, editable: false },
      { id: "social", label: "Social Channels", visible: true, editable: false },
      { id: "cta", label: "Join CTA", visible: true, editable: true, fields: {
        headline: "Join 2,400+ members eating better.",
        cta_text: "Join on WhatsApp",
      }},
    ],
  },
  {
    slug: "contact",
    label: "Contact",
    url: "/contact",
    sections: [
      { id: "hero", label: "Hero Header", visible: true, editable: true, fields: {
        eyebrow: "Contact Us",
        headline: "Let's Connect",
        description: "Visit us at Kahawa Sukari, order via WhatsApp, or send us a message.",
      }},
      { id: "info_cards", label: "Contact Info Cards (Address, Email, Phone)", visible: true, editable: false },
      { id: "form", label: "Contact Form", visible: true, editable: false },
      { id: "map", label: "Map / Location", visible: true, editable: false },
    ],
  },
  {
    slug: "visit-us",
    label: "Visit Us",
    url: "/visit-us",
    sections: [
      { id: "hero", label: "Hero Header", visible: true, editable: true, fields: {
        eyebrow: "Visit Us",
        headline: "Come Eat with Us in Kahawa Sukari",
        description: "Experience the full Rift & Root menu — from signature pilau and rabbit wet fry to plantain kvass and goat milk tea.",
      }},
      { id: "location_details", label: "Location Details (Address, Hours, Phone)", visible: true, editable: false },
      { id: "what_to_expect", label: "What to Expect", visible: true, editable: false },
      { id: "directions", label: "How to Find Us", visible: true, editable: false },
      { id: "cta", label: "Can't Visit? We Deliver CTA", visible: true, editable: true, fields: {
        headline: "Can't Visit? We Deliver!",
        description: "Order ready meals for Nairobi delivery, or get our packaged products shipped anywhere in Kenya.",
        cta_text: "Order Online",
        cta_url: "/products",
      }},
    ],
  },
  {
    slug: "wholesale",
    label: "Wholesale",
    url: "/wholesale",
    sections: [
      { id: "hero", label: "Hero Header", visible: true, editable: true, fields: {
        eyebrow: "Wholesale & B2B",
        headline: "Partner with Rift & Root",
        description: "Bulk pricing for retailers, schools, hotels, and corporate clients.",
      }},
      { id: "buyer_types", label: "Buyer Types (Supermarkets, Schools, Hotels, Corporate)", visible: true, editable: false },
      { id: "products_table", label: "Wholesale Products & Pricing", visible: true, editable: false },
      { id: "benefits", label: "Why Partner With Us", visible: true, editable: false },
      { id: "inquiry_form", label: "Wholesale Inquiry Form", visible: true, editable: false },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);
  const [activePage, setActivePage] = useState("home");
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("hero");

  const page = pages.find((p) => p.slug === activePage)!;

  function updateSection(sectionId: string, key: string, value: string | boolean) {
    setPages((prev) => prev.map((p) => {
      if (p.slug !== activePage) return p;
      return {
        ...p,
        sections: p.sections.map((s) => {
          if (s.id !== sectionId) return s;
          if (key === "visible") return { ...s, visible: value as boolean };
          return { ...s, fields: { ...s.fields, [key]: value as string } };
        }),
      };
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/pages", {
        method: "POST",
        body: JSON.stringify({ slug: activePage, config: page }),
      });
      if (res.ok) {
        toast.success(`${page.label} page saved`);
      } else {
        // Save to localStorage as fallback
        localStorage.setItem(`page_config_${activePage}`, JSON.stringify(page));
        toast.success(`${page.label} saved locally`);
      }
    } catch {
      localStorage.setItem(`page_config_${activePage}`, JSON.stringify(page));
      toast.success(`${page.label} saved locally`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Pages</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage sections, content and visibility for each page
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href={page.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-muted">
            <Eye size={14} /> Preview
          </a>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Page selector sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">Pages</p>
          {pages.map((p) => (
            <button key={p.slug} onClick={() => { setActivePage(p.slug); setExpandedSection("hero"); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activePage === p.slug
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Sections editor */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-foreground">{page.label} — Sections</p>
            <p className="text-xs text-muted-foreground">{page.sections.filter(s => s.visible).length} of {page.sections.length} visible</p>
          </div>

          {page.sections.map((section, idx) => (
            <div key={section.id}
              className={`bg-card rounded-2xl border transition-all ${
                expandedSection === section.id ? "border-primary/30 shadow-sm" : "border-border"
              }`}>
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="text-muted-foreground/30 cursor-grab">
                  <GripVertical size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground/50 w-5">{idx + 1}</span>
                    <p className="text-sm font-semibold text-foreground truncate">{section.label}</p>
                    {section.editable && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Editable</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Visibility toggle */}
                  <button
                    onClick={() => updateSection(section.id, "visible", !section.visible)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      section.visible
                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}>
                    {section.visible
                      ? <><ToggleRight size={14} /> Visible</>
                      : <><ToggleLeft size={14} /> Hidden</>
                    }
                  </button>

                  {/* Expand if editable */}
                  {section.editable && (
                    <button
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      {expandedSection === section.id ? "Close" : "Edit"}
                    </button>
                  )}
                </div>
              </div>

              {/* Editable fields */}
              {section.editable && expandedSection === section.id && section.fields && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                  {Object.entries(section.fields).map(([key, value]) => {
                    const isLong = key === "description" || key === "body" || key === "subtext";
                    const fieldLabel = key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());

                    return (
                      <div key={key}>
                        <label className={labelCls}>{fieldLabel}</label>
                        {isLong ? (
                          <textarea
                            value={value}
                            onChange={(e) => updateSection(section.id, key, e.target.value)}
                            rows={3}
                            className={inputCls + " resize-none"}
                          />
                        ) : (
                          <input
                            type={key.includes("url") ? "url" : "text"}
                            value={value}
                            onChange={(e) => updateSection(section.id, key, e.target.value)}
                            className={inputCls}
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-2 flex justify-end">
                    <button onClick={handleSave} disabled={saving}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50">
                      {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Save size={12} /> Save Section</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden overlay */}
              {!section.visible && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground/50 italic">
                    This section is hidden from the public page
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
