-- ============================================================================
-- MATERIAL LIBRARY SEED DATA
-- Popular countertops, flooring, tile, fixtures, and hardware
-- ============================================================================

-- Clear existing data (optional - remove if you want to preserve existing)
-- DELETE FROM material_library;

-- ============================================================================
-- COUNTERTOPS - Quartz
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'countertop', 'quartz', 'Caesarstone', 'Calacatta Nuvo',
  '5131',
  'Premium quartz surface with dramatic veining inspired by natural marble',
  'White with gray veining',
  'Polished',
  85.00, 'sq_ft', 14,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['modern', 'transitional', 'contemporary'],
  true, true
),
(
  'countertop', 'quartz', 'Silestone', 'Eternal Calacatta Gold',
  'ET-CGD',
  'Warm white background with golden and gray veining',
  'White with gold/gray veining',
  'Polished',
  95.00, 'sq_ft', 14,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['traditional', 'transitional', 'luxury'],
  true, true
),
(
  'countertop', 'quartz', 'MSI', 'Calacatta Classique',
  'Q-CC-001',
  'Classic white quartz with subtle gray veining, durable and low maintenance',
  'White with gray veining',
  'Polished',
  55.00, 'sq_ft', 10,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['modern', 'transitional', 'farmhouse'],
  true, true
),
(
  'countertop', 'quartz', 'Cambria', 'Brittanicca',
  'BRIT-01',
  'Bold veining pattern on crisp white background',
  'White with bold gray veining',
  'High Gloss',
  125.00, 'sq_ft', 21,
  ARRAY['kitchen'],
  ARRAY['contemporary', 'luxury'],
  true, true
);

-- ============================================================================
-- COUNTERTOPS - Granite
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name,
  description, color_description, finish,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'countertop', 'granite', 'MSI', 'Black Pearl',
  'Classic black granite with silver and gray speckles',
  'Black with silver/gray flecks',
  'Polished',
  45.00, 'sq_ft', 10,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['traditional', 'contemporary'],
  true, true
),
(
  'countertop', 'granite', 'MSI', 'White Ice',
  'Light gray and white granite with subtle veining',
  'White/gray blend',
  'Polished',
  50.00, 'sq_ft', 10,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['transitional', 'coastal'],
  true, true
);

-- ============================================================================
-- FLOORING - LVP (Luxury Vinyl Plank)
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish, dimensions, thickness,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'flooring', 'lvp', 'LifeProof', 'Sterling Oak',
  'I966106L',
  'Waterproof luxury vinyl plank with realistic wood grain texture',
  'Light brown oak',
  'Embossed',
  '7.1" x 47.6"', '8.7mm',
  3.29, 'sq_ft', 5,
  ARRAY['living_room', 'bedroom', 'kitchen', 'bathroom'],
  ARRAY['modern_farmhouse', 'transitional', 'coastal'],
  true, true
),
(
  'flooring', 'lvp', 'LifeProof', 'Trail Oak',
  'I127506L',
  'Waterproof vinyl plank with warm brown tones',
  'Medium brown oak',
  'Embossed',
  '7.1" x 47.6"', '8.7mm',
  3.29, 'sq_ft', 5,
  ARRAY['living_room', 'bedroom', 'kitchen'],
  ARRAY['traditional', 'farmhouse'],
  true, true
),
(
  'flooring', 'lvp', 'COREtec', 'Virtue Oak',
  'VV488-02012',
  'Premium waterproof LVP with attached cork backing',
  'Gray-brown oak',
  'Wire Brushed',
  '7" x 48"', '8mm',
  4.99, 'sq_ft', 7,
  ARRAY['living_room', 'bedroom', 'kitchen'],
  ARRAY['contemporary', 'modern'],
  true, true
),
(
  'flooring', 'lvp', 'Shaw', 'Floorte Pro Endura Plus',
  'SH-EP-001',
  'Commercial-grade waterproof vinyl with excellent durability',
  'Neutral gray',
  'Textured',
  '7" x 48"', '6.5mm',
  3.99, 'sq_ft', 5,
  ARRAY['living_room', 'kitchen', 'office'],
  ARRAY['modern', 'industrial'],
  true, true
);

-- ============================================================================
-- TILE - Subway & Wall Tile
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name,
  description, color_description, finish, dimensions,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'tile', 'ceramic', 'Daltile', 'Arctic White Subway',
  'Classic white subway tile, timeless design',
  'Bright white',
  'Glossy',
  '3" x 6"',
  0.99, 'sq_ft', 3,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['farmhouse', 'transitional', 'traditional'],
  true, true
),
(
  'tile', 'ceramic', 'MSI', 'Aria Bianco Subway',
  'Elegant white subway tile with subtle texture',
  'Soft white',
  'Matte',
  '4" x 12"',
  1.49, 'sq_ft', 5,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['modern', 'contemporary', 'minimalist'],
  true, true
),
(
  'tile', 'porcelain', 'Bedrosians', 'Zellige White',
  'Handcrafted look porcelain tile with varied surface',
  'Antique white',
  'Glossy',
  '4" x 4"',
  15.00, 'sq_ft', 10,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['bohemian', 'mediterranean', 'eclectic'],
  true, true
);

