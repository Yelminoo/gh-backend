-- Seed data for Category table
-- Jewelry categories for GEM Market

INSERT INTO "Category" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Rings', 'rings', 'Engagement rings, wedding bands, fashion rings, and more', true, NOW(), NOW()),
  (gen_random_uuid(), 'Necklaces', 'necklaces', 'Pendants, chains, chokers, and statement necklaces', true, NOW(), NOW()),
  (gen_random_uuid(), 'Earrings', 'earrings', 'Studs, hoops, drops, and chandelier earrings', true, NOW(), NOW()),
  (gen_random_uuid(), 'Bracelets', 'bracelets', 'Bangles, cuffs, chains, and charm bracelets', true, NOW(), NOW()),
  (gen_random_uuid(), 'Anklets', 'anklets', 'Ankle bracelets and foot jewelry', true, NOW(), NOW()),
  (gen_random_uuid(), 'Brooches & Pins', 'brooches-pins', 'Decorative pins, brooches, and lapel accessories', true, NOW(), NOW()),
  (gen_random_uuid(), 'Watches', 'watches', 'Luxury watches, fashion watches, and timepieces', true, NOW(), NOW()),
  (gen_random_uuid(), 'Wedding & Engagement', 'wedding-engagement', 'Engagement rings, wedding bands, and bridal sets', true, NOW(), NOW()),
  (gen_random_uuid(), 'Fine Jewelry', 'fine-jewelry', 'Premium jewelry with precious metals and gemstones', true, NOW(), NOW()),
  (gen_random_uuid(), 'Fashion Jewelry', 'fashion-jewelry', 'Trendy and affordable fashion accessories', true, NOW(), NOW()),
  (gen_random_uuid(), 'Gemstones', 'gemstones', 'Loose gemstones, diamonds, and precious stones', true, NOW(), NOW()),
  (gen_random_uuid(), 'Body Jewelry', 'body-jewelry', 'Nose rings, belly rings, and piercing jewelry', true, NOW(), NOW()),
  (gen_random_uuid(), 'Men''s Jewelry', 'mens-jewelry', 'Cufflinks, tie bars, rings, and men''s accessories', true, NOW(), NOW()),
  (gen_random_uuid(), 'Children''s Jewelry', 'childrens-jewelry', 'Safe and age-appropriate jewelry for kids', true, NOW(), NOW()),
  (gen_random_uuid(), 'Jewelry Sets', 'jewelry-sets', 'Matching sets of earrings, necklaces, and bracelets', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
