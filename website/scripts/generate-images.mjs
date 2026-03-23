import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAxM3zDg3i01Q5X4GXOXW68ERyhTyaObsY";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "products");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const productPrompts = [
  {
    filename: "pilau-combo.jpg",
    prompt: "Professional food photography of Kenyan pilau rice dish, richly spiced with whole spices visible (cardamom, cinnamon, cloves), served on a dark ceramic plate with minced meat, garnished with fresh coriander. Warm natural lighting, shallow depth of field, rustic wooden table background. Shot from 45-degree angle. Appetizing, premium restaurant quality. No text.",
  },
  {
    filename: "rabbit-combo.jpg",
    prompt: "Professional food photography of rabbit wet fry stew served with traditional African ugali (white maize meal) and fresh green leafy vegetables (sukuma wiki/kale). Dark ceramic plate, rich brown gravy with visible onions and tomatoes. Warm lighting, rustic setting. Top-down angle. Kenyan cuisine, premium restaurant quality. No text.",
  },
  {
    filename: "turkey-eggs-combo.jpg",
    prompt: "Professional food photography of large turkey eggs (scrambled, golden) served with toasted artisan bread slices and a colorful side salad. Rustic ceramic plate, warm morning light, breakfast setting. Fresh herbs garnish. Shot from 45-degree angle. Premium brunch quality. No text.",
  },
  {
    filename: "vegan-combo.jpg",
    prompt: "Professional food photography of a vibrant vegan meal plate with colorful roasted vegetables, heritage grain pilaf, fresh leafy greens, and legume stew. Earth-tone ceramic plate, natural lighting, overhead shot. African-inspired healthy cuisine. Rich colors, appetizing. No text.",
  },
  {
    filename: "plantain-kvass.jpg",
    prompt: "Professional beverage photography of a golden-amber fermented plantain drink in a clear glass bottle with condensation drops, next to a filled glass showing the slightly fizzy liquid. Fresh plantain slices and honey beside it. Bright natural lighting, clean white marble surface. Health drink, probiotic. No text.",
  },
  {
    filename: "synbiotic-porridge.jpg",
    prompt: "Professional food photography of a warm bowl of fermented porridge (uji) made from finger millet, creamy brown color, swirled with honey, topped with cinnamon and served in a handmade ceramic bowl. Steam rising, spoon beside it. Warm cozy lighting, Kenyan breakfast setting. No text.",
  },
  {
    filename: "goat-milk-tea.jpg",
    prompt: "Professional beverage photography of Kenyan chai tea made with fresh goat milk, served in a clear glass cup showing the creamy golden-brown color. Whole spices (cardamom pods, cinnamon stick, ginger) arranged beside the cup. Warm lighting, cozy cafe atmosphere. No text.",
  },
  {
    filename: "special-uji.jpg",
    prompt: "Professional food photography of a traditional Kenyan porridge drink (uji) in a tall glass, creamy brown color, beside a small bowl of mixed heritage grains (finger millet, sorghum, amaranth). Warm morning lighting, wooden table. Healthy breakfast. No text.",
  },
  {
    filename: "ugali-blend.jpg",
    prompt: "Professional product photography of a kraft paper bag of premium flour blend, surrounded by scattered heritage grains (maize, finger millet, sorghum), with a prepared piece of ugali (white-brown firm porridge) on a plate beside it. Clean styling, natural lighting, top-down angle. African artisan food product. No text on the bag.",
  },
  {
    filename: "uji-blend.jpg",
    prompt: "Professional product photography of a premium packaged porridge flour blend in a kraft paper bag, surrounded by whole finger millet grains, sorghum, and amaranth seeds. A bowl of prepared creamy porridge beside it. Warm lighting, rustic wood surface. Heritage grain product. No text on the bag.",
  },
  {
    filename: "custom-blend.jpg",
    prompt: "Professional product photography of multiple small glass jars filled with different colored grain flours (brown, cream, reddish) arranged artistically. A food scientist's lab-style presentation with measuring spoons and whole grains scattered around. Clean white background, bright lighting. Custom flour formulation concept. No text.",
  },
  {
    filename: "breakfast-combo.jpg",
    prompt: "Professional food photography of a healthy Kenyan breakfast spread: scrambled eggs, whole grain toast, fresh vegetable salad, and a glass of porridge drink. Bright morning light, white plate, rustic wooden table. Energizing, balanced, colorful. Top-down angle. No text.",
  },
  {
    filename: "heavy-meal.jpg",
    prompt: "Professional food photography of a generous Kenyan meal combo: large portion of grilled protein with rich brown sauce, special ugali, fresh steamed vegetables, and a side beverage. Dark plate on wooden table. Warm lighting, generous portions visible. Satisfying, premium quality. 45-degree angle. No text.",
  },
  {
    filename: "hero-food-spread.jpg",
    prompt: "Professional overhead food photography of an abundant African food spread: multiple bowls and plates showing pilau rice, ugali, fresh vegetables, fermented porridge in a glass, golden chai, grains in small bowls, herbs and spices scattered. Rustic wooden table, warm natural lighting. Ayola Foods style - healthy, heritage, colorful, inviting. No text.",
  },
];

async function generateImage(prompt, filename) {
  console.log(`Generating: ${filename}...`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["image", "text"],
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const outputPath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));
          console.log(`  ✓ Saved: ${outputPath}`);
          return true;
        }
      }
    }
    console.log(`  ✗ No image in response for ${filename}`);
    return false;
  } catch (err) {
    console.log(`  ✗ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`\nGenerating ${productPrompts.length} product images...\n`);
  let success = 0;
  let failed = 0;

  // Generate sequentially to avoid rate limits
  for (const { prompt, filename } of productPrompts) {
    const ok = await generateImage(prompt, filename);
    if (ok) success++;
    else failed++;
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\nDone! ${success} generated, ${failed} failed.`);
}

main();
