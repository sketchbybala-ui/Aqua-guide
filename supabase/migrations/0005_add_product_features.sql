-- ============================================================
-- Aqua Guide — 0005_add_product_features.sql
-- Adds a bullet-point "features" list to each product, shown on
-- the product detail page (e.g. "Multi-stage RO purification").
-- Run this after 0001-0004. Safe to run even if you already ran
-- 0004 previously — it only adds a column and updates existing rows.
-- ============================================================

alter table products add column if not exists features text[] not null default '{}';

-- ---------- Home Use ----------
update products set features = array['Multi-stage RO purification','Touch-enabled digital display','Compact wall-mountable design'] where slug = 'lexpure-vedic';
update products set features = array['Advanced RO purification with FDA/CE compliant components','Sleek touch-panel controls','High-capacity storage tank'] where slug = 'vista-pro';
update products set features = array['3-stage reverse osmosis filtration','Wall-mounted design for easy installation','Reduces dissolved solids and impurities'] where slug = '3-stage-ro-system-blue';
update products set features = array['Compact 3-stage RO filtration','Easy under-counter installation','Reliable everyday purification'] where slug = '3-stage-ro-system-white';
update products set features = array['100% safe & hygienic purified water','Eco-friendly and energy efficient','Low maintenance design'] where slug = 'aqua-glory';
update products set features = array['Modern alkaline RO purification','Stylish, space-saving design','Includes storage tank'] where slug = 'aqua-cyclone';
update products set features = array['Dual RO + UV purification','QR-code enabled service tracking','Advanced multi-stage filtration'] where slug = 'aquagrand-ro-uv';
update products set features = array['Touch-enabled water dispensing','Compact countertop design','Reliable RO purification'] where slug = 'aqua-touch';
update products set features = array['Available in multiple colour finishes','Elegant, modern design','Consistent RO purification performance'] where slug = 'aqua-roma';
update products set features = array['Reliable everyday RO purification','Compact design for small households','Easy-to-use dispensing tap'] where slug = 'neptune-aps';
update products set features = array['Zinc, copper & alkaline mineral enrichment','LED status indicators','Premium sleek finish'] where slug = 'aqua-innovica';
update products set features = array['Zinc, copper & alkaline enrichment','LED indicators for filter status','Modern countertop design'] where slug = 'nile-aqua-innovica-lavish';
update products set features = array['RO + TDS controller','Digital LED display','Silver premium finish'] where slug = 'clean-water-aqua-xl-silver';
update products set features = array['Premium, perfectly sized for any kitchen','Alkaline mineral enrichment','Sleek accented design'] where slug = 'nile-aqua-v5';
update products set features = array['Advanced purification technology','Durable, contoured body','High flow-rate dispensing'] where slug = 'clean-water-hi-flo';
update products set features = array['10L detachable storage tank','Smart blinking LED indicator','Space-saving compact design'] where slug = 'aqua-grid-teal';
update products set features = array['10L detachable storage tank','Smart blinking LED indicator','Sleek graphite finish'] where slug = 'aqua-grid-graphite';

-- ---------- Commercial Use ----------
update products set features = array['3-stage commercial reverse osmosis filtration','Quality-assurance certified components','Ideal for shops and small offices'] where slug = 'commercial-ro-plant-3-stage';
update products set features = array['Twin-tank water softening + RO purification','Digital control panel with pressure gauges','Suited for medium-scale commercial use'] where slug = 'commercial-ro-water-softener';
update products set features = array['Stainless-steel framed, wheel-mounted for mobility','Integrated pressure gauges and digital controller','Built for flexible on-site deployment'] where slug = 'ss-aqua-ro-mobile-skid';
update products set features = array['High-capacity skid-mounted RO system','Multiple membrane housings for high throughput','Designed for large-scale commercial installations'] where slug = 'containerized-ro-plant';
update products set features = array['Full-scale industrial RO filtration','High-volume water processing capacity','Heavy-duty stainless steel construction'] where slug = 'industrial-ro-plant-large-skid';
