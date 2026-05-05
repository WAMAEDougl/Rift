-- Seed 10 hero banners (bypasses RLS by temporarily disabling it)
-- Run this in the Supabase SQL Editor (uses postgres role, not anon)

-- Temporarily disable RLS for seeding
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;

-- Clear existing hero banners
DELETE FROM public.banners WHERE position = 'hero';

-- Insert 10 fresh slides
INSERT INTO public.banners
  (title, subtitle, description, image_url, mobile_image_url, link_url, link_text,
   position, sort_order, is_active, title_color, subtitle_color, description_color)
VALUES

  (
    'Heritage Jollof',
    'Earth-first · Slow-Cooked',
    'Smoky, slow-cooked rice infused with sun-ripened highland peppers and a whisper of locust bean.',
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Order Now',
    'hero', 1, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Rabbit Wet Fry',
    'High Protein · Free-Range',
    'Tender free-range rabbit slow-cooked in a rich tomato and herb sauce. High protein, low fat.',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Shop Now',
    'hero', 2, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Plantain Probiotic Kvass',
    'Gut Health · Zero Sugar Added',
    'Kenya''s first plantain-fermented probiotic beverage. Naturally fizzy, live cultures, no sugar added.',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Try It',
    'hero', 3, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Finger Millet Flour',
    'Heritage Grains · Ships Countrywide',
    'Stone-ground wimbi flour from smallholder farms in the Rift Valley. Higher calcium than milk per gram.',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Shop Now',
    'hero', 4, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Goat Milk Masala Tea',
    'Gut-Friendly · Naturally Homogenised',
    'Rich, creamy masala chai brewed with fresh goat milk — easier to digest, warming to the soul.',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Order Now',
    'hero', 5, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Heritage Ugali Breakfast',
    'Low GI · Stone-Ground',
    'Sorghum and millet ugali with free-range eggs and fermented vegetables. Fuel your morning right.',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Order Breakfast',
    'hero', 6, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Synbiotic Porridge',
    'Science-Backed · Fermented',
    'Fermented finger millet with live probiotic cultures and prebiotic fibre — formulated by a food scientist.',
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Shop Now',
    'hero', 7, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Sorghum Flour Blend',
    'Low GI · High Protein · Gluten-Free',
    'Heritage sorghum blended with amaranth. Perfect for ugali, porridge, and baking. Ships to all 47 counties.',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Shop Now',
    'hero', 8, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Turkey Egg Omelette',
    'Nutrient-Dense · Rare Find',
    'Fluffy omelette made with nutrient-rich turkey eggs, garden vegetables, and heritage spices.',
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Order Now',
    'hero', 9, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  ),

  (
    'Golden Puffs',
    'Artisanal · Fresh-Made Daily',
    'Yeasted dough balls fried until amber and finished with a warm ginger glaze. A beloved breakfast treat.',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80&auto=format&fit=crop',
    '/shop', 'Order Breakfast',
    'hero', 10, true, '#ffffff', '#e8d5a3', 'rgba(255,255,255,0.72)'
  );

-- Re-enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT COUNT(*) as hero_banner_count FROM public.banners WHERE position = 'hero';