-- ============================================================================
-- TILE - Floor Tile
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name,
  description, color_description, finish, dimensions,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'tile', 'porcelain', 'MSI', 'Carrara White',
  'Marble-look porcelain tile, elegant and durable',
  'White with gray veining',
  'Polished',
  '12" x 24"',
  3.99, 'sq_ft', 7,
  ARRAY['bathroom', 'entryway'],
  ARRAY['traditional', 'transitional', 'luxury'],
  true, true
),
(
  'tile', 'porcelain', 'Daltile', 'Emser Ironwood Pecan',
  'Wood-look porcelain tile for wet areas',
  'Warm brown wood grain',
  'Matte',
  '6" x 36"',
  4.49, 'sq_ft', 7,
  ARRAY['bathroom', 'laundry'],
  ARRAY['farmhouse', 'rustic', 'transitional'],
  true, true
),
(
  'tile', 'porcelain', 'Marazzi', 'Color Body Hexagon',
  'Modern hexagon floor tile',
  'White',
  'Matte',
  '7" hex',
  8.99, 'sq_ft', 10,
  ARRAY['bathroom', 'entryway'],
  ARRAY['modern', 'contemporary', 'scandinavian'],
  true, true
);

-- ============================================================================
-- FIXTURES - Kitchen Faucets
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'fixture', 'faucet', 'Delta', 'Trinsic Single Handle Pull-Down',
  '9159-DST',
  'Contemporary design with Touch2O technology available',
  'Chrome',
  'Chrome',
  350.00, 'each', 5,
  ARRAY['kitchen'],
  ARRAY['modern', 'contemporary', 'minimalist'],
  true, true
),
(
  'fixture', 'faucet', 'Moen', 'Align Single Handle Pull-Down',
  '7565SRS',
  'Modern cylindrical body design with Power Clean spray',
  'Spot Resist Stainless',
  'Stainless Steel',
  299.00, 'each', 5,
  ARRAY['kitchen'],
  ARRAY['contemporary', 'transitional'],
  true, true
),
(
  'fixture', 'faucet', 'Kohler', 'Simplice Single-Hole Pull-Down',
  'K-596-VS',
  'Clean lines with high-arc spout and ProMotion technology',
  'Vibrant Stainless',
  'Stainless Steel',
  379.00, 'each', 5,
  ARRAY['kitchen'],
  ARRAY['transitional', 'modern'],
  true, true
);

-- ============================================================================
-- FIXTURES - Bathroom Faucets
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'fixture', 'faucet', 'Delta', 'Ara Single Handle Bathroom Faucet',
  '561-MPU-DST',
  'Angular contemporary design with diamond seal technology',
  'Chrome',
  'Chrome',
  180.00, 'each', 5,
  ARRAY['bathroom'],
  ARRAY['modern', 'contemporary'],
  true, true
),
(
  'fixture', 'faucet', 'Moen', 'Genta LX Single Hole Bathroom Faucet',
  '6702BN',
  'Refined modern design with Eco-Performance',
  'Brushed Nickel',
  'Brushed Nickel',
  159.00, 'each', 5,
  ARRAY['bathroom'],
  ARRAY['transitional', 'modern'],
  true, true
);

-- ============================================================================
-- HARDWARE - Cabinet Pulls
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish, dimensions,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'hardware', 'cabinet_pull', 'Top Knobs', 'Kinney Pull',
  'TK942',
  'Modern bar pull with clean lines',
  'Polished Nickel',
  'Polished Nickel',
  '5-1/16" cc',
  12.99, 'each', 5,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['modern', 'transitional'],
  true, true
),
(
  'hardware', 'cabinet_pull', 'Amerock', 'Bar Pull',
  'BP40517ORB',
  'Classic bar pull, timeless design',
  'Oil Rubbed Bronze',
  'Oil Rubbed Bronze',
  '5" cc',
  8.99, 'each', 3,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['traditional', 'farmhouse'],
  true, true
),
(
  'hardware', 'cabinet_pull', 'Liberty', 'Modern Bar Pull',
  'P01012C-MN-C',
  'Sleek modern bar pull at great value',
  'Matte Black',
  'Matte Black',
  '5" cc',
  5.99, 'each', 3,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['modern', 'industrial', 'farmhouse'],
  true, true
),
(
  'hardware', 'cabinet_knob', 'Top Knobs', 'Kinney Knob',
  'TK942',
  'Round modern knob to match Kinney pulls',
  'Brushed Satin Nickel',
  'Brushed Satin Nickel',
  '1-1/8" dia',
  8.99, 'each', 5,
  ARRAY['kitchen', 'bathroom'],
  ARRAY['modern', 'transitional'],
  true, true
);

