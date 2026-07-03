-- ============================================================
-- Aqua Guide — 0004_seed_products.sql
-- Seeds categories + the 22 products found in the source photos.
--
-- IMPORTANT: before running this file, upload the images from
-- src/assets/products/ to the "product-images" Storage bucket
-- (see SETUP.md), then find-and-replace YOUR_PROJECT_REF below
-- with your actual Supabase project ref (visible in the image
-- URL after uploading, or in Project Settings > API).
--
-- Home Use products 1-11 share home-collage-1.jpg and 12-17 share
-- home-collage-2.jpg as placeholder photos (multi-product source
-- posters) — swap in individual photos later via the admin panel.
-- ============================================================

insert into categories (slug, name, description) values
  ('home-use', 'Home Use', 'Water purifiers designed for home and kitchen use.'),
  ('commercial-use', 'Commercial Use', 'RO plants and purification systems for businesses and industry.');

-- ---------- Home Use (17) ----------
insert into products (category_id, slug, name, description, price, image_url, stock_quantity) values
  ((select id from categories where slug='home-use'), 'lexpure-vedic', 'LexPure Vedic', 'Compact home RO water purifier with advanced multi-stage filtration.', 15000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'vista-pro', 'Vista Pro', 'Sleek countertop RO purifier with digital touch controls.', 18000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), '3-stage-ro-system-blue', '3 Stage RO System (Blue)', 'Wall-mounted 3-stage reverse osmosis system for reliable home filtration.', 16000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), '3-stage-ro-system-white', '3 Stage RO System (White)', 'Compact 3-stage RO system, easy to install under any counter.', 9000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-glory', 'Aqua Glory', 'Entry-level home RO purifier with reliable everyday performance.', 7000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-cyclone', 'Aqua Cyclone', 'Modern alkaline RO purifier with sleek cyclone-inspired design.', 12000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'aquagrand-ro-uv', 'AquaGrand RO + UV', 'Dual RO + UV purification for extra protection against contaminants.', 14000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-touch', 'Aqua Touch', 'Compact home purifier with touch-enabled dispensing.', 9000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-roma', 'Aqua Roma', 'Stylish home RO purifier available in multiple colour finishes.', 8000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'neptune-aps', 'Neptune (APS)', 'Reliable everyday RO purifier for small to medium households.', 10000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-innovica', 'Aqua Innovica', 'Premium RO purifier with zinc, copper & alkaline enrichment and LED indicators.', 20000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-1.jpg', 10),
  ((select id from categories where slug='home-use'), 'nile-aqua-innovica-lavish', 'Nile Aqua Innovica – Lavish', 'Zinc, copper & alkaline enriched purifier with LED indicators.', 12000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-2.jpg', 10),
  ((select id from categories where slug='home-use'), 'clean-water-aqua-xl-silver', 'Clean Water Aqua XL – Silver', 'RO + TDS controller purifier with digital LED display.', 10000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-2.jpg', 10),
  ((select id from categories where slug='home-use'), 'nile-aqua-v5', 'Nile Aqua V5', 'Premium, perfectly sized alkaline RO purifier.', 9500, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-2.jpg', 10),
  ((select id from categories where slug='home-use'), 'clean-water-hi-flo', 'Clean Water Hi-Flo', 'Advanced-technology purifier with a durable, contoured body.', 9000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-2.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-grid-teal', 'Aqua Grid (Teal)', '10L detachable storage tank purifier with smart blinking LED.', 8000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-2.jpg', 10),
  ((select id from categories where slug='home-use'), 'aqua-grid-graphite', 'Aqua Grid (Graphite)', '10L detachable storage tank purifier with smart blinking LED, graphite finish.', 8000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/home-use/home-collage-2.jpg', 10);

-- ---------- Commercial Use (5) ----------
insert into products (category_id, slug, name, description, price, image_url, stock_quantity) values
  ((select id from categories where slug='commercial-use'), 'commercial-ro-plant-3-stage', 'Commercial R.O. Plant (3-Stage)', 'Countertop-scale commercial reverse osmosis plant for shops and small offices.', 50000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/commercial-use/commercial-ro-plant-3-stage.jpg', 5),
  ((select id from categories where slug='commercial-use'), 'commercial-ro-water-softener', 'Commercial RO System with Water Softener', 'Twin-tank RO system with integrated water softener for medium-scale use.', 150000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/commercial-use/commercial-ro-water-softener.jpg', 5),
  ((select id from categories where slug='commercial-use'), 'ss-aqua-ro-mobile-skid', 'SS Aqua & RO (Mobile Skid Unit)', 'Wheeled, stainless-steel-framed commercial RO skid for flexible deployment.', 200000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/commercial-use/commercial-ss-aqua-ro.jpg', 3),
  ((select id from categories where slug='commercial-use'), 'containerized-ro-plant', 'Containerized RO Plant (High Capacity)', 'High-capacity skid-mounted RO plant for large commercial installations.', 1500000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/commercial-use/commercial-containerized-ro-plant.jpg', 2),
  ((select id from categories where slug='commercial-use'), 'industrial-ro-plant-large-skid', 'Industrial RO Plant (Large Skid)', 'Full-scale industrial RO plant for high-volume water purification.', 3500000, 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/product-images/commercial-use/commercial-industrial-ro-plant.jpg', 1);
