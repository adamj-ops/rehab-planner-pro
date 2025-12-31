-- ============================================================================
-- Cost Items Catalog Migration
-- Seeds the cost_items table with 50+ renovation items
-- ============================================================================

-- Create cost_items table if not exists
CREATE TABLE IF NOT EXISTS cost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    
    -- Cost Information
    base_cost_low DECIMAL(10,2) NOT NULL,
    base_cost_mid DECIMAL(10,2) NOT NULL,
    base_cost_high DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'each', -- per sqft, each, linear ft, etc.
    
    -- Quality Tier Multipliers
    quality_basic DECIMAL(4,2) DEFAULT 0.75,
    quality_standard DECIMAL(4,2) DEFAULT 1.00,
    quality_premium DECIMAL(4,2) DEFAULT 1.50,
    quality_luxury DECIMAL(4,2) DEFAULT 2.25,
    
    -- ROI & Market Impact
    typical_roi_percentage INTEGER DEFAULT 50, -- Expected ROI (e.g., 50 = 50%)
    buyer_appeal_score INTEGER DEFAULT 5, -- 1-10 scale
    market_trend VARCHAR(20) DEFAULT 'stable', -- declining, stable, growing, hot
    
    -- Dependencies & Complexity
    complexity_score INTEGER DEFAULT 3, -- 1-5 (1 = easy, 5 = complex)
    typical_duration_days INTEGER DEFAULT 1,
    requires_permit BOOLEAN DEFAULT false,
    typical_dependencies TEXT[], -- Array of category/item dependencies
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cost_items_category ON cost_items(category);
CREATE INDEX IF NOT EXISTS idx_cost_items_subcategory ON cost_items(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_cost_items_active ON cost_items(is_active);

-- Enable RLS
ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read cost items
CREATE POLICY "Cost items are viewable by all authenticated users" ON cost_items
FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- SEED DATA: 50+ Renovation Items
-- ============================================================================

INSERT INTO cost_items (name, description, category, subcategory, base_cost_low, base_cost_mid, base_cost_high, unit, typical_roi_percentage, buyer_appeal_score, complexity_score, typical_duration_days, requires_permit) VALUES

-- KITCHEN (12 items)
('Kitchen Cabinet Refinishing', 'Sand, prime, and repaint existing cabinets', 'kitchen', 'cabinets', 1500, 2500, 4000, 'project', 80, 7, 2, 3, false),
('Kitchen Cabinet Replacement', 'Remove and install new cabinets', 'kitchen', 'cabinets', 8000, 15000, 30000, 'project', 65, 9, 4, 5, false),
('Kitchen Countertop - Laminate', 'Install laminate countertops', 'kitchen', 'countertops', 800, 1500, 2500, 'project', 60, 5, 2, 1, false),
('Kitchen Countertop - Granite', 'Install granite countertops', 'kitchen', 'countertops', 2500, 4000, 7000, 'project', 75, 8, 3, 2, false),
('Kitchen Countertop - Quartz', 'Install quartz countertops', 'kitchen', 'countertops', 3000, 5000, 9000, 'project', 80, 9, 3, 2, false),
('Kitchen Backsplash - Tile', 'Install ceramic or porcelain tile backsplash', 'kitchen', 'backsplash', 500, 1200, 2500, 'project', 70, 7, 2, 2, false),
('Kitchen Appliance Package - Basic', 'Replace stove, refrigerator, dishwasher', 'kitchen', 'appliances', 1800, 2500, 4000, 'package', 55, 7, 1, 1, false),
('Kitchen Appliance Package - Stainless', 'Stainless steel appliance package', 'kitchen', 'appliances', 3000, 5000, 8000, 'package', 70, 9, 1, 1, false),
('Kitchen Sink & Faucet', 'Replace sink and faucet', 'kitchen', 'plumbing', 400, 800, 1500, 'each', 60, 6, 2, 1, false),
('Kitchen Lighting Update', 'Replace fixtures, add under-cabinet lighting', 'kitchen', 'electrical', 300, 800, 2000, 'project', 65, 7, 2, 1, false),
('Kitchen Floor - Vinyl Plank', 'Install luxury vinyl plank flooring', 'kitchen', 'flooring', 800, 1500, 2500, 'project', 70, 7, 2, 1, false),
('Kitchen Floor - Tile', 'Install ceramic or porcelain tile', 'kitchen', 'flooring', 1200, 2500, 4500, 'project', 75, 8, 3, 2, false),

-- BATHROOM (10 items)
('Bathroom Vanity Replacement', 'Remove and install new vanity with sink', 'bathroom', 'fixtures', 400, 1000, 2500, 'each', 70, 8, 2, 1, false),
('Bathroom Tub/Shower Refinishing', 'Reglaze existing tub or shower', 'bathroom', 'fixtures', 300, 500, 800, 'each', 80, 5, 2, 1, false),
('Bathroom Tub Replacement', 'Remove and install new tub', 'bathroom', 'fixtures', 1500, 3000, 6000, 'each', 65, 7, 3, 2, true),
('Bathroom Tile Surround', 'Install tile tub/shower surround', 'bathroom', 'tile', 1000, 2500, 5000, 'project', 75, 8, 3, 3, false),
('Bathroom Floor Tile', 'Replace bathroom floor with tile', 'bathroom', 'flooring', 500, 1200, 2500, 'project', 70, 7, 3, 2, false),
('Toilet Replacement', 'Remove and install new toilet', 'bathroom', 'plumbing', 200, 400, 800, 'each', 60, 5, 1, 1, false),
('Bathroom Mirror & Lighting', 'Update mirror and light fixtures', 'bathroom', 'fixtures', 200, 500, 1200, 'project', 65, 7, 1, 1, false),
('Bathroom Exhaust Fan', 'Replace or install exhaust fan', 'bathroom', 'electrical', 150, 300, 600, 'each', 55, 4, 2, 1, true),
('Bathroom Full Remodel', 'Complete bathroom renovation', 'bathroom', 'remodel', 5000, 12000, 25000, 'project', 70, 9, 5, 7, true),
('Bathroom Hardware Update', 'Replace all hardware (towel bars, TP holder, etc)', 'bathroom', 'fixtures', 100, 250, 500, 'project', 75, 6, 1, 1, false),

-- FLOORING (8 items)
('Carpet Replacement', 'Remove and install new carpet with pad', 'flooring', 'carpet', 3, 5, 8, 'sqft', 50, 5, 2, 2, false),
('Hardwood Refinishing', 'Sand and refinish existing hardwood floors', 'flooring', 'hardwood', 3, 5, 8, 'sqft', 85, 9, 3, 3, false),
('Hardwood Installation', 'Install new hardwood flooring', 'flooring', 'hardwood', 8, 12, 18, 'sqft', 80, 10, 4, 5, false),
('Luxury Vinyl Plank (LVP)', 'Install LVP flooring', 'flooring', 'vinyl', 4, 7, 11, 'sqft', 75, 8, 2, 2, false),
('Laminate Flooring', 'Install laminate flooring', 'flooring', 'laminate', 3, 5, 8, 'sqft', 65, 6, 2, 2, false),
('Tile Flooring', 'Install ceramic or porcelain tile', 'flooring', 'tile', 8, 14, 22, 'sqft', 70, 8, 3, 3, false),
('Subfloor Repair', 'Repair or replace damaged subfloor', 'flooring', 'repair', 3, 6, 10, 'sqft', 40, 3, 3, 2, false),
('Baseboard Installation', 'Install new baseboards', 'flooring', 'trim', 2, 4, 7, 'lf', 50, 5, 2, 1, false),

-- PAINT & WALLS (6 items)
('Interior Paint - Basic', 'Paint walls and ceilings (basic quality)', 'paint', 'interior', 1, 2, 3, 'sqft', 85, 8, 1, 3, false),
('Interior Paint - Premium', 'Paint with premium paint and prep', 'paint', 'interior', 2, 3, 5, 'sqft', 90, 9, 2, 4, false),
('Exterior Paint', 'Paint exterior siding and trim', 'paint', 'exterior', 2, 4, 7, 'sqft', 75, 8, 3, 5, false),
('Drywall Repair', 'Patch and repair damaged drywall', 'paint', 'repair', 200, 500, 1200, 'project', 60, 4, 2, 1, false),
('Popcorn Ceiling Removal', 'Remove textured ceiling finish', 'paint', 'ceiling', 2, 3, 5, 'sqft', 75, 7, 3, 2, false),
('Accent Wall / Shiplap', 'Install shiplap or accent treatment', 'paint', 'accent', 8, 15, 25, 'sqft', 65, 8, 2, 2, false),

-- EXTERIOR (8 items)
('Roof Replacement', 'Remove and install new shingle roof', 'exterior', 'roof', 8000, 12000, 20000, 'project', 60, 7, 5, 5, true),
('Roof Repair', 'Repair damaged areas of roof', 'exterior', 'roof', 500, 1500, 4000, 'project', 55, 5, 3, 1, false),
('Siding Replacement', 'Remove and install new siding', 'exterior', 'siding', 8000, 15000, 25000, 'project', 70, 8, 4, 7, true),
('Gutter Replacement', 'Install new gutters and downspouts', 'exterior', 'drainage', 800, 1500, 3000, 'project', 50, 4, 2, 1, false),
('Exterior Door Replacement', 'Replace entry door', 'exterior', 'doors', 800, 2000, 5000, 'each', 75, 9, 2, 1, false),
('Garage Door Replacement', 'Replace garage door', 'exterior', 'doors', 1000, 2000, 4000, 'each', 80, 8, 2, 1, false),
('Deck/Porch Repair', 'Repair existing deck or porch', 'exterior', 'outdoor', 500, 2000, 5000, 'project', 60, 7, 3, 3, true),
('Landscaping Basic', 'Clean up, mulch, basic plants', 'exterior', 'landscape', 500, 1500, 4000, 'project', 100, 9, 2, 2, false),

-- SYSTEMS (8 items)
('HVAC Service & Clean', 'Service and clean HVAC system', 'systems', 'hvac', 150, 300, 500, 'each', 50, 4, 1, 1, false),
('HVAC Replacement', 'Replace furnace and/or AC unit', 'systems', 'hvac', 5000, 8000, 15000, 'project', 55, 6, 4, 3, true),
('Water Heater Replacement', 'Replace water heater', 'systems', 'plumbing', 800, 1500, 3000, 'each', 50, 5, 2, 1, true),
('Electrical Panel Upgrade', 'Upgrade main electrical panel', 'systems', 'electrical', 1500, 2500, 4500, 'project', 45, 4, 4, 2, true),
('Plumbing Repair', 'Fix leaks, replace fixtures', 'systems', 'plumbing', 300, 800, 2000, 'project', 40, 3, 2, 1, false),
('Plumbing Repipe', 'Replace supply or drain lines', 'systems', 'plumbing', 3000, 6000, 12000, 'project', 35, 3, 5, 5, true),
('Electrical Rewire', 'Update electrical wiring', 'systems', 'electrical', 4000, 8000, 15000, 'project', 40, 4, 5, 7, true),
('Insulation Upgrade', 'Add or replace insulation', 'systems', 'insulation', 1500, 3000, 6000, 'project', 50, 4, 3, 2, false),

-- WINDOWS & DOORS (4 items)
('Window Replacement - Vinyl', 'Replace windows with vinyl', 'windows', 'replacement', 300, 500, 800, 'each', 70, 8, 2, 1, false),
('Window Replacement - Premium', 'Replace with premium windows', 'windows', 'replacement', 600, 1000, 1800, 'each', 75, 9, 2, 1, false),
('Interior Door Replacement', 'Replace interior doors', 'windows', 'doors', 150, 300, 600, 'each', 60, 6, 2, 1, false),
('Closet System Install', 'Install closet organization system', 'windows', 'closets', 200, 600, 1500, 'each', 70, 8, 2, 1, false)

ON CONFLICT (id) DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_cost_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cost_items_updated_at ON cost_items;
CREATE TRIGGER set_cost_items_updated_at
BEFORE UPDATE ON cost_items
FOR EACH ROW
EXECUTE FUNCTION update_cost_items_updated_at();