-- ============================================================================
-- LIGHTING - Pendant & Chandeliers
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish, dimensions,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'lighting', 'pendant', 'Kichler', 'Everly Pendant',
  '42046OZ',
  'Clear seeded glass globe with vintage Edison bulb compatibility',
  'Olde Bronze',
  'Olde Bronze',
  '10.75" W x 14.25" H',
  129.00, 'each', 7,
  ARRAY['kitchen', 'dining_room'],
  ARRAY['farmhouse', 'transitional', 'industrial'],
  true, true
),
(
  'lighting', 'pendant', 'West Elm', 'Sculptural Glass Globe',
  'WE-SG-CLR',
  'Modern clear glass globe pendant, elegant simplicity',
  'Clear/Brass',
  'Antique Brass',
  '7" W x 8" H',
  149.00, 'each', 10,
  ARRAY['kitchen', 'dining_room', 'bedroom'],
  ARRAY['modern', 'contemporary', 'minimalist'],
  true, true
),
(
  'lighting', 'chandelier', 'Kichler', 'Circolo 12-Light',
  '42047OZ',
  'Dramatic circular chandelier with seeded glass globes',
  'Olde Bronze',
  'Olde Bronze',
  '36" W x 25.25" H',
  899.00, 'each', 14,
  ARRAY['dining_room', 'living_room', 'entryway'],
  ARRAY['transitional', 'farmhouse'],
  true, true
);

-- ============================================================================
-- VANITY LIGHTING
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish, dimensions,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'lighting', 'vanity', 'Kichler', 'Shailene 3-Light Vanity',
  '45574NI',
  'Transitional vanity light with satin etched glass',
  'Brushed Nickel',
  'Brushed Nickel',
  '21" W x 8.25" H',
  139.00, 'each', 7,
  ARRAY['bathroom'],
  ARRAY['transitional', 'traditional'],
  true, true
),
(
  'lighting', 'vanity', 'Progress Lighting', 'Replay 3-Light Vanity',
  'P2159-31',
  'Modern cylindrical shades with clean lines',
  'Matte Black',
  'Matte Black',
  '22" W x 7" H',
  109.00, 'each', 5,
  ARRAY['bathroom'],
  ARRAY['modern', 'contemporary', 'industrial'],
  true, true
);

-- ============================================================================
-- APPLIANCES (Popular selections)
-- ============================================================================
INSERT INTO material_library (
  material_type, material_category, brand, product_name, model_number,
  description, color_description, finish, dimensions,
  avg_cost_per_unit, unit_type, typical_lead_time_days,
  recommended_for, design_styles, popular, is_active
) VALUES
(
  'appliance', 'refrigerator', 'Samsung', 'French Door Refrigerator',
  'RF28T5001SR',
  '28 cu. ft. French door refrigerator with ice maker',
  'Fingerprint Resistant Stainless Steel',
  'Stainless Steel',
  '35.75" W x 70" H x 36.5" D',
  1799.00, 'each', 7,
  ARRAY['kitchen'],
  ARRAY['modern', 'contemporary', 'transitional'],
  true, true
),
(
  'appliance', 'range', 'GE', 'Gas Range with Convection',
  'JGSS66SELSS',
  '30" free-standing gas range with convection oven',
  'Stainless Steel',
  'Stainless Steel',
  '30" W x 47.25" H x 28.75" D',
  949.00, 'each', 5,
  ARRAY['kitchen'],
  ARRAY['transitional', 'traditional'],
  true, true
),
(
  'appliance', 'dishwasher', 'Bosch', '300 Series Dishwasher',
  'SHEM63W55N',
  '44 dBA quiet operation, 3rd rack, stainless steel tub',
  'Stainless Steel',
  'Stainless Steel',
  '23.5" W x 33.75" H x 23.75" D',
  849.00, 'each', 5,
  ARRAY['kitchen'],
  ARRAY['modern', 'contemporary', 'transitional'],
  true, true
),
(
  'appliance', 'range_hood', 'Broan', 'Under Cabinet Range Hood',
  '413004',
  '30" under cabinet range hood with 2-speed fan',
  'Stainless Steel',
  'Stainless Steel',
  '30" W x 6" H x 17.5" D',
  159.00, 'each', 3,
  ARRAY['kitchen'],
  ARRAY['transitional', 'traditional'],
  true, true
);

-- ============================================================================
-- End of seed data
-- ============================================================================
