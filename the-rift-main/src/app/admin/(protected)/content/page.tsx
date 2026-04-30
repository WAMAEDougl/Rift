"use client";

import { useState, useEffect, useCallback } from "react";
import { Info, Users, Save, Loader2, Plus, Trash2, Eye, HelpCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/fetch";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Stat { value: string; label: string; }
interface Milestone { year: string; title: string; body: string; }
interface TeamMember { name: string; role: string; bio: string; image: string; }
interface Testimonial { name: string; location: string; stars: number; quote: string; product: string; image: string; }
interface Benefit { title: string; desc: string; }
interface SocialChannel { label: string; handle: string; href: string; followers: string; }

interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  stats: Stat[];
  milestones: Milestone[];
  team: TeamMember[];
}

interface CommunityContent {
  heroTitle: string;
  heroSubtitle: string;
  stats: Stat[];
  benefits: Benefit[];
  testimonials: Testimonial[];
  socialChannels: SocialChannel[];
  whatsappNumber: string;
}

// ── Default content (mirrors the static pages) ────────────────────────────────

const defaultAbout: AboutContent = {
  heroTitle: "Where the Rift Valley feeds the world.",
  heroSubtitle: "We started with a single question: what would African food look like if it never stopped listening to the land? Six years later, we're still answering it.",
  missionTitle: "Make ancestral nutrition accessible to every Kenyan family.",
  missionBody: "Sourcing locally, producing responsibly, and building products that make Africa proud — without compromising on taste, science, or integrity.",
  visionTitle: "To be Africa's most trusted heritage food brand.",
  visionBody: "Nourishing bodies, celebrating culture, and transforming local food systems — one small batch at a time.",
  stats: [
    { value: "42", label: "Partner Farms" },
    { value: "6+", label: "Years Crafting" },
    { value: "47", label: "Counties Reached" },
    { value: "100%", label: "Natural Ingredients" },
  ],
  milestones: [
    { year: "2018", title: "The First Pot", body: "What started as a weekend supper club in a Nairobi apartment became the seed of something bigger." },
    { year: "2020", title: "Roots in the Rift Valley", body: "We partnered with 12 smallholder farms across the Rift Valley." },
    { year: "2022", title: "Packaged for Kenya", body: "Our heritage flour blends launched as packaged products, shipping to all 47 counties." },
    { year: "2024", title: "Science Meets Tradition", body: "We introduced Kenya's first plantain probiotic kvass and synbiotic porridge." },
  ],
  team: [
    { name: "Prisca Kiragu", role: "Founder & Food Scientist", bio: "BSc Food Science & Technology (JKUAT). Specialist in fermentation, gut health, and indigenous grain value addition.", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop&crop=face" },
    { name: "James Mwangi", role: "Head of Sourcing", bio: "15 years working with smallholder farmers across the Rift Valley.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop&crop=face" },
    { name: "Amina Odhiambo", role: "Head of Operations", bio: "Former supply chain lead at a Nairobi FMCG company.", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop&crop=face" },
  ],
};

const defaultCommunity: CommunityContent = {
  heroTitle: "Food is better shared.",
  heroSubtitle: "2,400+ members across Kenya eating better, cooking together, and supporting the farmers who grow our food.",
  stats: [
    { value: "2,400+", label: "Community Members" },
    { value: "180+", label: "Recipes Shared" },
    { value: "47", label: "Counties Represented" },
    { value: "4.9★", label: "Average Rating" },
  ],
  benefits: [
    { title: "Weekly Recipes", desc: "New heritage recipes every week — fermentation guides, meal prep ideas, and seasonal specials." },
    { title: "Members-Only Offers", desc: "Early access to new products, community-only discounts, and flash sales before anyone else." },
    { title: "Share & Get Featured", desc: "Post your meal photos, tag us, and get featured on our social channels and newsletter." },
    { title: "Health Journeys", desc: "Real stories of gut health transformation, weight management, and better everyday eating." },
  ],
  testimonials: [],
  socialChannels: [
    { label: "Instagram", handle: "@riftandroot", href: "#", followers: "3.2K" },
    { label: "Facebook", handle: "Rift & Root Kenya", href: "#", followers: "1.8K" },
    { label: "YouTube", handle: "Rift & Root", href: "#", followers: "940" },
  ],
  whatsappNumber: "254713280550",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";
const sectionCls = "bg-card rounded-2xl border border-border p-6 space-y-5";

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const [tab, setTab] = useState<"about" | "community" | "faqs" | "testimonials">("about");

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="font-display text-3xl font-medium text-foreground">Content</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage all user-facing content from one place</p>
      </div>

      <div className="flex flex-wrap items-center bg-muted/30 rounded-xl p-1 gap-1 w-fit">
        {([
          ["about", "About Page", Info],
          ["community", "Community Page", Users],
          ["faqs", "FAQs", HelpCircle],
          ["testimonials", "Testimonials", Star],
        ] as const).map(([val, label, Icon]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${tab === val ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "about" && <AboutEditor />}
      {tab === "community" && <CommunityEditor />}
      {tab === "faqs" && <FAQEditor />}
      {tab === "testimonials" && <TestimonialsEditor />}
    </div>
  );
}

// ── About Editor ──────────────────────────────────────────────────────────────

function AboutEditor() {
  const [content, setContent] = useState<AboutContent>(defaultAbout);
  const [saving, setSaving] = useState(false);

  function setField(field: keyof AboutContent, value: unknown) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  function updateStat(i: number, key: keyof Stat, value: string) {
    const updated = [...content.stats];
    updated[i] = { ...updated[i], [key]: value };
    setField("stats", updated);
  }

  function updateMilestone(i: number, key: keyof Milestone, value: string) {
    const updated = [...content.milestones];
    updated[i] = { ...updated[i], [key]: value };
    setField("milestones", updated);
  }

  function updateTeam(i: number, key: keyof TeamMember, value: string) {
    const updated = [...content.team];
    updated[i] = { ...updated[i], [key]: value };
    setField("team", updated);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("About page content saved — update src/app/about/page.tsx to persist");
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className={sectionCls}>
        <h2 className="font-display text-base font-medium text-foreground flex items-center gap-2"><Info size={15} className="text-primary" /> Hero Section</h2>
        <div>
          <label className={labelCls}>Hero Title</label>
          <input type="text" value={content.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Hero Subtitle</label>
          <textarea value={content.heroSubtitle} onChange={(e) => setField("heroSubtitle", e.target.value)} rows={3} className={inputCls + " resize-none"} />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className={sectionCls}>
        <h2 className="font-display text-base font-medium text-foreground">Mission & Vision</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Vision Title</label>
              <input type="text" value={content.visionTitle} onChange={(e) => setField("visionTitle", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vision Body</label>
              <textarea value={content.visionBody} onChange={(e) => setField("visionBody", e.target.value)} rows={3} className={inputCls + " resize-none"} />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Mission Title</label>
              <input type="text" value={content.missionTitle} onChange={(e) => setField("missionTitle", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mission Body</label>
              <textarea value={content.missionBody} onChange={(e) => setField("missionBody", e.target.value)} rows={3} className={inputCls + " resize-none"} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground">Stats Strip</h2>
          <button onClick={() => setField("stats", [...content.stats, { value: "", label: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Plus size={12} /> Add stat
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {content.stats.map((s, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
              <input type="text" value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="42" className={inputCls + " text-center font-display text-lg"} />
              <input type="text" value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Partner Farms" className={inputCls + " text-center text-xs"} />
              <button onClick={() => setField("stats", content.stats.filter((_, j) => j !== i))}
                className="w-full text-xs text-destructive hover:underline">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground">Timeline / Milestones</h2>
          <button onClick={() => setField("milestones", [...content.milestones, { year: "", title: "", body: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Plus size={12} /> Add milestone
          </button>
        </div>
        <div className="space-y-4">
          {content.milestones.map((m, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Year</label>
                  <input type="text" value={m.year} onChange={(e) => updateMilestone(i, "year", e.target.value)} placeholder="2024" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Title</label>
                  <input type="text" value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Body</label>
                <textarea value={m.body} onChange={(e) => updateMilestone(i, "body", e.target.value)} rows={2} className={inputCls + " resize-none"} />
              </div>
              <button onClick={() => setField("milestones", content.milestones.filter((_, j) => j !== i))}
                className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground">Team Members</h2>
          <button onClick={() => setField("team", [...content.team, { name: "", role: "", bio: "", image: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Plus size={12} /> Add member
          </button>
        </div>
        <div className="space-y-4">
          {content.team.map((m, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Name</label>
                  <input type="text" value={m.name} onChange={(e) => updateTeam(i, "name", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input type="text" value={m.role} onChange={(e) => updateTeam(i, "role", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Bio</label>
                <textarea value={m.bio} onChange={(e) => updateTeam(i, "bio", e.target.value)} rows={2} className={inputCls + " resize-none"} />
              </div>
              <div>
                <label className={labelCls}>Photo URL</label>
                <input type="url" value={m.image} onChange={(e) => updateTeam(i, "image", e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
              <button onClick={() => setField("team", content.team.filter((_, j) => j !== i))}
                className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button>
            </div>
          ))}
        </div>
      </div>

      <SaveBar saving={saving} onSave={handleSave} previewHref="/about" />
    </div>
  );
}

// ── Community Editor ──────────────────────────────────────────────────────────

function CommunityEditor() {
  const [content, setContent] = useState<CommunityContent>(defaultCommunity);
  const [saving, setSaving] = useState(false);

  function setField(field: keyof CommunityContent, value: unknown) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  function updateBenefit(i: number, key: keyof Benefit, value: string) {
    const updated = [...content.benefits];
    updated[i] = { ...updated[i], [key]: value };
    setField("benefits", updated);
  }

  function updateStat(i: number, key: keyof Stat, value: string) {
    const updated = [...content.stats];
    updated[i] = { ...updated[i], [key]: value };
    setField("stats", updated);
  }

  function updateSocial(i: number, key: keyof SocialChannel, value: string) {
    const updated = [...content.socialChannels];
    updated[i] = { ...updated[i], [key]: value };
    setField("socialChannels", updated);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Community page content saved — update src/app/community/page.tsx to persist");
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className={sectionCls}>
        <h2 className="font-display text-base font-medium text-foreground flex items-center gap-2"><Users size={15} className="text-primary" /> Hero Section</h2>
        <div>
          <label className={labelCls}>Hero Title</label>
          <input type="text" value={content.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Hero Subtitle</label>
          <textarea value={content.heroSubtitle} onChange={(e) => setField("heroSubtitle", e.target.value)} rows={3} className={inputCls + " resize-none"} />
        </div>
        <div>
          <label className={labelCls}>WhatsApp Number (for Join button)</label>
          <input type="text" value={content.whatsappNumber} onChange={(e) => setField("whatsappNumber", e.target.value)} className={inputCls} placeholder="254713280550" />
        </div>
      </div>

      {/* Stats */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground">Stats Strip</h2>
          <button onClick={() => setField("stats", [...content.stats, { value: "", label: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Plus size={12} /> Add stat
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {content.stats.map((s, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
              <input type="text" value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="2,400+" className={inputCls + " text-center font-display text-lg"} />
              <input type="text" value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Community Members" className={inputCls + " text-center text-xs"} />
              <button onClick={() => setField("stats", content.stats.filter((_, j) => j !== i))}
                className="w-full text-xs text-destructive hover:underline">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground">Community Benefits</h2>
          <button onClick={() => setField("benefits", [...content.benefits, { title: "", desc: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Plus size={12} /> Add benefit
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {content.benefits.map((b, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div>
                <label className={labelCls}>Title</label>
                <input type="text" value={b.title} onChange={(e) => updateBenefit(i, "title", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={b.desc} onChange={(e) => updateBenefit(i, "desc", e.target.value)} rows={2} className={inputCls + " resize-none"} />
              </div>
              <button onClick={() => setField("benefits", content.benefits.filter((_, j) => j !== i))}
                className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Channels */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-foreground">Social Channels</h2>
          <button onClick={() => setField("socialChannels", [...content.socialChannels, { label: "", handle: "", href: "#", followers: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Plus size={12} /> Add channel
          </button>
        </div>
        <div className="space-y-3">
          {content.socialChannels.map((s, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Platform</label>
                <input type="text" value={s.label} onChange={(e) => updateSocial(i, "label", e.target.value)} placeholder="Instagram" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Handle</label>
                <input type="text" value={s.handle} onChange={(e) => updateSocial(i, "handle", e.target.value)} placeholder="@riftandroot" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>URL</label>
                <input type="url" value={s.href} onChange={(e) => updateSocial(i, "href", e.target.value)} placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Followers</label>
                <input type="text" value={s.followers} onChange={(e) => updateSocial(i, "followers", e.target.value)} placeholder="3.2K" className={inputCls} />
              </div>
              <button onClick={() => setField("socialChannels", content.socialChannels.filter((_, j) => j !== i))}
                className="col-span-full text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button>
            </div>
          ))}
        </div>
      </div>

      <SaveBar saving={saving} onSave={handleSave} previewHref="/community" />
    </div>
  );
}

// ── FAQ Editor ────────────────────────────────────────────────────────────────

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

const FAQ_CATEGORIES = [
  { value: "ordering", label: "Ordering" },
  { value: "shipping", label: "Shipping & Delivery" },
  { value: "products", label: "Products" },
  { value: "health", label: "Health & Nutrition" },
  { value: "restaurant", label: "Restaurant" },
  { value: "wholesale", label: "Wholesale" },
  { value: "general", label: "General" },
];

function FAQEditor() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newFaq, setNewFaq] = useState<FAQItem>({ question: "", answer: "", category: "ordering", sort_order: 0, is_active: true });

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/faqs");
    const json = await res.json();
    if (json.data) setFaqs(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  async function handleSave(faq: FAQItem) {
    setSaving(faq.id ?? "new");
    const url = faq.id ? `/api/admin/faqs/${faq.id}` : "/api/admin/faqs";
    const method = faq.id ? "PATCH" : "POST";
    const res = await adminFetch(url, { method, body: JSON.stringify(faq) });
    const json = await res.json();
    setSaving(null);
    if (!res.ok) { toast.error(json.error?.message ?? "Save failed"); return; }
    toast.success(faq.id ? "FAQ updated" : "FAQ created");
    setAdding(false);
    setNewFaq({ question: "", answer: "", category: "ordering", sort_order: 0, is_active: true });
    fetchFaqs();
  }

  async function handleDelete(id: string) {
    const res = await adminFetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Delete failed"); return; }
    toast.success("FAQ deleted");
    fetchFaqs();
  }

  function updateFaq(i: number, key: keyof FAQItem, value: string | boolean | number) {
    setFaqs((prev) => prev.map((f, idx) => idx === i ? { ...f, [key]: value } : f));
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading FAQs…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-medium text-foreground">FAQs</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{faqs.length} questions — shown on the FAQ page</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-90">
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      {/* New FAQ form */}
      {adding && (
        <div className={sectionCls + " border-primary/30"}>
          <h3 className="font-semibold text-sm text-foreground">New FAQ</h3>
          <div>
            <label className={labelCls}>Category</label>
            <select value={newFaq.category} onChange={(e) => setNewFaq((p) => ({ ...p, category: e.target.value }))} className={inputCls}>
              {FAQ_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Question *</label>
            <input type="text" value={newFaq.question} onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))} className={inputCls} placeholder="How do I place an order?" />
          </div>
          <div>
            <label className={labelCls}>Answer *</label>
            <textarea value={newFaq.answer} onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="You can order by..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleSave(newFaq)} disabled={saving === "new" || !newFaq.question || !newFaq.answer}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving === "new" ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save FAQ"}
            </button>
            <button onClick={() => setAdding(false)} className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {/* Existing FAQs */}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.id} className={sectionCls}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={faq.category} onChange={(e) => updateFaq(i, "category", e.target.value)} className={inputCls}>
                      {FAQ_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Question</label>
                    <input type="text" value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Answer</label>
                  <textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} rows={2} className={inputCls + " resize-none"} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button onClick={() => handleSave(faq)} disabled={saving === faq.id}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl disabled:opacity-50">
                {saving === faq.id ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><Save size={12} /> Save</>}
              </button>
              <button onClick={() => updateFaq(i, "is_active", !faq.is_active)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border ${faq.is_active ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                {faq.is_active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => faq.id && handleDelete(faq.id)}
                className="ml-auto text-xs text-destructive hover:underline flex items-center gap-1">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Testimonials Editor ───────────────────────────────────────────────────────

interface TestimonialItem {
  id?: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  product: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

function TestimonialsEditor() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<TestimonialItem>({ name: "", role: "", location: "", quote: "", rating: 5, product: "", is_featured: false, is_active: true, sort_order: 0 });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/testimonials");
    const json = await res.json();
    if (json.data) setItems(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleSave(item: TestimonialItem) {
    setSaving(item.id ?? "new");
    const url = item.id ? `/api/admin/testimonials/${item.id}` : "/api/admin/testimonials";
    const method = item.id ? "PATCH" : "POST";
    const res = await adminFetch(url, { method, body: JSON.stringify(item) });
    const json = await res.json();
    setSaving(null);
    if (!res.ok) { toast.error(json.error?.message ?? "Save failed"); return; }
    toast.success(item.id ? "Testimonial updated" : "Testimonial created");
    setAdding(false);
    setNewItem({ name: "", role: "", location: "", quote: "", rating: 5, product: "", is_featured: false, is_active: true, sort_order: 0 });
    fetchItems();
  }

  async function handleDelete(id: string) {
    const res = await adminFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Delete failed"); return; }
    toast.success("Testimonial deleted");
    fetchItems();
  }

  function updateItem(i: number, key: keyof TestimonialItem, value: string | boolean | number) {
    setItems((prev) => prev.map((t, idx) => idx === i ? { ...t, [key]: value } : t));
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading testimonials…</div>;

  const TestimonialForm = ({ item, onChange, onSave, onCancel, savingId }: {
    item: TestimonialItem;
    onChange: (key: keyof TestimonialItem, value: string | boolean | number) => void;
    onSave: () => void;
    onCancel?: () => void;
    savingId: string | null;
  }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Name *</label>
          <input type="text" value={item.name} onChange={(e) => onChange("name", e.target.value)} className={inputCls} placeholder="Wanjiru K." />
        </div>
        <div>
          <label className={labelCls}>Role / Title</label>
          <input type="text" value={item.role} onChange={(e) => onChange("role", e.target.value)} className={inputCls} placeholder="Teacher" />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input type="text" value={item.location} onChange={(e) => onChange("location", e.target.value)} className={inputCls} placeholder="Westlands, Nairobi" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Quote *</label>
        <textarea value={item.quote} onChange={(e) => onChange("quote", e.target.value)} rows={2} className={inputCls + " resize-none"} placeholder="The fermented porridge blend has completely changed my mornings..." />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Rating (1-5)</label>
          <select value={item.rating} onChange={(e) => onChange("rating", parseInt(e.target.value))} className={inputCls}>
            {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Product</label>
          <input type="text" value={item.product} onChange={(e) => onChange("product", e.target.value)} className={inputCls} placeholder="Synbiotic Porridge" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <button type="button" onClick={() => onChange("is_featured", !item.is_featured)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.is_featured ? "bg-primary" : "bg-muted"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${item.is_featured ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className="text-xs font-medium">Featured</span>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <button type="button" onClick={() => onChange("is_active", !item.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.is_active ? "bg-green-500" : "bg-muted"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${item.is_active ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className="text-xs font-medium">Active</span>
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-border">
        <button onClick={onSave} disabled={savingId !== null || !item.name || !item.quote}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {savingId !== null ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save</>}
        </button>
        {onCancel && <button onClick={onCancel} className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold">Cancel</button>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-medium text-foreground">Testimonials</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{items.filter(t => t.is_featured).length} featured — shown on homepage</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-90">
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {adding && (
        <div className={sectionCls + " border-primary/30"}>
          <h3 className="font-semibold text-sm text-foreground">New Testimonial</h3>
          <TestimonialForm
            item={newItem}
            onChange={(k, v) => setNewItem((p) => ({ ...p, [k]: v }))}
            onSave={() => handleSave(newItem)}
            onCancel={() => setAdding(false)}
            savingId={saving === "new" ? "new" : null}
          />
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.id} className={sectionCls}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{item.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.is_featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">Featured</span>}
                <button onClick={() => item.id && handleDelete(item.id)} className="text-destructive hover:bg-destructive/10 w-7 h-7 flex items-center justify-center rounded-lg transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <TestimonialForm
              item={item}
              onChange={(k, v) => updateItem(i, k, v)}
              onSave={() => handleSave(item)}
              savingId={saving === item.id ? item.id : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Save Bar ──────────────────────────────────────────────────────────────────

function SaveBar({ saving, onSave, previewHref }: { saving: boolean; onSave: () => void; previewHref: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-card rounded-2xl border border-border p-4">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400 flex-1">
        Changes are previewed in the admin. To persist permanently, update the corresponding page file in <code className="font-mono">src/app/</code>.
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <a href={previewHref} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-muted">
          <Eye size={14} /> Preview
        </a>
        <button onClick={onSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
