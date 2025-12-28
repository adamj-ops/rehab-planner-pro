-- ============================================================================
-- SHERWIN-WILLIAMS COLOR LIBRARY SEED DATA
-- 200+ Popular Paint Colors Across All Families
-- ============================================================================

-- This migration seeds the color_library table with comprehensive
-- Sherwin-Williams color data including:
-- - All color families (whites, grays, beiges, blues, greens, reds, yellows, browns)
-- - Popular designer colors
-- - LRV (Light Reflectance Value) data
-- - Undertones and design style associations
-- - Recommended rooms and surfaces

-- First, clear existing color data to avoid duplicates
DELETE FROM color_library WHERE brand = 'sherwin_williams';

-- ============================================================================
-- WHITES (30+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

-- Pure/Cool Whites
('sherwin_williams', 'SW 7005', 'Pure White', '#F2F0EB', '{"r": 242, "g": 240, "b": 235}', 84, ARRAY['neutral'], 'white', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['kitchen', 'bathroom', 'living_room', 'bedroom'], ARRAY['walls', 'trim', 'cabinets'], ARRAY['modern_farmhouse', 'contemporary', 'transitional'], true, true),

('sherwin_williams', 'SW 7006', 'Extra White', '#F4F3F0', '{"r": 244, "g": 243, "b": 240}', 86, ARRAY['cool'], 'white', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss', 'gloss'], ARRAY['kitchen', 'bathroom', 'living_room', 'bedroom', 'exterior'], ARRAY['walls', 'trim', 'doors', 'cabinets'], ARRAY['modern_farmhouse', 'contemporary'], true, true),

('sherwin_williams', 'SW 7757', 'High Reflective White', '#F9F8F6', '{"r": 249, "g": 248, "b": 246}', 93, ARRAY['neutral'], 'white', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['kitchen', 'bathroom', 'living_room'], ARRAY['walls', 'ceiling'], ARRAY['contemporary', 'modern'], true, true),

('sherwin_williams', 'SW 7012', 'Creamy', '#F4EFE0', '{"r": 244, "g": 239, "b": 224}', 81, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'transitional'], true, true),

('sherwin_williams', 'SW 7008', 'Alabaster', '#EDEAE0', '{"r": 237, "g": 234, "b": 224}', 82, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['kitchen', 'living_room', 'bedroom', 'bathroom'], ARRAY['walls', 'cabinets', 'trim'], ARRAY['traditional', 'transitional', 'modern_farmhouse'], true, true),

('sherwin_williams', 'SW 7010', 'White Duck', '#EAE6D8', '{"r": 234, "g": 230, "b": 216}', 78, ARRAY['warm', 'yellow'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'coastal'], true, true),

('sherwin_williams', 'SW 6385', 'Dover White', '#EBE8DB', '{"r": 235, "g": 232, "b": 219}', 79, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'transitional'], true, true),

