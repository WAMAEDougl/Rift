export interface FAQ {
  question: string;
  answer: string;
  category: "ordering" | "shipping" | "products" | "health" | "restaurant" | "wholesale";
}

export const faqCategories = [
  { slug: "all", label: "All Questions" },
  { slug: "ordering", label: "Ordering" },
  { slug: "shipping", label: "Shipping & Delivery" },
  { slug: "products", label: "Products" },
  { slug: "health", label: "Health & Nutrition" },
  { slug: "restaurant", label: "Restaurant" },
  { slug: "wholesale", label: "Wholesale" },
];

export const faqs: FAQ[] = [
  // Ordering
  { category: "ordering", question: "How do I place an order?", answer: "You can order directly through our website by adding items to your cart and checking out, or order via WhatsApp at 0713 280 550. We accept orders through both channels." },
  { category: "ordering", question: "What payment methods do you accept?", answer: "We accept M-Pesa (our primary payment method) and Cash on Delivery for Nairobi orders. M-Pesa payments are processed instantly via STK Push — you'll get a prompt on your phone." },
  { category: "ordering", question: "Can I cancel or modify my order?", answer: "Yes, you can cancel or modify within 15 minutes of placing your order. After preparation begins, modifications aren't possible. Contact us on WhatsApp (0713 280 550) immediately if you need changes." },
  { category: "ordering", question: "Is there a minimum order amount?", answer: "No minimum order for restaurant dine-in or pickup. For delivery within Nairobi, we recommend a minimum of KES 500. For countrywide shipping of packaged products, there's no minimum." },

  // Shipping
  { category: "shipping", question: "Do you deliver countrywide?", answer: "Yes! Our packaged products (Ugali Blend, Uji Blend, Custom Blends) ship to all 47 counties via courier. Ready meals and beverages are available for delivery within Nairobi only." },
  { category: "shipping", question: "How much does delivery cost?", answer: "Nairobi delivery: KES 200 (free on orders over KES 2,000). Countrywide shipping for packaged products varies by location — typically KES 300-500 depending on distance. We'll confirm the exact cost before dispatch." },
  { category: "shipping", question: "How long does delivery take?", answer: "Nairobi: 30-90 minutes for ready meals. Countrywide: 1-3 business days for packaged products via courier service. You'll receive tracking information via SMS." },
  { category: "shipping", question: "Do you deliver to my area?", answer: "We deliver ready meals within Nairobi (Kahawa Sukari, Thika Road corridor, and surrounding areas). Packaged products ship anywhere in Kenya. Contact us on WhatsApp to confirm your specific area." },

  // Products
  { category: "products", question: "Are your products natural?", answer: "Yes, 100%. All Ayola products use natural ingredients with no artificial preservatives, no MSG, no artificial colors or flavors. Our flour blends and beverages are made from indigenous Kenyan grains and natural fermentation." },
  { category: "products", question: "What is synbiotic porridge?", answer: "Synbiotic means it contains both probiotics (beneficial live bacteria) and prebiotics (food for those bacteria). Our synbiotic porridge is fermented using heritage grains to deliver both — maximizing gut health benefits." },
  { category: "products", question: "What makes your ugali blend different?", answer: "Our Special Ugali Blend is formulated by food scientist Prisca Kiragu. It combines traditional maize with indigenous grains (finger millet, sorghum, amaranth) for significantly more iron, fiber, and minerals than regular ugali — while maintaining the texture and taste you love." },
  { category: "products", question: "Can I use your flour blends for baking?", answer: "Absolutely! Many customers use our Ugali Blend to make healthier bread (substitute 30-50% of wheat flour), pancakes, and chapati. Our Uji Blend is great for porridge, smoothie bowls, and as a nutritional supplement in baked goods." },
  { category: "products", question: "What is plantain probiotic kvass?", answer: "Kvass is a traditional fermented beverage. We've innovated it using plantain — rich in resistant starch (a powerful prebiotic). The result is a naturally fizzy, tangy, refreshing drink packed with live probiotics. It's the first of its kind in Kenya's food service sector." },

  // Health
  { category: "health", question: "Are your products suitable for diabetics?", answer: "Our heritage grain products have a lower glycemic index than standard refined flour. However, please consult your doctor before making dietary changes. We can formulate custom blends for specific dietary needs — contact us." },
  { category: "health", question: "Do you have vegan options?", answer: "Yes! Our Vegetarian/Vegan Combo, all packaged flour blends, plantain kvass, and synbiotic porridge are fully vegan. Goat milk tea and some meal combos contain animal products — check individual product pages for details." },
  { category: "health", question: "Are your products gluten-free?", answer: "Finger millet, sorghum, and amaranth (main ingredients in our blends) are naturally gluten-free. However, our kitchen also handles wheat products, so we can't guarantee zero cross-contamination. Contact us if you have celiac disease." },
  { category: "health", question: "Who formulates your products?", answer: "All products are formulated by our founder, Prisca Kiragu — a trained food scientist from Jomo Kenyatta University of Agriculture and Technology (JKUAT). She specializes in fermentation, gut health, and indigenous grain value addition." },

  // Restaurant
  { category: "restaurant", question: "Where is your restaurant located?", answer: "Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari — near Quickmatt Supermarket, along Thika Road, Nairobi. We're easy to find!" },
  { category: "restaurant", question: "What are your operating hours?", answer: "Monday to Saturday: 7:00 AM - 8:00 PM. Sunday: 8:00 AM - 6:00 PM. Hours may vary on holidays — check our Facebook page for updates." },
  { category: "restaurant", question: "Do I need to book a table?", answer: "No reservation needed for regular visits. For large groups (6+ people) or special occasions, we recommend calling ahead: 0713 280 550." },
  { category: "restaurant", question: "Do you cater for events?", answer: "Yes! We cater for corporate events, parties, and gatherings. Contact us via WhatsApp (0713 280 550) with your event details — number of guests, dietary requirements, and preferred menu items." },

  // Wholesale
  { category: "wholesale", question: "Do you sell wholesale?", answer: "Yes! We offer bulk pricing for our packaged flour blends. Minimum wholesale order is 50 units per product. Schools, hospitals, hotels, and retailers welcome. Contact us for a quote." },
  { category: "wholesale", question: "Can you supply to supermarkets?", answer: "We're actively looking for retail partners. If you're a supermarket buyer, contact ayola.foods.kenya@gmail.com or call 0723 846 724 to discuss listing our products." },
  { category: "wholesale", question: "Do you offer white-label/custom products?", answer: "Yes, our food scientist can formulate custom flour blends and beverages for your brand. Minimum quantities apply. Contact us to discuss your requirements." },
];

export function getFAQsByCategory(category: string): FAQ[] {
  if (category === "all") return faqs;
  return faqs.filter((f) => f.category === category);
}
