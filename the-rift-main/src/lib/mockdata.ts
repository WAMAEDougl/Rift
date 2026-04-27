// Mock data for About page

export interface TimelineItem {
  title: string
  description: string
}

export interface ValueItem {
  name: string
  desc: string
  icon: string
}

export interface FounderInfo {
  name: string
  title: string
  initials: string
  description: string
  credentials: string[]
}

export interface AboutHero {
  tagline: string
  title: string
  description: string
}

export interface SectionTitle {
  tagline: string
  title: string
  description?: string
}

export interface MissionVision {
  vision: {
    title: string
    description: string
  }
  mission: {
    title: string
    description: string
  }
}

export const aboutTimeline: TimelineItem[] = [
  {
    title: "The Vision — 2024",
    description:
      "Founded on the principle that great food starts with great ingredients, our company began with a clear vision to transform everyday meals into extraordinary experiences.",
  },
  {
    title: "The Kitchen Opens",
    description:
      "Our first culinary space opened as a hub for innovation and flavor — serving thoughtfully crafted dishes and beverages built from real, quality ingredients.",
  },
  {
    title: "Products Launch Nationwide",
    description:
      "Our signature blends and packaged goods launched across the country, bringing chef-quality flavors into homes everywhere with convenient, ready-to-enjoy options.",
  },
  {
    title: "Innovation & Growth",
    description:
      "We introduced new product lines featuring unique flavor combinations and expanded our reach, staying true to our commitment to quality and creativity.",
  },
]

export const aboutValues: ValueItem[] = [
  {
    name: "Excellence",
    desc: "We pursue outstanding quality in everything we create, from ingredients to final product.",
    icon: "🏆",
  },
  {
    name: "Sustainability",
    desc: "We partner with environmentally conscious suppliers and minimize waste through thoughtful practices.",
    icon: "🌍",
  },
  {
    name: "Community",
    desc: "We build strong relationships with local producers, team members, and customers alike.",
    icon: "🤝",
  },
  {
    name: "Innovation",
    desc: "We embrace creative thinking to develop unique solutions and memorable experiences.",
    icon: "💡",
  },
  {
    name: "Transparency",
    desc: "We believe in open communication about our processes, sourcing, and business practices.",
    icon: "🔍",
  },
  {
    name: "Integrity",
    desc: "We operate with honesty and ethical standards in every decision we make.",
    icon: "⭐",
  },
]

export const founderInfo: FounderInfo = {
  name: "Alex Morgan",
  title: "Founder & CEO",
  initials: "AM",
  description:
    "A passionate entrepreneur with extensive experience in culinary arts and business development, Alex founded the company to bridge the gap between traditional flavors and modern convenience.",
  credentials: [
    "Culinary Arts Degree — Le Cordon Bleu",
    "Certified Food Entrepreneur",
    "Sustainability Leadership Program",
    "Industry Innovation Award Winner",
  ],
}

export const aboutHero: AboutHero = {
  tagline: "About Our Story",
  title: "Our Journey",
  description:
    "We're dedicated to creating exceptional food experiences that bring people together and celebrate the joy of shared meals.",
}

export const ourStory: SectionTitle = {
  tagline: "How it all began",
  title: "Our Story",
  description:
    "What started as a small passion project has grown into a thriving community of food lovers who appreciate quality, authenticity, and innovation.",
}

export const missionVision: MissionVision = {
  vision: {
    title: "Our Vision",
    description:
      "To be the most trusted and beloved food brand that enriches daily life through exceptional quality and meaningful connections.",
  },
  mission: {
    title: "Our Mission",
    description:
      "To create delicious, thoughtfully crafted food experiences that inspire joy, foster community, and promote sustainable living.",
  },
}