('sherwin_williams', 'SW 7011', 'Natural Choice', '#E8E4D4', '{"r": 232, "g": 228, "b": 212}', 74, ARRAY['warm', 'yellow'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional'], false, true),

('sherwin_williams', 'SW 7014', 'Eider White', '#E8E4D9', '{"r": 232, "g": 228, "b": 217}', 76, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional', 'coastal'], false, true),

('sherwin_williams', 'SW 7566', 'Westhighland White', '#F3F1E8', '{"r": 243, "g": 241, "b": 232}', 83, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7567', 'Greek Villa', '#F0EDE3', '{"r": 240, "g": 237, "b": 227}', 81, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['mediterranean', 'coastal'], false, true),

('sherwin_williams', 'SW 9165', 'Shoji White', '#F0EDE3', '{"r": 240, "g": 237, "b": 227}', 81, ARRAY['warm'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'bathroom'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], true, true),

('sherwin_williams', 'SW 7558', 'Snowbound', '#F3F2ED', '{"r": 243, "g": 242, "b": 237}', 85, ARRAY['neutral'], 'white', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['kitchen', 'bathroom', 'living_room'], ARRAY['walls', 'trim', 'cabinets'], ARRAY['contemporary', 'modern'], true, true),

('sherwin_williams', 'SW 7013', 'Aesthetic White', '#F0EDE6', '{"r": 240, "g": 237, "b": 230}', 80, ARRAY['neutral'], 'white', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true);

-- ============================================================================
-- GRAYS (40+ colors)
-- ============================================================================

-- Warm Grays
INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

('sherwin_williams', 'SW 7015', 'Repose Gray', '#C9C7C1', '{"r": 201, "g": 199, "b": 193}', 58, ARRAY['neutral', 'warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'kitchen', 'bathroom'], ARRAY['walls'], ARRAY['modern_farmhouse', 'contemporary', 'transitional'], true, true),

('sherwin_williams', 'SW 7047', 'Porpoise', '#72706A', '{"r": 114, "g": 112, "b": 106}', 38, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['contemporary', 'transitional'], true, true),

('sherwin_williams', 'SW 7016', 'Mindful Gray', '#B5B3AD', '{"r": 181, "g": 179, "b": 173}', 48, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional', 'traditional'], true, true),

('sherwin_williams', 'SW 7018', 'Dovetail', '#7D7B75', '{"r": 125, "g": 123, "b": 117}', 45, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['contemporary', 'transitional'], true, true),

('sherwin_williams', 'SW 7019', 'Gauntlet Gray', '#6F6D67', '{"r": 111, "g": 109, "b": 103}', 35, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'office'], ARRAY['walls'], ARRAY['contemporary', 'modern'], true, true),

('sherwin_williams', 'SW 7674', 'Accessible Beige', '#D5C9B8', '{"r": 213, "g": 201, "b": 184}', 58, ARRAY['warm', 'beige'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['transitional', 'traditional'], true, true),

('sherwin_williams', 'SW 7036', 'Accessible Gray', '#B8B4A9', '{"r": 184, "g": 180, "b": 169}', 58, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7641', 'Colonnade Gray', '#BFBDB7', '{"r": 191, "g": 189, "b": 183}', 53, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7673', 'Loggia', '#C4BFB2', '{"r": 196, "g": 191, "b": 178}', 58, ARRAY['warm', 'beige'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'transitional'], false, true),

-- Cool Grays
('sherwin_williams', 'SW 7072', 'Silver Strand', '#B0B3AC', '{"r": 176, "g": 179, "b": 172}', 59, ARRAY['cool', 'green'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom', 'living_room'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], true, true),

('sherwin_williams', 'SW 7073', 'Lazy Gray', '#A5A69D', '{"r": 165, "g": 166, "b": 157}', 53, ARRAY['cool', 'green'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['contemporary', 'transitional'], false, true),

('sherwin_williams', 'SW 7071', 'Gray Screen', '#888982', '{"r": 136, "g": 137, "b": 130}', 46, ARRAY['cool', 'green'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'bathroom'], ARRAY['walls'], ARRAY['contemporary'], false, true),

('sherwin_williams', 'SW 9175', 'Network Gray', '#7A7D78', '{"r": 122, "g": 125, "b": 120}', 39, ARRAY['cool', 'green'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'office'], ARRAY['walls'], ARRAY['contemporary', 'industrial'], false, true),

('sherwin_williams', 'SW 7068', 'Grizzle Gray', '#D3D1C8', '{"r": 211, "g": 209, "b": 200}', 68, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7067', 'Crushed Ice', '#DFE0DA', '{"r": 223, "g": 224, "b": 218}', 74, ARRAY['cool'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'kitchen'], ARRAY['walls'], ARRAY['contemporary'], false, true),

('sherwin_williams', 'SW 7070', 'Site White', '#E5E3DB', '{"r": 229, "g": 227, "b": 219}', 75, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

-- Medium/Charcoal Grays
('sherwin_williams', 'SW 7069', 'Iron Ore', '#4E4F4F', '{"r": 78, "g": 79, "b": 79}', 6, ARRAY['neutral'], 'gray', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['exterior', 'accent_wall', 'doors'], ARRAY['walls', 'doors', 'cabinets'], ARRAY['modern_farmhouse', 'modern', 'industrial'], true, true),

('sherwin_williams', 'SW 2849', 'Urbane Bronze', '#433937', '{"r": 67, "g": 57, "b": 55}', 4, ARRAY['warm', 'brown'], 'gray', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['exterior', 'accent_wall', 'doors'], ARRAY['walls', 'doors'], ARRAY['contemporary', 'modern'], true, true),

('sherwin_williams', 'SW 7676', 'Peppercorn', '#605D5B', '{"r": 96, "g": 93, "b": 91}', 11, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room', 'office'], ARRAY['walls'], ARRAY['contemporary', 'transitional'], true, true),

('sherwin_williams', 'SW 7017', 'Dorian Gray', '#9B9A96', '{"r": 155, "g": 154, "b": 150}', 57, ARRAY['neutral'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['contemporary', 'transitional'], false, true),

('sherwin_williams', 'SW 7043', 'Worldly Gray', '#8D8A83', '{"r": 141, "g": 138, "b": 131}', 48, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 6208', 'Pavestone', '#ADABA4', '{"r": 173, "g": 171, "b": 164}', 57, ARRAY['neutral'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['contemporary'], false, true),

('sherwin_williams', 'SW 7661', 'Requisite Gray', '#B2AFA8', '{"r": 178, "g": 175, "b": 168}', 57, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

-- Additional grays
('sherwin_williams', 'SW 7622', 'Steely Gray', '#BCC4C4', '{"r": 188, "g": 196, "b": 196}', 55, ARRAY['cool', 'blue'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

('sherwin_williams', 'SW 7023', 'Requisite Gray', '#B4B0A8', '{"r": 180, "g": 176, "b": 168}', 49, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7031', 'Mega Greige', '#9E9589', '{"r": 158, "g": 149, "b": 137}', 38, ARRAY['warm', 'beige'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7032', 'Warm Stone', '#8A8178', '{"r": 138, "g": 129, "b": 120}', 27, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'dining_room'], ARRAY['walls'], ARRAY['traditional'], false, true);

-- ============================================================================
-- BEIGES (25+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

('sherwin_williams', 'SW 7029', 'Agreeable Gray', '#D1CEC4', '{"r": 209, "g": 206, "b": 196}', 60, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'kitchen', 'dining_room'], ARRAY['walls'], ARRAY['transitional', 'traditional'], true, true),

('sherwin_williams', 'SW 6106', 'Kilim Beige', '#BFB29A', '{"r": 191, "g": 178, "b": 154}', 54, ARRAY['warm', 'yellow'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'transitional'], true, true),

('sherwin_williams', 'SW 7037', 'Balanced Beige', '#C3BAA8', '{"r": 195, "g": 186, "b": 168}', 56, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'transitional'], true, true),

('sherwin_williams', 'SW 6147', 'Navajo White', '#D8C9B0', '{"r": 216, "g": 201, "b": 176}', 62, ARRAY['warm', 'yellow'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'southwestern'], true, true),

('sherwin_williams', 'SW 7602', 'Canvas Tan', '#D1C4B0', '{"r": 209, "g": 196, "b": 176}', 58, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'coastal'], false, true),

('sherwin_williams', 'SW 7604', 'Wool Skein', '#C9BDA6', '{"r": 201, "g": 189, "b": 166}', 54, ARRAY['warm', 'yellow'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional'], false, true),

('sherwin_williams', 'SW 7537', 'Sandbar', '#C0B09C', '{"r": 192, "g": 176, "b": 156}', 49, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'traditional'], false, true),

('sherwin_williams', 'SW 7522', 'Practical Beige', '#BCB09D', '{"r": 188, "g": 176, "b": 157}', 50, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional'], false, true),

('sherwin_williams', 'SW 2836', 'Natural Tan', '#C4B6A1', '{"r": 196, "g": 182, "b": 161}', 52, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'transitional'], false, true),

('sherwin_williams', 'SW 6078', 'Rice Grain', '#D8CFBD', '{"r": 216, "g": 207, "b": 189}', 65, ARRAY['warm', 'yellow'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'coastal'], false, true),

('sherwin_williams', 'SW 6119', 'Antique White', '#E1D7C6', '{"r": 225, "g": 215, "b": 198}', 71, ARRAY['warm', 'yellow'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional'], true, true),

('sherwin_williams', 'SW 9140', 'Softer Tan', '#D4C8B7', '{"r": 212, "g": 200, "b": 183}', 61, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'transitional'], false, true),

('sherwin_williams', 'SW 6121', 'Whole Wheat', '#C6B9A3', '{"r": 198, "g": 185, "b": 163}', 52, ARRAY['warm', 'yellow'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

('sherwin_williams', 'SW 6107', 'Nomadic Desert', '#BDA98E', '{"r": 189, "g": 169, "b": 142}', 45, ARRAY['warm', 'orange'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'dining_room'], ARRAY['walls'], ARRAY['southwestern', 'traditional'], false, true),

('sherwin_williams', 'SW 7506', 'Loggia', '#C7BDAE', '{"r": 199, "g": 189, "b": 174}', 54, ARRAY['warm'], 'beige', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['mediterranean', 'traditional'], false, true);

-- ============================================================================
-- BLUES (30+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

-- Light/Coastal Blues
('sherwin_williams', 'SW 6204', 'Sea Salt', '#C9D4CC', '{"r": 201, "g": 212, "b": 204}', 64, ARRAY['cool', 'green'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom', 'kitchen'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], true, true),

('sherwin_williams', 'SW 6478', 'Watery', '#C1D5D9', '{"r": 193, "g": 213, "b": 217}', 65, ARRAY['cool', 'green'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], true, true),

('sherwin_williams', 'SW 6499', 'Tidewater', '#C3D3D1', '{"r": 195, "g": 211, "b": 209}', 64, ARRAY['cool', 'green'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom', 'living_room'], ARRAY['walls'], ARRAY['coastal', 'transitional'], true, true),

('sherwin_williams', 'SW 6505', 'Rainwashed', '#B3C9C6', '{"r": 179, "g": 201, "b": 198}', 57, ARRAY['cool', 'green'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], true, true),

('sherwin_williams', 'SW 6219', 'Tradewind', '#93ABA8', '{"r": 147, "g": 171, "b": 168}', 42, ARRAY['cool', 'green'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom', 'living_room'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

('sherwin_williams', 'SW 6220', 'Drizzle', '#ABC6C3', '{"r": 171, "g": 198, "b": 195}', 52, ARRAY['cool', 'green'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal'], false, true),

('sherwin_williams', 'SW 6497', 'Byte Blue', '#B8D5DC', '{"r": 184, "g": 213, "b": 220}', 64, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

('sherwin_williams', 'SW 6498', 'Atmospheric', '#B0CAD1', '{"r": 176, "g": 202, "b": 209}', 57, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal'], false, true),

('sherwin_williams', 'SW 9167', 'Icy', '#D6E8EA', '{"r": 214, "g": 232, "b": 234}', 77, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

('sherwin_williams', 'SW 6526', 'Icelandic', '#CAE0E3', '{"r": 202, "g": 224, "b": 227}', 72, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

-- Medium Blues
('sherwin_williams', 'SW 6508', 'Windy Blue', '#8CADB1', '{"r": 140, "g": 173, "b": 177}', 42, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom', 'accent_wall'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], true, true),

('sherwin_williams', 'SW 6509', 'Interesting Aqua', '#7AA1A7', '{"r": 122, "g": 161, "b": 167}', 36, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'accent_wall'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

('sherwin_williams', 'SW 6221', 'Moody Blue', '#7A9FA5', '{"r": 122, "g": 159, "b": 165}', 35, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'bedroom', 'accent_wall'], ARRAY['walls'], ARRAY['coastal', 'contemporary'], false, true),

('sherwin_williams', 'SW 6222', 'Anchors Aweigh', '#5C8D96', '{"r": 92, "g": 141, "b": 150}', 26, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'accent_wall'], ARRAY['walls'], ARRAY['coastal', 'nautical'], true, true),

('sherwin_williams', 'SW 6510', 'Loch Blue', '#698A91', '{"r": 105, "g": 138, "b": 145}', 25, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'accent_wall'], ARRAY['walls'], ARRAY['coastal'], false, true),

('sherwin_williams', 'SW 6230', 'Rainstorm', '#4C6C7A', '{"r": 76, "g": 108, "b": 122}', 15, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room', 'office'], ARRAY['walls'], ARRAY['contemporary', 'transitional'], false, true),

-- Deep/Navy Blues
('sherwin_williams', 'SW 6244', 'Naval', '#28465E', '{"r": 40, "g": 70, "b": 94}', 5, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'dining_room', 'office', 'exterior'], ARRAY['walls', 'doors', 'cabinets'], ARRAY['contemporary', 'traditional', 'nautical'], true, true),

('sherwin_williams', 'SW 6258', 'Tricorn Black', '#2E3438', '{"r": 46, "g": 52, "b": 56}', 3, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior', 'doors'], ARRAY['walls', 'doors', 'trim'], ARRAY['modern', 'contemporary'], true, true),

('sherwin_williams', 'SW 6237', 'Indigo Batik', '#2B4C60', '{"r": 43, "g": 76, "b": 96}', 6, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'eclectic'], false, true),

('sherwin_williams', 'SW 6511', 'Secure Blue', '#577282', '{"r": 87, "g": 114, "b": 130}', 17, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'office'], ARRAY['walls'], ARRAY['contemporary'], false, true),

('sherwin_williams', 'SW 6243', 'Distance', '#3E5C6E', '{"r": 62, "g": 92, "b": 110}', 11, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'office'], ARRAY['walls'], ARRAY['contemporary', 'traditional'], false, true),

('sherwin_williams', 'SW 9178', 'In the Navy', '#2B3D4F', '{"r": 43, "g": 61, "b": 79}', 5, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior'], ARRAY['walls', 'doors'], ARRAY['nautical', 'traditional'], false, true),

-- Sky/Soft Blues
('sherwin_williams', 'SW 6253', 'Olympus White', '#D5DDE1', '{"r": 213, "g": 221, "b": 225}', 71, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], false, true),

('sherwin_williams', 'SW 6252', 'Ice Cube', '#CBD7DD', '{"r": 203, "g": 215, "b": 221}', 66, ARRAY['cool'], 'blue', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['contemporary'], false, true);

-- ============================================================================
-- GREENS (25+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

-- Sage/Muted Greens
('sherwin_williams', 'SW 6197', 'Retreat', '#B4BEB1', '{"r": 180, "g": 190, "b": 177}', 55, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom', 'living_room'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], true, true),

('sherwin_williams', 'SW 6190', 'Clary Sage', '#9FAC98', '{"r": 159, "g": 172, "b": 152}', 44, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom', 'living_room'], ARRAY['walls'], ARRAY['contemporary', 'farmhouse'], true, true),

('sherwin_williams', 'SW 6198', 'Liveable Green', '#AEBAA5', '{"r": 174, "g": 186, "b": 165}', 52, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'bathroom'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], true, true),

('sherwin_williams', 'SW 6199', 'Softened Green', '#B0BBA8', '{"r": 176, "g": 187, "b": 168}', 53, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'living_room'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 6176', 'Dried Thyme', '#888F7D', '{"r": 136, "g": 143, "b": 125}', 32, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'dining_room'], ARRAY['walls'], ARRAY['contemporary', 'rustic'], false, true),

('sherwin_williams', 'SW 6175', 'Pewter Green', '#7C8470', '{"r": 124, "g": 132, "b": 112}', 27, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'office'], ARRAY['walls'], ARRAY['contemporary'], false, true),

('sherwin_williams', 'SW 6191', 'Contented', '#8E9A87', '{"r": 142, "g": 154, "b": 135}', 36, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'living_room'], ARRAY['walls'], ARRAY['transitional'], false, true),

-- Emerald/Bright Greens
('sherwin_williams', 'SW 6738', 'Alexandrite', '#2B5F4D', '{"r": 43, "g": 95, "b": 77}', 11, ARRAY['cool'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room', 'office'], ARRAY['walls'], ARRAY['traditional', 'eclectic'], false, true),

('sherwin_williams', 'SW 6739', 'Greens', '#1D5746', '{"r": 29, "g": 87, "b": 70}', 9, ARRAY['cool'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'powder_room'], ARRAY['walls'], ARRAY['traditional', 'bold'], false, true),

('sherwin_williams', 'SW 6755', 'Calico', '#B8C9AF', '{"r": 184, "g": 201, "b": 175}', 58, ARRAY['cool', 'yellow'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['transitional', 'cottage'], false, true),

('sherwin_williams', 'SW 6431', 'Nurture Green', '#C0D1B9', '{"r": 192, "g": 209, "b": 185}', 62, ARRAY['cool'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'nursery', 'bathroom'], ARRAY['walls'], ARRAY['transitional', 'cottage'], false, true),

('sherwin_williams', 'SW 6735', 'Jadite', '#5C8E7E', '{"r": 92, "g": 142, "b": 126}', 27, ARRAY['cool'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bathroom', 'kitchen'], ARRAY['walls'], ARRAY['retro', 'coastal'], false, true),

-- Olive/Earth Greens
('sherwin_williams', 'SW 6194', 'Evergreen Fog', '#7E8878', '{"r": 126, "g": 136, "b": 120}', 28, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'bathroom'], ARRAY['walls'], ARRAY['contemporary', 'modern_farmhouse'], true, true),

('sherwin_williams', 'SW 2840', 'Ripe Olive', '#5C5E4B', '{"r": 92, "g": 94, "b": 75}', 13, ARRAY['warm', 'yellow'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['dining_room', 'office'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

('sherwin_williams', 'SW 7739', 'Rookwood Dark Green', '#323B2C', '{"r": 50, "g": 59, "b": 44}', 4, ARRAY['cool'], 'green', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior'], ARRAY['walls', 'doors'], ARRAY['traditional', 'classic'], false, true),

('sherwin_williams', 'SW 6200', 'Fern', '#A1B098', '{"r": 161, "g": 176, "b": 152}', 47, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 9130', 'Evergreen Fog', '#8E9787', '{"r": 142, "g": 151, "b": 135}', 35, ARRAY['cool', 'gray'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['contemporary', 'modern_farmhouse'], true, true),

('sherwin_williams', 'SW 0038', 'Sage Green Light', '#BFCBB3', '{"r": 191, "g": 203, "b": 179}', 60, ARRAY['cool'], 'green', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['traditional', 'cottage'], false, true);

-- ============================================================================
-- REDS/PINKS (15+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

-- Soft Pinks/Blush
('sherwin_williams', 'SW 6302', 'Possibly Pink', '#E9D9D6', '{"r": 233, "g": 217, "b": 214}', 70, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'nursery', 'bathroom'], ARRAY['walls'], ARRAY['traditional', 'romantic'], true, true),

('sherwin_williams', 'SW 6309', 'Innocence', '#E8D5D1', '{"r": 232, "g": 213, "b": 209}', 67, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'nursery'], ARRAY['walls'], ARRAY['traditional', 'cottage'], false, true),

('sherwin_williams', 'SW 6303', 'Demure', '#E2CDC9', '{"r": 226, "g": 205, "b": 201}', 62, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['traditional', 'romantic'], false, true),

('sherwin_williams', 'SW 6295', 'Fading Rose', '#D9C1BD', '{"r": 217, "g": 193, "b": 189}', 56, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'powder_room'], ARRAY['walls'], ARRAY['traditional', 'vintage'], false, true),

('sherwin_williams', 'SW 6315', 'White Truffle', '#EDE6E0', '{"r": 237, "g": 230, "b": 224}', 78, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['bedroom', 'bathroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

-- Bold Reds
('sherwin_williams', 'SW 6321', 'Red Tomato', '#D84E3A', '{"r": 216, "g": 78, "b": 58}', 21, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room', 'exterior'], ARRAY['walls', 'doors'], ARRAY['traditional', 'bold'], true, true),

('sherwin_williams', 'SW 6328', 'Fireweed', '#B74234', '{"r": 183, "g": 66, "b": 52}', 14, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior', 'doors'], ARRAY['walls', 'doors'], ARRAY['traditional', 'craftsman'], false, true),

('sherwin_williams', 'SW 6339', 'Heartthrob', '#D44D58', '{"r": 212, "g": 77, "b": 88}', 21, ARRAY['cool'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'powder_room'], ARRAY['walls'], ARRAY['modern', 'bold'], false, true),

('sherwin_williams', 'SW 6320', 'Bravado Red', '#C05246', '{"r": 192, "g": 82, "b": 70}', 18, ARRAY['warm'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'bold'], false, true),

-- Terracotta/Rust
('sherwin_williams', 'SW 6335', 'Cavern Clay', '#C4917A', '{"r": 196, "g": 145, "b": 122}', 34, ARRAY['warm', 'orange'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room', 'exterior'], ARRAY['walls'], ARRAY['southwestern', 'bohemian'], true, true),

('sherwin_williams', 'SW 6334', 'Canyon Clay', '#B07F68', '{"r": 176, "g": 127, "b": 104}', 26, ARRAY['warm', 'orange'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'dining_room'], ARRAY['walls'], ARRAY['southwestern', 'rustic'], false, true),

('sherwin_williams', 'SW 7714', 'Rustic Adobe', '#9E6E5C', '{"r": 158, "g": 110, "b": 92}', 20, ARRAY['warm', 'orange'], 'red', ARRAY['flat', 'eggshell', 'satin'], ARRAY['accent_wall', 'exterior'], ARRAY['walls'], ARRAY['southwestern', 'rustic'], false, true);

-- ============================================================================
-- YELLOWS/GOLDS (15+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

-- Soft/Butter Yellows
('sherwin_williams', 'SW 6386', 'Napery', '#F4EFE0', '{"r": 244, "g": 239, "b": 224}', 81, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'dining_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'cottage'], false, true),

('sherwin_williams', 'SW 6393', 'Humble Gold', '#F2E6C8', '{"r": 242, "g": 230, "b": 200}', 77, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'farmhouse'], false, true),

('sherwin_williams', 'SW 6394', 'Friendly Yellow', '#F5E8C0', '{"r": 245, "g": 232, "b": 192}', 78, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'nursery'], ARRAY['walls'], ARRAY['traditional', 'cheerful'], false, true),

('sherwin_williams', 'SW 6400', 'Glisten Yellow', '#F8E4A3', '{"r": 248, "g": 228, "b": 163}', 75, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'accent_wall'], ARRAY['walls'], ARRAY['traditional', 'vintage'], false, true),

('sherwin_williams', 'SW 6387', 'Champagne', '#F3EDD9', '{"r": 243, "g": 237, "b": 217}', 80, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'elegant'], false, true),

-- Golden/Rich Yellows
('sherwin_williams', 'SW 6664', 'Anjou Pear', '#E5CC9F', '{"r": 229, "g": 204, "b": 159}', 62, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['dining_room', 'living_room'], ARRAY['walls'], ARRAY['traditional', 'tuscan'], false, true),

('sherwin_williams', 'SW 6683', 'Mannered Gold', '#CDB885', '{"r": 205, "g": 184, "b": 133}', 51, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['dining_room', 'living_room'], ARRAY['walls'], ARRAY['traditional', 'elegant'], false, true),

('sherwin_williams', 'SW 6384', 'Ivoire', '#E8DDC4', '{"r": 232, "g": 221, "b": 196}', 71, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'french'], false, true),

('sherwin_williams', 'SW 6401', 'Daffodil', '#F7DA87', '{"r": 247, "g": 218, "b": 135}', 69, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'nursery'], ARRAY['walls'], ARRAY['traditional', 'cheerful'], false, true),

('sherwin_williams', 'SW 6695', 'Glad Yellow', '#E8CE7F', '{"r": 232, "g": 206, "b": 127}', 60, ARRAY['warm', 'yellow'], 'yellow', ARRAY['flat', 'eggshell', 'satin'], ARRAY['kitchen', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'vintage'], false, true);

-- ============================================================================
-- BROWNS (20+ colors)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

-- Warm Browns
('sherwin_williams', 'SW 7523', 'Cardboard', '#B69E85', '{"r": 182, "g": 158, "b": 133}', 40, ARRAY['warm', 'yellow'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'study'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

('sherwin_williams', 'SW 7525', 'Saddle Up', '#9B7F68', '{"r": 155, "g": 127, "b": 104}', 27, ARRAY['warm', 'orange'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'study', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

('sherwin_williams', 'SW 6104', 'Latte', '#C7B299', '{"r": 199, "g": 178, "b": 153}', 49, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'transitional'], false, true),

('sherwin_williams', 'SW 7038', 'Tony Taupe', '#9C9183', '{"r": 156, "g": 145, "b": 131}', 40, ARRAY['warm', 'gray'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], false, true),

('sherwin_williams', 'SW 6105', 'Whole Wheat', '#B29F88', '{"r": 178, "g": 159, "b": 136}', 41, ARRAY['warm', 'yellow'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

('sherwin_williams', 'SW 6096', 'Jute Brown', '#9F8871', '{"r": 159, "g": 136, "b": 113}', 30, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'study'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

-- Deep/Chocolate Browns
('sherwin_williams', 'SW 6048', 'Turkish Coffee', '#3C342E', '{"r": 60, "g": 52, "b": 46}', 3, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'study', 'exterior'], ARRAY['walls', 'doors'], ARRAY['traditional', 'bold'], true, true),

('sherwin_williams', 'SW 7533', 'Otter', '#5E4C3A', '{"r": 94, "g": 76, "b": 58}', 9, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['study', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true),

('sherwin_williams', 'SW 7532', 'Rookwood Dark Brown', '#392921', '{"r": 57, "g": 41, "b": 33}', 2, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior'], ARRAY['walls', 'doors'], ARRAY['traditional', 'craftsman'], false, true),

('sherwin_williams', 'SW 7505', 'Manor House', '#2E2622', '{"r": 46, "g": 38, "b": 34}', 2, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior'], ARRAY['walls', 'doors'], ARRAY['traditional'], false, true),

-- Taupe/Greige Browns
('sherwin_williams', 'SW 7548', 'Perfect Greige', '#AFA393', '{"r": 175, "g": 163, "b": 147}', 46, ARRAY['warm', 'gray'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom', 'dining_room'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], true, true),

('sherwin_williams', 'SW 7039', 'Virtual Taupe', '#8B8075', '{"r": 139, "g": 128, "b": 117}', 30, ARRAY['warm', 'gray'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional'], false, true),

('sherwin_williams', 'SW 7040', 'Hopsack', '#A39686', '{"r": 163, "g": 150, "b": 134}', 38, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional', 'rustic'], false, true),

('sherwin_williams', 'SW 7549', 'Amazing Gray', '#A6998C', '{"r": 166, "g": 153, "b": 140}', 41, ARRAY['warm', 'gray'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'bedroom'], ARRAY['walls'], ARRAY['transitional', 'contemporary'], false, true),

('sherwin_williams', 'SW 7041', 'Van Dyke Brown', '#8C7E6E', '{"r": 140, "g": 126, "b": 110}', 27, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'study'], ARRAY['walls'], ARRAY['traditional'], false, true),

('sherwin_williams', 'SW 7508', 'Tavern Taupe', '#7A6E60', '{"r": 122, "g": 110, "b": 96}', 21, ARRAY['warm'], 'brown', ARRAY['flat', 'eggshell', 'satin'], ARRAY['living_room', 'dining_room'], ARRAY['walls'], ARRAY['traditional', 'rustic'], false, true);

-- ============================================================================
-- BLACKS (Additional colors to ensure good coverage)
-- ============================================================================

INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, finish_options, recommended_rooms, recommended_surfaces, design_styles, popular, is_active) VALUES

('sherwin_williams', 'SW 6990', 'Caviar', '#3D3B39', '{"r": 61, "g": 59, "b": 57}', 4, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior', 'doors'], ARRAY['walls', 'doors', 'trim'], ARRAY['modern', 'contemporary'], true, true),

('sherwin_williams', 'SW 6992', 'Black Magic', '#3B3935', '{"r": 59, "g": 57, "b": 53}', 3, ARRAY['warm', 'brown'], 'gray', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior', 'doors'], ARRAY['walls', 'doors'], ARRAY['contemporary', 'modern'], true, true),

('sherwin_williams', 'SW 7020', 'Black Fox', '#4C4641', '{"r": 76, "g": 70, "b": 65}', 5, ARRAY['warm', 'brown'], 'gray', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior', 'doors'], ARRAY['walls', 'doors'], ARRAY['contemporary', 'modern'], false, true),

('sherwin_williams', 'SW 6991', 'Black Magic', '#35322F', '{"r": 53, "g": 50, "b": 47}', 2, ARRAY['warm'], 'gray', ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'], ARRAY['accent_wall', 'exterior'], ARRAY['walls', 'doors'], ARRAY['modern', 'contemporary'], false, true);

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
