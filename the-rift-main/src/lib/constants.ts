// Rift & Root — Business Constants
// All verified contact details and business info

export const BUSINESS = {
  name: "Rift & Root",
  legalName: "Rift & Root Limited",
  tagline: "Eat Healthy, Enjoy Life",
  founder: "Prisca Kiragu",
  founderTitle: "Food Scientist (JKUAT)",

  // Contact
  phone1: "0713 280 550",
  phone2: "0723 846 724",
  email: "ayola.foods.kenya@gmail.com",
  whatsapp: "254713280550",

  // Location
  address: "Ruhan Plaza, Ground Floor Room 23",
  area: "Kahawa Sukari",
  landmark: "Near Quickmatt Supermarket",
  road: "Along Thika Road",
  city: "Nairobi",
  country: "Kenya",
  fullAddress: "Ruhan Plaza, Kahawa Sukari, Ground Floor Room 23, Near Quickmatt Supermarket, Thika Road, Nairobi",

  // Google Maps (verified Place ID from google.com/maps/place/ayolafoodke)
  mapLat: -1.1962,
  mapLng: 36.9487,
  mapZoom: 16,
  googlePlaceId: "0x182f3ffd56859239:0xb5741c3010640f68",
  googleMapsUrl: "https://www.google.com/maps/place/ayolafoodke/data=!4m2!3m1!1s0x182f3ffd56859239:0xb5741c3010640f68",

  // Social Media
  facebook: "https://www.facebook.com/p/Ayola-Foods-Kenya-100087278121034/",
  instagram: "https://www.instagram.com/ayolafoods/",
  instagramHandle: "@ayolafoods",
  tiktok: "https://www.tiktok.com/@priscakiragu",
  tiktokHandle: "@priscakiragu",
  youtube: "https://www.youtube.com/watch?v=0RmZ4vwpAME",

  // Business details
  operatingSince: "2024",
  facebookLikes: "1,471",
} as const;

export const WHATSAPP_ORDER_URL = `https://wa.me/${BUSINESS.whatsapp}`;

export function getWhatsAppOrderLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}
