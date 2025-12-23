# VENDOR PACKET TEMPLATES - DETAILED SPECIFICATIONS
Complete templates for all 4 vendor packet types with content blocks, filtering logic, and generation specs

---

## TABLE OF CONTENTS
1. [Contractor Packet Template](#contractor-packet)
2. [Stager Packet Template](#stager-packet)
3. [Photographer Packet Template](#photographer-packet)
4. [Real Estate Agent Packet Template](#agent-packet)
5. [Shared Components](#shared-components)
6. [PDF Generation Specs](#pdf-generation)
7. [Email Templates](#email-templates)

---

## CONTRACTOR PACKET TEMPLATE {#contractor-packet}

### Purpose
Provide contractors with everything needed to bid accurately and execute work according to design vision.

### Recipient Types
- General contractors
- Specialized trades (HVAC, plumbing, electrical, etc.)
- Material suppliers
- Installation specialists

### Cover Page
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [COMPANY LOGO]                         │
│                                                     │
│         CONTRACTOR WORK PACKET                      │
│                                                     │
│  Property: {property_address}                       │
│  Project: {project_name}                            │
│  Trade: {selected_trades or "All Trades"}          │
│                                                     │
│  Prepared for: {contractor_name}                    │
│  Date: {generation_date}                            │
│                                                     │
│  Contact: {user_name}                               │
│  Email: {user_email}                                │
│  Phone: {user_phone}                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Section 1: Project Overview
**Content Blocks:**

```markdown
## Project Overview

**Property Information**
- Address: {full_property_address}
- Property Type: {single_family | multi_family | condo}
- Square Footage: {total_sqft} sq ft
- Year Built: {year_built}
- Bedrooms: {bedrooms} | Bathrooms: {bathrooms}

**Project Scope**
{project_description}

**Target Completion Date:** {target_end_date}
**Project Timeline:** {duration_weeks} weeks

**Design Style:** {design_style}
- Target Buyer: {target_market}
- Design Aesthetic: {style_keywords}

**Budget Overview**
- Total Estimated Budget: ${total_budget}
- Your Trade Allocation: ${trade_budget} (if filtered by trade)
```

### Section 2: Design Vision & Materials

**Conditional:** Only if design/moodboard exists

```markdown
## Design Vision

**Overall Aesthetic**
{design_description}

**Color Palette**
[Color swatches with codes]
- Primary: {color_name} ({color_code}) - {hex_code}
- Secondary: {color_name} ({color_code}) - {hex_code}
- Accent: {color_name} ({color_code}) - {hex_code}

**Material Selections**

### Kitchen
- Countertops: {material_name} - {brand} {model}
- Cabinets: {color/finish} - {style}
- Backsplash: {material_name}
- Flooring: {material_name}
- Hardware: {finish} - {style}

### Bathrooms
- Vanity Counters: {material_name}
- Tile: {material_name}
- Fixtures: {finish}
- Flooring: {material_name}

### Flooring
- Living Areas: {material_name}
- Bedrooms: {material_name}
- Wet Areas: {material_name}

### Paint Schedule
[Table format]
| Room          | Walls              | Trim               | Ceiling            |
|---------------|--------------------|--------------------|--------------------| 
| Living Room   | SW 7005 Eggshell   | SW 7006 Semi-Gloss | Flat White         |
| Kitchen       | SW 7005 Satin      | SW 7006 Semi-Gloss | Flat White         |
```

**Moodboard Integration:**
- Include 2-4 moodboard images (full-page, high-res)
- Caption: "Design reference - maintain aesthetic shown in materials and finishes"

### Section 3: Detailed Scope of Work

**Filtering Logic:**

```typescript
interface ScopeFiltering {
  // When trade(s) selected
  filterByTrade: boolean;
  selectedTrades: string[]; // ['plumbing', 'hvac']
  
  // Show/hide pricing
  showPricing: boolean;
  showMaterialCosts: boolean;
  showLaborCosts: boolean;
  
  // Detail level
  showFullSpecs: boolean;
  showInstallationNotes: boolean;
}
```

**Scope Presentation:**

```markdown
## Scope of Work

### Summary
{trade_specific_summary}
Total Items: {filtered_item_count}
Estimated Value: ${total_value} (if showPricing)

---

### CATEGORY: {category_name}

#### {scope_item_title}
**Priority:** {High | Medium | Low}
**Phase:** {phase_name}
**Estimated Timeline:** {timeline_start} - {timeline_end}

**Description:**
{full_description}

**Specifications:**
{detailed_specifications}
- Spec line 1
- Spec line 2
- Spec line 3

**Materials Required:**
| Item                    | Quantity | Unit      | Specified Product          |
|-------------------------|----------|-----------|----------------------------|
| {material_name}         | {qty}    | {unit}    | {brand} - {model}          |

**Installation Notes:**
{installation_instructions}
{special_requirements}

**Linked Design Elements:**
- See moodboard: {moodboard_reference}
- Color: {color_selection}
- Material sample: [Image]

**Cost Breakdown:** (if showPricing)
- Materials: ${material_cost}
- Labor: ${labor_cost}
- Subtotal: ${item_total}

---
```

**Example - Filtered for Plumbing Trade:**

```markdown
## Scope of Work - PLUMBING

### Summary
Plumbing scope includes rough-in, finish work, and fixture installation
Total Items: 8
Estimated Value: $12,450

---

### BATHROOMS

#### Primary Bathroom - Complete Renovation
**Priority:** High
**Phase:** Interior Finish
**Estimated Timeline:** Week 8-10

**Description:**
Full bathroom renovation including new vanity, shower, toilet, and all plumbing fixtures.
Relocate shower drain 18" to accommodate new 48" tile shower.

**Rough-In Requirements:**
- Relocate shower drain to accommodate new shower pan location
- Install new shower valve (Moen T2133 thermostatic)
- Rough-in for wall-mount vanity faucet
- Verify all shut-offs and supply lines

**Finish Work:**
- Install Kohler K-2215 undermount sink
- Install Moen TS22003 wall-mount faucet (Matte Black)
- Install Moen T2133 shower valve with handheld
- Install Kohler K-3999 Highline toilet

**Materials Provided By:**
Owner will provide all fixtures (listed above)
Contractor provides all rough-in materials, supply lines, drain assemblies

**Installation Notes:**
- Matte black finish throughout - protect during installation
- Wall-mount faucet requires blocking in wall (coordinate with framer)
- Shower valve should be centered on 48" wide shower
- Maintain 16" clearance from toilet center to vanity

**Linked Design Elements:**
- See Primary Bath moodboard (Page 12)
- Tile: MSI Carrara White 3x12 Subway
- Grout: Mapei Ultracolor Plus - Warm Gray

**Cost Breakdown:**
- Rough-in Labor: $850
- Finish Labor: $1,200
- Materials (valves, drains, supplies): $320
- Subtotal: $2,370

---

#### Guest Bathroom - Fixture Replacement
**Priority:** Medium
**Phase:** Interior Finish
**Estimated Timeline:** Week 9

**Description:**
Replace existing fixtures with updated models. No drain or supply line relocations needed.

[... continues with similar detail]
```

### Section 4: Project Timeline

```markdown
## Project Timeline

**Overall Timeline**
Start Date: {project_start_date}
Target Completion: {project_end_date}
Duration: {total_weeks} weeks

**Your Work Window**
Estimated Start: {trade_start_date}
Estimated Completion: {trade_end_date}
Duration: {trade_duration}

### Schedule Overview

**Phase 1: Demolition & Preparation** (Weeks 1-2)
- General demo
- Dumpster on site
- Your involvement: {if applicable}

**Phase 2: Systems & Rough-In** (Weeks 3-5)
- Electrical rough-in
- Plumbing rough-in  
- HVAC installation
- **Your work:** {trade_specific_tasks}

**Phase 3: Insulation & Drywall** (Weeks 5-7)
- Insulation
- Drywall installation
- Drywall finishing
- Your involvement: {if applicable}

**Phase 4: Interior Finish** (Weeks 8-12)
- Paint
- Flooring
- Cabinetry
- Countertops
- **Your work:** {trade_specific_tasks}

**Phase 5: Final Details** (Weeks 13-14)
- Fixture installation
- Hardware installation
- Final touches
- Your involvement: {if applicable}

### Critical Dependencies
⚠️ Items that must be completed before your work can begin:
{dependency_list}

### Items That Depend On Your Work
📌 Work that will follow your completion:
{following_work_list}
```

**Gantt Chart Visual:**
```
[Include simplified Gantt showing full project with contractor's work highlighted]

Weeks:  1  2  3  4  5  6  7  8  9  10 11 12 13 14
Demo    ████
Systems       ████████
        -----[YOUR WORK: Plumbing]-----
Drywall             ████████
Finish                    ████████████
        -----------------[Plumbing finish work]-----
```

### Section 5: Site Information & Access

```markdown
## Site Access & Logistics

**Property Access**
- Key Location: {key_location or "Lockbox code: {code}"}
- Access Hours: {allowed_hours}
- Parking: {parking_instructions}
- Dumpster Location: {dumpster_info}

**Site Conditions**
- Property Status: {occupied | vacant}
- Utilities Status:
  - Electric: {on | off | disconnect date}
  - Water: {on | off}
  - Gas: {on | off}
  - HVAC: {operational | removed}

**Job Site Rules**
- ✓ Clean up daily
- ✓ Protect finished surfaces
- ✓ Use drop cloths and surface protection
- ✓ No smoking on property
- ✓ Lock up when leaving
- ✓ Report any damage immediately

**Communication Protocol**
- Primary Contact: {name} - {phone}
- Preferred Method: {text | call | email}
- Response Time: Within {hours} hours
- Weekly Meetings: {day/time if scheduled}

**Inspection Requirements**
Required inspections for your scope:
- {inspection_type}: Scheduled for {date or "TBD"}
- Inspector: {name/company if known}
- Inspection Checklist: {link or "See attached"}

**Materials Delivery**
- Delivery Address: {address}
- Delivery Instructions: {instructions}
- Receiving Contact: {name/phone}
- Storage Location: {where materials go}
```

### Section 6: Expectations & Standards

```markdown
## Project Standards & Expectations

### Quality Standards
All work must meet or exceed:
- Local building codes and ordinances
- Manufacturer installation guidelines
- Industry best practices
- Design specifications outlined in this packet

### Workmanship Expectations
- Professional-grade finish quality
- Attention to detail - this is a high-quality renovation
- Clean, straight lines and proper alignment
- Minimal touch-up required

### Change Order Process
Any deviations from this scope require written approval:

1. Identify the change needed
2. Document with photos if related to existing conditions
3. Provide pricing for change
4. Get written approval before proceeding
5. Update timeline if impacted

**Contact for change orders:** {name} - {email}

### Payment Terms
{payment_schedule if included}
- Deposit: {amount}% upon signing
- Progress Payments: {schedule}
- Final Payment: Upon completion and inspection approval

### Warranty
Required warranty on your work:
- Workmanship: {warranty_period}
- Materials: Per manufacturer specifications
- Warranty documentation due at project completion

### Documentation Required
Please provide upon completion:
- Photos of completed work
- Warranty documentation
- Material receipts/documentation
- Any as-built changes from original plan
```

### Section 7: Appendices

```markdown
## Appendices

### A. Product Specifications
[Detailed specs for specified products]

### B. Moodboard Reference Images
[Full-page, high-res moodboard images]

### C. Existing Conditions Photos
[If applicable - before photos showing current state]

### D. Technical Drawings
[If applicable - any CAD drawings, elevations]

### E. Material Cut Sheets
[Manufacturer spec sheets for key materials]

### F. Contact Directory
All project contacts and roles
```

### Filtering Configuration UI

```typescript
interface ContractorPacketConfig {
  // Trade Filtering
  filterByTrade: boolean;
  selectedTrades: string[];
  // Options: 'all', 'plumbing', 'electrical', 'hvac', 'flooring', etc.
  
  // Content Sections
  includeSections: {
    projectOverview: boolean;
    designVision: boolean;
    moodboard: boolean;
    scopeOfWork: boolean;
    timeline: boolean;
    siteAccess: boolean;
    expectations: boolean;
  };
  
  // Pricing Display
  showPricing: {
    materialCosts: boolean;
    laborCosts: boolean;
    totalCosts: boolean;
  };
  
  // Detail Level
  detailLevel: 'summary' | 'standard' | 'comprehensive';
  
  // Custom Sections
  customSections: Array<{
    title: string;
    content: string;
    position: number; // Where in packet
  }>;
}
```

---

## STAGER PACKET TEMPLATE {#stager-packet}

### Purpose
Provide staging professionals with design vision, buyer profile, and room priorities to create compelling staging.

### Cover Page
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [COMPANY LOGO]                         │
│                                                     │
│           STAGING BRIEF                             │
│                                                     │
│  Property: {property_address}                       │
│  Project: {project_name}                            │
│                                                     │
│  Prepared for: {stager_name}                        │
│  Staging Company: {company_name}                    │
│  Date: {generation_date}                            │
│                                                     │
│  Photography Date: {photo_date}                     │
│  Target List Date: {list_date}                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Section 1: Property Overview & Target Buyer

```markdown
## Property Overview

**Address:** {property_address}
**Property Type:** {single_family | townhome | condo}
**Square Footage:** {sqft} sq ft
**Bedrooms:** {beds} | **Bathrooms:** {baths}
**Year Built:** {year} | **Lot Size:** {lot_size}

**Listing Price:** ${list_price}
**Price Per Sq Ft:** ${price_per_sqft}
**Comparable Sales:** ${comp_range}

---

## Target Buyer Profile

**Primary Target:** {buyer_persona}
- Age Range: {age_range}
- Household Type: {household_type}
- Income Level: {income_range}
- Lifestyle: {lifestyle_description}

**What They're Looking For:**
{buyer_priorities}
- {priority_1}
- {priority_2}
- {priority_3}

**Emotional Connection Points:**
{emotional_triggers}
- {trigger_1}
- {trigger_2}

**Example:** 
```
Primary Target: First-Time Buyer Couple (28-35 years old)
- Age Range: 28-35
- Household Type: Young professional couple, possibly with first child
- Income Level: $85,000-$120,000 combined
- Lifestyle: Active, value convenience and modern amenities

What They're Looking For:
- Move-in ready home with updated finishes
- Low-maintenance lifestyle
- Space for growing family
- Home office potential
- Smart home features

Emotional Connection Points:
- "This is where we'll start our family"
- "Finally, a place that feels like ours"
- "Modern and fresh - not a fixer-upper"
- "Safe, welcoming neighborhood feel"
```

### Section 2: Design Vision & Aesthetic

```markdown
## Design Aesthetic

**Overall Style:** {design_style}
**Key Design Elements:**
- {element_1}
- {element_2}
- {element_3}

**Style Keywords:**
{style_keyword_1} • {style_keyword_2} • {style_keyword_3} • {style_keyword_4}

**Design Philosophy:**
{design_philosophy_paragraph}

---

## Color Palette

**Primary Colors**
[Large color swatches]
□ {color_name} ({color_code}) - {usage}
□ {color_name} ({color_code}) - {usage}

**Accent Colors**
[Smaller swatches]
□ {color_name} - {usage}
□ {color_name} - {usage}

**Finishes & Textures:**
- Metals: {metal_finishes}
- Woods: {wood_tones}
- Fabrics: {fabric_descriptions}
- Patterns: {pattern_guidance}

---

## Full Moodboard
[Full-page spread of moodboard images - 2-3 pages]

**Moodboard Notes:**
This moodboard represents the completed renovation aesthetic. Your staging should:
✓ Complement these finishes and colors
✓ Enhance the modern/contemporary feel
✓ Appeal to our target buyer
✓ Create cohesive flow throughout home

**Design Features to Emphasize:**
- {feature_1_with_location}
- {feature_2_with_location}
- {feature_3_with_location}
```

**Example:**
```
Overall Style: Modern Farmhouse
Key Design Elements:
- Clean white cabinetry with matte black hardware
- Warm wood tones in flooring and accents
- Subway tile backsplash with classic appeal
- Mixed metals (matte black + brushed brass)

Style Keywords:
Fresh • Bright • Warm • Inviting • Modern • Classic

Design Philosophy:
We've created a modern farmhouse aesthetic that balances contemporary 
updates with warm, inviting elements. The palette is predominantly white 
and gray with warm wood accents. The goal is "Instagram-worthy" spaces 
that feel both on-trend and timeless.

Design Features to Emphasize:
- White kitchen with waterfall island (hero feature)
- Primary bedroom with spa-like en-suite
- Open floor plan with natural light
- Smart home features throughout
```

### Section 3: Room-by-Room Staging Priorities

```markdown
## Staging Scope & Priorities

**Staging Tier:** {basic | standard | premium | luxury}
**Total Budget:** ${staging_budget}

---

### Priority Ranking

**Must-Stage (High Priority):**
1. {room_1} - ${budget_allocation}
2. {room_2} - ${budget_allocation}
3. {room_3} - ${budget_allocation}

**Should-Stage (Medium Priority):**
1. {room_4} - ${budget_allocation}
2. {room_5} - ${budget_allocation}

**Optional (Low Priority):**
1. {room_6} - ${budget_allocation}

---

### LIVING ROOM / MAIN LIVING SPACE

**Priority:** High
**Budget Allocation:** ${amount}

**Space Details:**
- Dimensions: {dimensions}
- Natural Light: {light_description}
- Focal Points: {focal_points}
- Challenges: {any_challenges}

**Staging Goals:**
{staging_goal_description}

**Style Direction:**
- Furniture Style: {style_guidance}
- Color Palette: {specific_colors}
- Scale: {furniture_scale_notes}
- Layout: {layout_preferences}

**Must-Haves:**
- {must_have_1}
- {must_have_2}
- {must_have_3}

**Feature Highlights:**
- Emphasize: {feature_to_highlight}
- Downplay: {feature_to_minimize if any}

**Photography Considerations:**
Best angles for photos: {photo_angles}
Key shots needed: {shot_list}

---

### KITCHEN

**Priority:** High (Hero Space)
**Budget Allocation:** ${amount}

**Space Details:**
- Layout: {kitchen_layout}
- Counter Space: {counter_description}
- Island: {island_details}
- Eat-in Area: {yes/no + details}

**Staging Goals:**
The kitchen is our #1 selling feature. Goal is to showcase the brand-new 
renovation while creating an aspirational cooking/gathering space.

**Style Direction:**
- Keep counters mostly clear - show off quartz waterfall edge
- Use styling to add warmth to white cabinetry
- Emphasize the "coffee bar" section with intentional styling
- Create breakfast nook moment at island with bar stools

**Must-Haves:**
- Modern bar stools (2-3) for island in {color/style}
- Minimal countertop styling (bowl + greenery + coffee station)
- Under-cabinet lighting turned on for photos
- Fresh flowers or greenery

**Feature Highlights:**
- Waterfall edge island (hero shot!)
- Matte black faucet and hardware
- Subway tile backsplash with white grout
- Soft-close cabinetry (show in video walkthrough)

**What NOT to do:**
- Don't clutter counters with too many accessories
- Avoid small appliances on counters
- No bright colors that compete with finishes

---

### PRIMARY BEDROOM

**Priority:** High
**Budget Allocation:** ${amount}

**Space Details:**
- Dimensions: {dimensions}
- Natural Light: {window_description}
- Closet: {walk-in/reach-in + size}
- En-suite: {bathroom_details}

**Staging Goals:**
Create a serene, hotel-like retreat that feels spacious and luxurious.

**Style Direction:**
- Bedding: Crisp white or soft neutral with texture
- Headboard: Upholstered in neutral (gray/beige/cream)
- Scale: Queen or King - keep proportional to room
- Nightstands: Matching or coordinating pair

**Must-Haves:**
- Upholstered bed with quality bedding
- Nightstands with lamps (matching or coordinated)
- Artwork above bed (calm, neutral, large-scale)
- Rug under bed (extends 24" beyond bed on sides)

**Feature Highlights:**
- Walk-in closet (show organization system)
- En-suite bathroom (stage as spa-like)
- Large windows with natural light

**Photography Considerations:**
Shoot from doorway to show full room flow into en-suite

---

[... Continue for each room: Guest Bedrooms, Bathrooms, Dining Room, 
Home Office, Outdoor Spaces, etc.]
```

### Section 4: Completed Renovation Showcase

```markdown
## Renovation Highlights

**Renovation Scope:**
${total_rehab_cost} renovation focused on:
- {renovation_focus_1}
- {renovation_focus_2}
- {renovation_focus_3}

**Before & After Photos**
[Grid layout of before/after comparisons]

These images show the transformation. Your staging should:
✓ Complement the quality of renovation
✓ Match the investment level
✓ Showcase the upgrades

**Key Upgrades to Highlight:**
| Room         | Upgrade                        | Value Add          |
|--------------|--------------------------------|--------------------|
| Kitchen      | Complete remodel + island      | $35,000            |
| Primary Bath | Spa-like renovation            | $12,000            |
| Flooring     | LVP throughout                 | $8,500             |
| Paint        | Fresh neutral palette          | $4,500             |
| Smart Home   | Full integration               | $3,000             |

**New/Updated Features:**
- All new kitchen appliances (stainless steel)
- New HVAC system ({year})
- New water heater ({year})
- Smart thermostat
- Smart doorbell
- Updated electrical panel
- New lighting fixtures throughout
- Fresh landscaping
```

### Section 5: Logistics & Timeline

```markdown
## Staging Logistics

**Timeline:**
- Staging Install: {install_date}
- Photography: {photo_date} (Morning light preferred)
- Listing Goes Live: {list_date}
- Expected Staging Duration: {duration_weeks} weeks

**Property Access:**
- Key/Code: {access_method}
- Access Hours: {hours}
- Parking: {parking_info}

**Utilities:**
All utilities will be on and functional
- Electric: ✓ On
- Water: ✓ On  
- HVAC: ✓ Running at {temp}°F
- WiFi: {if available}

**Property Condition:**
- Status: {vacant | occupied until date}
- Cleaning: {professionally cleaned before staging}
- Repairs: All complete
- Paint: Fresh throughout
- Flooring: New/cleaned

**Coordination:**
- Primary Contact: {name} - {phone}
- Real Estate Agent: {agent_name} - {phone}
- Photographer: {photographer_name} - {date}
- Videographer: {if applicable}

**Special Notes:**
{any_special_instructions}
```

### Section 6: Photography Coordination

```markdown
## Photography Preparation

**Photography Schedule:**
Date: {photo_date}
Time: {time} (Optimized for natural light)
Photographer: {name} - {phone}

**Pre-Photo Checklist:**
□ All staging complete 24 hours before
□ All lights on (every room, every fixture)
□ Curtains/blinds positioned for optimal light
□ All personal items removed
□ Beds made, pillows fluffed
□ Fresh flowers in place
□ Temperature comfortable
□ No visible cords or clutter

**Shot List Priority:**
[Provided to both stager and photographer]

**High Priority (Must-Have Shots):**
1. Kitchen - wide angle showing island
2. Living room - showing flow to kitchen
3. Primary bedroom - from doorway
4. Primary bathroom - showing vanity
5. Exterior front - curb appeal

**Medium Priority:**
6. Dining area
7. Guest bedrooms
8. Guest bathrooms  
9. Home office
10. Exterior back

**Detail Shots:**
11. Kitchen island waterfall edge
12. Primary bath tile detail
13. Fireplace styling
14. Hardware/fixture details

**Drone Shots:** {if applicable}
- Aerial front elevation
- Aerial showing lot size
- Neighborhood context
```

---

## PHOTOGRAPHER PACKET TEMPLATE {#photographer-packet}

### Purpose
Guide photographer to capture property's best features with understanding of design intent and key selling points.

### Cover Page
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [COMPANY LOGO]                         │
│                                                     │
│        PHOTOGRAPHY BRIEF                            │
│                                                     │
│  Property: {property_address}                       │
│  Shoot Date: {photo_date}                           │
│  Arrival Time: {time}                               │
│                                                     │
│  Prepared for: {photographer_name}                  │
│  Date: {generation_date}                            │
│                                                     │
│  Contact: {name} - {phone}                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Section 1: Quick Reference

```markdown
## Quick Reference Guide

**Shoot Details:**
- Date: {date}
- Arrival Time: {time}
- Expected Duration: {hours} hours
- Weather Contingency: {backup_plan}

**Deliverables:**
- Total Photos: {expected_count}
- Editing Style: {bright/natural/HDR/bracketed}
- Delivery Timeline: {timeline}
- Delivery Method: {method}

**Special Shots:**
□ {special_requirement_1}
□ {special_requirement_2}
□ Drone/aerial (if weather permits)
□ Twilight exterior (if package includes)

**Property Access:**
- Lockbox Code: {code} OR Key: {location}
- Parking: {instructions}
- Alarm: {if applicable}

---

## Priority Shot List

**MUST-HAVE (Hero Shots):**
1. ⭐ Kitchen - wide angle showing island
2. ⭐ Living room - showing flow
3. ⭐ Primary bedroom suite
4. ⭐ Exterior front - curb appeal
5. ⭐ Primary bathroom

**HIGH PRIORITY:**
6. Dining area
7. Kitchen detail - waterfall island
8. Guest bedrooms (2)
9. Guest bathrooms (2)
10. Exterior back/patio

**MEDIUM PRIORITY:**
11-20. [Additional rooms and detail shots]

**DETAIL SHOTS:**
- Hardware closeups
- Tile patterns
- Lighting fixtures
- Material textures
```

### Section 2: Property Overview

```markdown
## Property Information

**Address:** {full_address}
**Property Type:** {type}
**Square Footage:** {sqft} sq ft
**Bedrooms:** {beds} | **Bathrooms:** {baths}
**Year Built:** {year}

**Key Features:**
- {feature_1}
- {feature_2}
- {feature_3}

**Renovation Scope:**
${rehab_budget} complete renovation including:
- {renovation_highlight_1}
- {renovation_highlight_2}
- {renovation_highlight_3}

**Listing Price:** ${list_price}

**This property is:** {positioning_statement}

Example: "This property is a completely renovated modern farmhouse 
targeting first-time buyers. It's the nicest home in the price range 
and we need photos that show the quality and attention to detail."
```

### Section 3: Design Vision & Visual Direction

```markdown
## Design Aesthetic

**Style:** {design_style}
**Color Palette:** {color_summary}
**Overall Vibe:** {vibe_keywords}

**Design Moodboard:**
[Full-page moodboard reference]

**Visual Direction for Photography:**

This moodboard represents our design intent. Your photography should:

✓ Emphasize clean lines and bright, airy feel
✓ Show the cohesive design throughout
✓ Capture the quality of finishes
✓ Make spaces feel inviting, not sterile
✓ Highlight natural light

**Composition Notes:**
- {composition_guidance_1}
- {composition_guidance_2}
- {composition_guidance_3}

**Lighting Preferences:**
- {lighting_guidance}

Example:
```
Style: Modern Farmhouse
Color Palette: Whites, grays, warm wood tones, matte black accents
Overall Vibe: Fresh • Bright • Welcoming • Instagram-worthy

Visual Direction:
This moodboard shows our modern farmhouse aesthetic. Your photos should 
feel bright and airy (this is a selling point) while still feeling warm 
and inviting. We want potential buyers to say "I could live there."

Composition Notes:
- Wide angles to show space and flow
- Straight lines - keep verticals straight (no keystoning)
- Include greenery/plants where staged
- Capture the cohesive white + wood + black palette

Lighting Preferences:
- Natural light is key - we have great windows
- Turn on ALL lights for ambient glow
- Under-cabinet kitchen lights ON
- Balanced exposure - bright but not blown out
```

### Section 4: Room-by-Room Shot List

```markdown
## Detailed Shot List by Room

### KITCHEN (Hero Space - Priority #1)

**Why It's Important:**
The kitchen is our #1 selling feature. ${investment} renovation with 
custom cabinetry, quartz waterfall island, and high-end finishes. This 
will be the lead photo in the listing.

**Required Shots:**

1. **Wide Angle - Island View** ⭐ HERO SHOT
   - Position: From living room looking into kitchen
   - Shows: Full kitchen, island, flow to living space
   - Composition: Island in foreground, cabinets visible
   - Lighting: All lights on, maximize window light
   - Notes: This is THE photo - take multiple angles

2. **Wide Angle - Opposite View**
   - Position: From sink/window looking back
   - Shows: Island from other side, full depth of kitchen
   - Composition: Waterfall edge of island visible

3. **Island Detail - Waterfall Edge** ⭐
   - Position: Angled to show waterfall countertop
   - Shows: Quartz edge detail, clean line
   - Composition: Close enough to see quality, far enough for context
   - Notes: This is a key feature to emphasize

4. **Overhead/Elevated - Layout**
   - Position: Elevated angle showing full layout
   - Shows: Work triangle, space planning
   - Notes: If possible with equipment

5. **Backsplash Detail**
   - Position: Close on subway tile and grout lines
   - Shows: Quality of tile work, clean installation
   - Composition: Include part of counter for context

6. **Coffee Bar Section**
   - Position: Shows designated coffee/beverage station
   - Shows: Intentional design, functional layout
   - Notes: Capture the staging here

**Lighting Checklist:**
□ All overhead lights ON
□ Under-cabinet LED lights ON
□ Pendant lights over island ON (if installed)
□ Window blinds at optimal position
□ Refrigerator light OFF (avoid glow)

**Watch Out For:**
- Reflections in stainless appliances
- Cabinet alignment (all doors straight)
- Clutter on counters (should be minimal)
- Outlet covers visible (should match)

---

### LIVING ROOM

**Why It's Important:**
Shows the open floor plan and flow from kitchen. Target buyers want to 
see family gathering space and modern living.

**Required Shots:**

1. **Wide Angle - From Entry** ⭐
   - Position: From front entry/foyer
   - Shows: Full living room, connection to kitchen
   - Composition: Show flow of floor plan
   - Notes: This establishes the home's layout

2. **Wide Angle - From Kitchen**
   - Position: Kitchen side looking toward living
   - Shows: Reverse angle, shows cohesion
   - Composition: Include fireplace (if present)

3. **Fireplace Feature** (if applicable)
   - Position: Centered on fireplace wall
   - Shows: Fireplace as focal point, mantel styling
   - Composition: Include seating area context

4. **Detail - Flooring Transition**
   - Position: Shows quality of flooring
   - Shows: Clean installation, consistent finish
   - Notes: LVP was major investment

**Lighting Checklist:**
□ All lights and lamps ON
□ Fireplace ON (if gas/electric)
□ Natural light balanced
□ TV OFF (or showing art if smart TV)

---

### PRIMARY BEDROOM SUITE

**Why It's Important:**
Complete renovation of primary suite. Spa-like bathroom is major selling 
point. Suite should feel like a retreat.

**Bedroom Shots:**

1. **Wide Angle - From Door** ⭐
   - Position: From bedroom door/entrance
   - Shows: Full bedroom, bed as focal point, door to bath
   - Composition: Show flow to en-suite
   - Notes: Morning light is best here (east-facing)

2. **Alternate Angle**
   - Position: From bathroom looking toward bed
   - Shows: Reverse perspective
   - Notes: Only if space and composition work

3. **Walk-In Closet**
   - Position: From closet doorway
   - Shows: Closet organization system, space
   - Notes: Capture the upgrade

**Bathroom Shots:**

4. **Wide Angle - Vanity View** ⭐
   - Position: From doorway or opposite wall
   - Shows: Double vanity, tile work, full bathroom
   - Composition: Include shower glass if visible
   - Notes: Key selling feature

5. **Shower Detail** ⭐
   - Position: Capture tile work and fixtures
   - Shows: Custom shower, tile pattern, matte black fixtures
   - Composition: Show quality and design
   - Notes: ${12k} renovation - emphasize this

6. **Tile Detail**
   - Position: Close-up of tile work
   - Shows: Herringbone floor, subway walls, grout quality
   - Notes: Show craftsmanship

**Lighting Checklist:**
□ Bedroom: all lights and lamps ON
□ Bathroom: vanity lights ON
□ Shower lights ON
□ Exhaust fan OFF (avoid noise in video)
□ Medicine cabinet doors CLOSED

---

[Continue for all rooms: Guest Bedrooms, Guest Bathrooms, 
Dining Room, Office, Laundry, Basement, Outdoor Spaces]
```

### Section 5: Exterior Photography

```markdown
## Exterior Photography

### FRONT EXTERIOR (Curb Appeal) ⭐

**Why It's Important:**
First impression. This photo gets people to click on the listing.
${investment} in landscaping, new front door, and exterior updates.

**Required Shots:**

1. **Straight-On Hero Shot** ⭐
   - Position: From street, centered on home
   - Time: {optimal_time for front-facing direction}
   - Shows: Full house, landscaping, symmetry
   - Composition: Include approach walk/driveway
   - Notes: This is listing cover photo - make it count

2. **Angled Front**
   - Position: 45° angle from street
   - Shows: Dimension of home, side details
   - Composition: Show depth, not flat

3. **Entry Detail**
   - Position: Close on front door and porch
   - Shows: New door, hardware, welcome feel
   - Notes: {matte_black door} is design feature

4. **Landscaping Detail** (if investment made)
   - Position: Show plantings and beds
   - Shows: Quality of landscape work
   - Notes: Spring/summer timing ideal

**Lighting & Timing:**
Best time: {morning/afternoon based on facing direction}
- Front faces {direction}
- Sweet spot: {time_range}
- Avoid harsh shadows
- Consider returning for golden hour if time permits

**Drone Shots:** (If included)
□ Elevated front view showing property in context
□ Overhead showing lot size and layout
□ Neighborhood context (if attractive area)

**Watch Out For:**
- Cars in driveway (should be moved)
- Garage doors CLOSED
- Trash bins hidden
- Hose/toys/clutter removed
- Mailbox flag DOWN

---

### BACKYARD / OUTDOOR SPACES

**Required Shots:**

1. **Wide Angle - From House**
   - Position: From patio/deck looking out
   - Shows: Yard size, fencing, privacy
   - Composition: Include patio furniture if staged

2. **Wide Angle - Toward House**
   - Position: From back of lot looking at house
   - Shows: Rear elevation, outdoor living space
   - Notes: Show relationship to house

3. **Patio/Deck Detail** (if present)
   - Position: Show outdoor living area
   - Shows: Quality of space, how it's used
   - Notes: Staged with furniture if applicable

4. **Feature Details** (if applicable)
   - Fire pit
   - Pergola
   - Outdoor kitchen
   - Landscaping

**Best Timing:**
Similar to front - depends on sun position
Usually late afternoon works well for backyards
```

### Section 6: Technical Specs & Deliverables

```markdown
## Technical Requirements

**Image Specifications:**
- Format: High-res JPEG
- Resolution: {resolution_requirement}
- Color Space: sRGB
- Aspect Ratio: {preferred_ratio}

**Editing Style:**
- Tone: Bright and airy, natural color
- HDR: {yes/no or bracketed for manual blend}
- Perspective: Verticals straight (no keystoning)
- White Balance: Accurate to finishes (whites should be white)
- Contrast: Balanced - show detail in shadows
- Saturation: Natural - don't oversaturate

**Specific Editing Notes:**
- White cabinets should appear white, not cream/yellow
- Wood floors should show true warm tone
- Matte black fixtures: show true black (not gray)
- Avoid heavy vignetting
- Crop/straighten as needed

**Batch Processing:**
□ Color correction applied consistently
□ Exposure balanced throughout
□ Perspective corrections
□ Branded watermark: {if required}

---

## Deliverables

**Photo Packages:**

**Standard Package:** (Included)
- {count} high-res edited images
- All hero shots (marked with ⭐)
- All high-priority shots
- Selection of detail shots
- Delivery: {timeline}

**Enhanced Package:** (If purchased)
- {count} high-res edited images
- Virtual staging: {number} rooms
- Twilight exterior
- Drone photography
- Video walkthrough
- Delivery: {timeline}

**Delivery Method:**
- {Google Drive | Dropbox | Pixieset | Other}
- Organized by room
- Include RAW files: {yes/no}
- Usage rights: {specifications}

**File Naming:**
{address}_RoomName_01.jpg
Example: 12407_65thSt_Kitchen_01.jpg

**Folder Structure:**
```
/12407_65thSt_Photos/
  /Exterior/
  /Interior/
    /Kitchen/
    /LivingRoom/
    /PrimaryBedroom/
    /Bathrooms/
    /OtherRooms/
  /Details/
  /Drone/ (if applicable)
```

---

## Contact & Logistics

**On-Site Contact:**
{name} - {phone}
Available: {availability}

**Stager Contact:**
{stager_name} - {stager_phone}
(For any staging questions/adjustments)

**Real Estate Agent:**
{agent_name} - {agent_phone}
(Final approval on photo selection)

**Backup Plan:**
Weather-dependent exterior: {contingency_plan}

**Payment:**
{payment_terms}

**Questions?**
Contact {name} at {email} or {phone}
```

---

## REAL ESTATE AGENT PACKET TEMPLATE {#agent-packet}

### Purpose
Equip listing agent with comprehensive property info, marketing materials, competitive positioning, and AI-generated listing content.

### Cover Page
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [COMPANY LOGO]                         │
│                                                     │
│        LISTING AGENT PACKAGE                        │
│                                                     │
│  Property: {property_address}                       │
│  {City}, {State} {ZIP}                              │
│                                                     │
│  List Price: ${list_price}                          │
│  Price/SqFt: ${price_per_sqft}                      │
│                                                     │
│  Prepared for: {agent_name}                         │
│  Brokerage: {brokerage_name}                        │
│  Date: {generation_date}                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Section 1: Executive Summary

```markdown
## Property at a Glance

**Address:** {full_address}
**List Price:** ${list_price}
**Price Per SqFt:** ${price_per_sqft}

**Property Specs:**
- Square Footage: {sqft} sq ft
- Bedrooms: {beds}
- Bathrooms: {baths}
- Year Built: {year}
- Lot Size: {lot_size}
- Property Type: {type}

**Recommended List Date:** {suggested_list_date}
**Recommended Strategy:** {pricing_strategy}

---

## Investment Summary

**Total Investment:** ${total_investment}
- Purchase Price: ${purchase_price}
- Renovation Cost: ${rehab_cost}
- Holding Costs: ${holding_costs}
- Selling Costs (Est.): ${selling_costs}

**Target Sale:** ${target_sale_price}
**Projected Profit:** ${projected_profit}
**ROI:** {roi_percentage}%

**Time on Market Goal:** {dom_goal} days
**Confidence Level:** {confidence_explanation}

---

## Renovation Highlights

**Investment:** ${total_rehab}
**Completed:** {completion_date}

**Major Upgrades:**
| Category         | Investment | Value Add     | ROI    |
|------------------|-----------|---------------|--------|
| Kitchen          | $35,000   | $28,000       | 80%    |
| Primary Bath     | $12,000   | $10,000       | 83%    |
| Flooring         | $8,500    | $7,200        | 85%    |
| Paint            | $4,500    | $5,000        | 111%   |
| Smart Home       | $3,000    | $4,500        | 150%   |
| Landscaping      | $3,500    | $4,000        | 114%   |
| **TOTAL**        | **$66,500**| **$58,700**  | **88%**|

**Property Condition:** Move-in ready, completely renovated
**Comparable Quality:** Top 5% in price range
```

### Section 2: AI-Generated Listing Content

```markdown
## Ready-to-Use Listing Description

### HEADLINE OPTIONS (Pick One)

**Option 1 (Emotional):**
"{headline_emotional}"

**Option 2 (Feature-Focused):**  
"{headline_features}"

**Option 3 (Value-Focused):**
"{headline_value}"

Example:
```
Option 1: "Your Dream Home Awaits - Completely Renovated Modern Farmhouse!"

Option 2: "Stunning Kitchen, Spa Bath & Smart Home - Move-In Ready Perfection"

Option 3: "The Best Value in Otsego - $65K Renovation for Under $400K"
```

---

### FULL LISTING DESCRIPTION

**Primary Description (Use This):**

```
{ai_generated_description}
```

**Example:**
```
Welcome to 12407 65th Street NE - where modern design meets timeless appeal! 

This completely renovated 3-bedroom, 2-bathroom home has been thoughtfully 
reimagined with today's buyer in mind. Every detail has been carefully 
considered, from the stunning white kitchen with waterfall island to the 
spa-like primary suite.

KITCHEN & LIVING (The Heart of This Home)
The show-stopping kitchen features custom white cabinetry, quartz countertops 
with a dramatic waterfall edge island, subway tile backsplash, and brand-new 
stainless steel appliances. Matte black hardware and fixtures add the perfect 
modern touch. The open floor plan flows seamlessly into the spacious living 
room, creating an ideal space for entertaining or everyday family life.

PRIMARY SUITE (Your Personal Retreat)
Escape to your private oasis in the primary bedroom suite. The spa-inspired 
bathroom renovation includes a custom tiled shower, double vanity, and 
premium fixtures in matte black. The walk-in closet offers ample storage with 
a professional organization system.

MODERN THROUGHOUT
Fresh paint in a sophisticated neutral palette creates a cohesive feel 
throughout. New luxury vinyl plank flooring offers both beauty and durability. 
Updated lighting, new windows, and thoughtful design touches make this home 
feel brand new.

SMART HOME READY
Enjoy modern convenience with smart home integration including thermostat, 
doorbell, and more. New HVAC and water heater provide peace of mind.

OUTDOOR OASIS
Fresh landscaping enhances the home's curb appeal, while the spacious backyard 
offers room for summer barbecues, gardening, or play.

This isn't just another house - it's a completely renovated home where you 
can simply move in and start living. Don't miss this rare opportunity!
```

---

### FEATURE BULLETS (MLS Quick Points)

Use these for MLS feature highlights:

□ Complete ${rehab_cost} renovation - move-in ready
□ Stunning white kitchen with waterfall quartz island
□ Brand new stainless steel appliances
□ Spa-like primary bathroom with custom tile shower
□ New luxury vinyl plank flooring throughout
□ Fresh paint - sophisticated neutral palette
□ Smart home integration (thermostat, doorbell, lights)
□ New HVAC system ({year})
□ New water heater ({year})
□ Professional landscaping with curb appeal
□ Walk-in primary closet with organization system
□ Open floor plan perfect for entertaining
□ Quiet neighborhood, great schools
□ {additional_features}

---

### SOCIAL MEDIA CAPTIONS

**Instagram Caption:**
```
{instagram_caption}
```

Example:
```
✨ JUST LISTED ✨

Your search for the perfect home ends here! This completely renovated 
modern farmhouse in Otsego checks every box:

🏡 3 bed | 2 bath | {sqft} sqft
🔪 Stunning kitchen with waterfall island
🛁 Spa-like primary suite
💡 Smart home throughout
🎨 Fresh, neutral, Instagram-worthy design

This isn't a flip - it's a TRANSFORMATION. ${rehab_cost} in thoughtful 
renovations means you just move in and live.

📍 {address}
💰 ${list_price}
🔗 Link in bio for more photos!

#{city}RealEstate #ModernFarmhouse #JustListed #DreamHome #MoveInReady
#HomeRenovation #FlipOrFlop #{state}Homes #HouseGoals #RealEstateGoals
```

**Facebook Post:**
```
{facebook_post}
```

**Shorter Version (For Stories/Quick Posts):**
```
{short_social_caption}
```

---

### SEO KEYWORDS

Use these in online listings for better search visibility:

**Primary Keywords:**
- {city} real estate
- Renovated homes {city}
- Modern farmhouse {city}
- Move-in ready {city}
- Updated kitchen {city}

**Secondary Keywords:**
- {beds} bedroom homes {city}
- Homes under ${price_rounded}
- {neighborhood} homes for sale
- Smart home {city}
- First time buyer homes {city}

**Long-Tail Keywords:**
- Completely renovated homes {city} {state}
- Modern white kitchen homes for sale
- {city} homes with spa bathroom
- Turnkey properties {city}

**Use in:**
- Online listing descriptions
- Blog posts about the property
- Social media posts
- Website property page
```

### Section 3: Competitive Analysis

```markdown
## Market Positioning

### COMPETITIVE LANDSCAPE

**Our Position:**
This property is positioned as the best value in its price range due to the 
extent of renovation and quality of finishes.

**Price Range:** ${price_range_low} - ${price_range_high}
**Our Price:** ${list_price}
**Market Position:** {aggressive | competitive | premium}

---

### DIRECT COMPETITORS (Currently Active)

**Competitor #1:**
- Address: {comp_address}
- Price: ${comp_price} (${price_diff})
- SqFt: {comp_sqft} (${sqft_price})
- Beds/Baths: {comp_beds}/{comp_baths}
- DOM: {days_on_market} days
- **OUR ADVANTAGE:**
  - {advantage_1}
  - {advantage_2}
  - {advantage_3}

**Competitor #2:**
- Address: {comp_address}
- Price: ${comp_price} (${price_diff})
- SqFt: {comp_sqft} (${sqft_price})
- Beds/Baths: {comp_beds}/{comp_baths}
- DOM: {days_on_market} days
- **OUR ADVANTAGE:**
  - {advantage_1}
  - {advantage_2}

**Competitor #3:**
[Similar format]

---

### RECENT SOLD COMPARABLES

**Most Relevant Comp:**
- Address: {sold_comp_address}
- Sold Price: ${sold_price}
- Sold Date: {sold_date}
- DOM: {days_on_market} days
- Price/SqFt: ${sold_price_sqft}
- **Comparison:**
  - Our finishes: {better | similar | less updated}
  - Our price: {higher | lower} by ${difference}
  - Justification: {why_our_pricing_makes_sense}

**Additional Comps:**
| Address        | Sold Price  | DOM | $/SqFt | Notes              |
|----------------|-------------|-----|--------|--------------------|
| {address}      | ${price}    | 14  | ${psf} | Original kitchen   |
| {address}      | ${price}    | 8   | ${psf} | Similar updates    |
| {address}      | ${price}    | 22  | ${psf} | Smaller, busy street |

**CMA Summary:**
Based on recent sales, ${list_price} is {supported | aggressive | premium} 
for this market. Expected DOM: {expected_days} days.

---

### MARKET TRENDS

**Current Market Conditions ({City}/{Neighborhood}):**
- Inventory Level: {low | balanced | high}
- Average DOM: {average_days} days
- List-to-Sale Ratio: {ratio}%
- Buyer Demand: {strong | moderate | soft}

**Seasonal Factors:**
{seasonal_considerations}

**Recommendation:**
{strategic_recommendation}
```

### Section 4: Marketing Strategy

```markdown
## Recommended Marketing Approach

### PRICING STRATEGY

**Recommended List Price:** ${recommended_price}

**Strategy:** {strategy_name}

**Rationale:**
{pricing_rationale_paragraph}

Example:
```
Strategy: Competitive Entry Pricing

Rationale:
List at $389,900 (vs. $399,900 alternatives) to generate strong initial 
interest and potentially multiple offers. The $65K renovation speaks for 
itself - buyers will see the value immediately. Price just under $390K to 
capture search filters and appear as "best deal" compared to similar homes 
at $400K+. Expect offers within first weekend if marketed properly.
```

**Alternative Pricing Scenarios:**

| List Price | Strategy               | Expected Result                    |
|-----------|------------------------|-----------------------------------|
| ${price_1}| Aggressive            | Multiple offers, quick sale        |
| ${price_2}| Market Rate           | Steady interest, sale in {days}    |
| ${price_3}| Premium               | Patient buyer, longer DOM          |

**Our Recommendation:** {recommended_strategy_with_reason}

---

### MARKETING TIMELINE

**Pre-Listing (Week Before):**
- □ Professional photos: {photo_date}
- □ Staging complete: {staging_complete_date}
- □ MLS data entry: {data_entry_date}
- □ Social media teaser posts: {teaser_date_range}
- □ "Coming Soon" signage: {sign_date}
- □ Agent preview/broker open: {preview_date}

**Launch Week:**
- □ MLS goes live: {list_date} at {time}
- □ Syndication to Zillow, Realtor.com, etc.: Immediate
- □ Email blast to buyer agents: {list_date}
- □ Social media launch posts: {list_date}
- □ First open house: {open_house_date}
- □ Showings begin: Immediately

**Ongoing:**
- □ Weekly open houses: {day/time}
- □ Social media ads: Targeted to {buyer_demographic}
- □ Email follow-ups to showing agents
- □ Market feedback collection
- □ Price adjustment evaluation: Week {week_number} if needed

---

### SHOWING STRATEGY

**Showing Instructions:**
- ShowingTime enabled: {yes/no}
- Notice Required: {notice_period}
- Lockbox Code: {code}
- Lights/Staging: {instructions}

**Open House Recommendations:**
- First Open House: {suggested_date/time}
- Frequency: {frequency_recommendation}
- Duration: {duration}
- Special Events: {if_any}

**Target Open House Attendance:**
Based on market, expect {expected_attendance} groups first weekend.

---

### MARKETING CHANNELS

**Online Presence:**
□ MLS (syndicates to major portals)
□ Realtor.com
□ Zillow
□ Trulia
□ Homes.com
□ Facebook Marketplace
□ {brokerage_website}
□ {agent_personal_website}

**Social Media Campaign:**
□ Facebook ads (targeted to {demographics})
□ Instagram posts and stories
□ Instagram ads (if budget allows)
□ Pinterest property pin
□ Nextdoor neighborhood posts
□ Local Facebook groups

**Traditional Marketing:**
□ Yard sign with rider
□ Directional signs (if permitted)
□ Feature sheets/brochures
□ Just Listed postcards to neighborhood
□ Email to agent database
□ {other_traditional_methods}

**Recommended Marketing Budget:**
${marketing_budget_recommendation}
- Photography: ${photo_budget} (covered)
- Social media ads: ${social_budget}
- Print materials: ${print_budget}
- Signage: ${sign_budget}
```

### Section 5: Visual Assets Library

```markdown
## Marketing Materials Provided

### PHOTOGRAPHY

**Professional Photos:** {photo_count} high-res images
- Delivered: {delivery_date}
- Location: {Google_Drive_link or delivery_method}
- Usage: Full rights for marketing this property

**Photo Organization:**
```
/Photos/
  /Hero_Shots/ (Top 5-10 for primary marketing)
  /Exterior/
  /Interior_Rooms/
  /Kitchen/ (Multiple angles)
  /Bathrooms/
  /Details/
```

**Recommended Lead Photo:**
{description_of_best_hero_shot}
File: {filename}

**Recommended MLS Photo Order:**
1. {photo_1_description} - {filename}
2. {photo_2_description} - {filename}
3. {photo_3_description} - {filename}
[Continue for 20-30 photos]

---

### DESIGN MOODBOARD

**Moodboard Assets:**
- Design moodboard (PDF): {link}
- Social media formats (Instagram, Facebook): {link}
- Use for: Showing design vision, social posts, feature sheets

**Suggested Uses:**
- Include in feature sheets to show design intent
- Share on social media with captions about design
- Show to buyers who ask about finishes/materials

---

### FLOOR PLANS

**Floor Plan:** {if_available}
- Main Level: {link}
- Upper Level: {link}
- Basement: {link}

---

### VIDEO ASSETS

**Video Walkthrough:** {if_available}
- Duration: {minutes}:{seconds}
- Link: {video_link}
- Suggested Use: Website feature, social media, email

**Drone Footage:** {if_available}
- Aerial views: {link}
- Suggested Use: Website, Instagram, YouTube

---

### READY-TO-USE GRAPHICS

**Social Media Graphics:**
- "Just Listed" graphic (Instagram): {link}
- "Just Listed" graphic (Facebook): {link}
- "Open House" template: {link}
- "Price Reduction" template (if needed): {link}

**Print Materials:**
- Feature sheet template (editable): {link}
- Postcard template: {link}
- Brochure template: {link}

---

### RENOVATION DOCUMENTATION

**Before & After Photos:**
- Before/After Comparison PDF: {link}
- Individual rooms before/after: {folder_link}

**Use Cases:**
- Show value of renovation to skeptical buyers
- Social media "transformation" posts
- Feature sheets highlighting investment
- Email marketing showcasing the work

**Renovation Investment Breakdown:**
{investment_by_category_visual}
```

### Section 6: Buyer Talking Points

```markdown
## Key Talking Points for Showings

### OPENING STATEMENT (Curb Appeal)

As you approach:
"Welcome to 12407 65th Street! I'm excited to show you this completely 
renovated home. Everything you're about to see is brand new - from the 
kitchen to the bathrooms to the flooring. This is truly move-in ready."

---

### KITCHEN (Hero Feature)

Key Points:
✓ "This kitchen was a complete $35,000 renovation"
✓ "Notice the waterfall edge on the quartz island - very on-trend"
✓ "All new stainless appliances - even the microwave is new"
✓ "The matte black hardware and fixtures are everywhere - very cohesive"
✓ "Subway tile is classic - won't go out of style"
✓ "Soft-close cabinetry throughout"

Answer Common Questions:
- "When was this done?" → {completion_date}, so everything is brand new
- "Is the island staying?" → Yes, it's permanently installed
- "What's the countertop material?" → Quartz - low maintenance, doesn't need sealing

---

### PRIMARY SUITE

Key Points:
✓ "The primary bathroom was a $12,000 renovation"
✓ "Look at this tile work - herringbone floor, subway walls"
✓ "The shower is completely custom with a built-in bench"
✓ "Matte black fixtures match the kitchen aesthetic"
✓ "Walk-in closet has a professional organization system"

Answer Common Questions:
- "Is this a tub or shower?" → It's a walk-in shower (very popular with today's buyers)
- "Can we add a tub?" → There's room to convert if desired, but walk-in showers are trending

---

### SMART HOME FEATURES

Key Points:
✓ "The home has smart integration throughout"
✓ "Smart thermostat you can control from your phone"
✓ "Video doorbell included"
✓ "Smart lighting in key areas"
✓ "Total investment of $3,000 in smart features"

Answer Common Questions:
- "What system?" → {system_name} - works with Alexa/Google/Apple
- "Do we have to use it?" → No, but it adds value and buyers love it

---

### SYSTEMS & MECHANICALS

Key Points:
✓ "New HVAC system installed in {year}"
✓ "New water heater in {year}"
✓ "Updated electrical panel"
✓ "New windows throughout" (if applicable)
✓ "Everything has warranties"

Answer Common Questions:
- "What's the age of systems?" → All new or recently replaced
- "Are there warranties?" → Yes, manufacturer warranties on all new systems

---

### FLOORING

Key Points:
✓ "Luxury vinyl plank throughout - $8,500 investment"
✓ "Waterproof - great for families with kids or pets"
✓ "Warm wood tone coordinates with the design"
✓ "Same flooring throughout creates cohesive flow"

Answer Common Questions:
- "Is this real wood?" → It's luxury vinyl plank - looks like wood, more durable
- "Will it scratch?" → Very scratch-resistant and waterproof

---

### OVERALL VALUE PROPOSITION

Final Talking Points:
✓ "Total renovation investment of ${total_rehab}"
✓ "Everything is new - nothing needs to be done"
✓ "This is the best value in the price range"
✓ "Compare this to homes at $400K+ with original kitchens"
✓ "You could move in tomorrow with just your furniture"

Answer Objections:
- "Is this a flip?" → 
  "Yes, and that's great for you - all the work is done professionally and 
  permitted. You get a renovated home without the hassle and expense."

- "I'm worried about the quality" →
  "I understand. All work was done by licensed contractors with permits. 
  The quality speaks for itself - compare the finishes to anything in this 
  price range."

- "Can we see what it looked like before?" →
  "Absolutely - I have before photos. The transformation is incredible."
```

### Section 7: Offer Handling

```markdown
## Offer Review & Negotiation Guidelines

### SELLER EXPECTATIONS

**Minimum Acceptable Offer:**
${minimum_acceptable_price}

**Ideal Sale Scenario:**
- Price: ${ideal_price}
- Closing Timeline: {ideal_timeline}
- Contingencies: {acceptable_contingencies}
- Occupancy: {preferred_occupancy}

**Seller Motivation:**
{motivation_level} - Timeline: {timeline_flexibility}

---

### OFFER EVALUATION CRITERIA

**Rank Offers By:**
1. **Net Proceeds** (price after all costs)
2. **Closing Timeline** (prefer {timeframe})
3. **Financing Strength** (pre-approval quality)
4. **Contingencies** (fewer is better)
5. **Occupancy** (flexibility)

**Red Flags to Watch:**
- Unproven lenders or unclear financing
- Excessive contingencies or long timelines
- Unrealistic inspection demands
- Requests for seller concessions beyond reason

---

### MULTIPLE OFFER STRATEGY

**If Multiple Offers:**
- Disclose presence of multiple offers (per law)
- Set deadline for highest and best: {deadline}
- Communicate strengths of current offers (without specifics)
- Recommend: {strategy}

**Highest & Best Guidelines:**
Provide to agents:
- Strongest offer currently: ${current_high} (don't disclose buyer)
- Closing timeline preferred: {timeline}
- Occupancy preference: {occupancy}
- Seller will decide by: {decision_date/time}

---

### NEGOTIATION PARAMETERS

**Price:**
- List: ${list_price}
- Will consider: ${minimum_price} or better
- Preferred: ${preferred_price}

**Closing Costs:**
- Seller contribution: ${max_contribution} or {percentage}% max
- Negotiable based on price

**Contingencies:**
- Inspection: Expected - {timeline} for inspection period
- Appraisal: Expected - will not renegotiate unless {scenario}
- Financing: Pre-approval required - {timeline} for final approval
- Sale of buyer home: Prefer no contingency or kick-out clause

**Closing Timeline:**
- Earliest acceptable: {earliest_date}
- Preferred: {preferred_date}
- Latest acceptable: {latest_date}

**Occupancy:**
- Prefer: Vacant at closing
- Negotiable: {flexibility_description}

---

### COUNTER OFFER SCENARIOS

**Scenario 1: Good offer, slightly below asking**
Offer: ${scenario_price} ({percentage}% below ask)
**Recommendation:** Counter at ${counter_price}, split the difference

**Scenario 2: Weak price, strong terms**
Offer: ${scenario_price}, but cash, quick close, no contingencies
**Recommendation:** {recommendation}

**Scenario 3: Multiple offers, both strong**
**Recommendation:** Send highest & best notice, set deadline

**Scenario 4: One offer, at or above asking**
**Recommendation:** Accept with minor adjustments if needed
```

### Section 8: Contact Directory

```markdown
## Project Team Contacts

**Seller/Investor:**
{name}
Phone: {phone}
Email: {email}
Preferred Contact: {method}
Response Time: {expected_response}

**Photographer:**
{name} - {company}
Phone: {phone}
Email: {email}
Completed: {photo_date}

**Stager:**
{name} - {company}
Phone: {phone}
Email: {email}
Install Date: {staging_date}
Removal: {removal_plan}

**General Contractor:**
{name} - {company}
Phone: {phone}
Email: {email}
(For any questions about renovation work)

**Inspector** (if pre-inspection done):
{name} - {company}
Phone: {phone}
Report: {report_link}

**Title Company** (if selected):
{company}
Contact: {name}
Phone: {phone}

---

## Questions?

Contact {seller_name} with any questions:
- Phone: {phone}
- Email: {email}
- Preferred Method: {method}

Response time: {typical_response_time}
```

---

## SHARED COMPONENTS {#shared-components}

### Header Template (All Packets)

```typescript
interface PacketHeader {
  companyLogo: string; // URL to logo
  packetType: 'contractor' | 'stager' | 'photographer' | 'agent';
  propertyAddress: string;
  projectName?: string;
  recipientName: string;
  recipientCompany?: string;
  generationDate: string;
  senderContact: {
    name: string;
    email: string;
    phone: string;
  };
}
```

### Footer Template (All Packets)

```
═══════════════════════════════════════════════════════════════
Questions? Contact {name} at {phone} or {email}
Generated by Rehab Estimator Pro • {generation_date}
Confidential & Proprietary
═══════════════════════════════════════════════════════════════
Page {page_number} of {total_pages}
```

### Color Swatch Display

```typescript
interface ColorSwatchDisplay {
  colors: Array<{
    name: string;
    code: string; // 'SW 7005'
    hex: string;
    size: 'large' | 'medium' | 'small';
    showName: boolean;
    showCode: boolean;
    showHex: boolean;
  }>;
  layout: 'horizontal' | 'vertical' | 'grid';
}
```

**Rendering:**
```
┌─────────────────────────────────────────┐
│  PRIMARY COLORS                         │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │          │  │          │           │
│  │ #F2F0EB  │  │ #8C8B84  │           │
│  │          │  │          │           │
│  └──────────┘  └──────────┘           │
│  Pure White     Repose Gray            │
│  SW 7005        SW 7015                │
│                                         │
│  ACCENT COLORS                          │
│  ┌────┐ ┌────┐ ┌────┐                 │
│  │▓▓▓▓│ │░░░░│ │████│                 │
│  └────┘ └────┘ └────┘                 │
│  Black  Brass   Wood                   │
└─────────────────────────────────────────┘
```

### Before/After Image Layout

```html
<!-- Two-column layout -->
<div class="before-after-container">
  <div class="before">
    <img src="{before_image_url}" />
    <caption>BEFORE</caption>
  </div>
  <div class="after">
    <img src="{after_image_url}" />
    <caption>AFTER</caption>
  </div>
</div>
```

---

## PDF GENERATION SPECS {#pdf-generation}

### Technical Requirements

```typescript
interface PDFGenerationConfig {
  // Document Setup
  pageSize: 'letter' | 'A4';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;    // in inches or mm
    bottom: number;
    left: number;
    right: number;
  };
  
  // Typography
  fonts: {
    heading: string;      // 'Inter Bold' or similar
    subheading: string;   // 'Inter Semibold'
    body: string;         // 'Inter Regular'
    mono: string;         // 'JetBrains Mono' for code/specs
  };
  fontSizes: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
  
  // Colors (Brand)
  colors: {
    primary: string;      // Main brand color
    secondary: string;    // Accent
    text: string;         // Body text
    textLight: string;    // Captions, secondary info
    background: string;   // Page background
    borders: string;      // Table borders, dividers
  };
  
  // Layout
  enablePageNumbers: boolean;
  enableHeaders: boolean;
  enableFooters: boolean;
  enableTableOfContents: boolean;
  enableBookmarks: boolean; // PDF bookmarks for navigation
  
  // Image Handling
  imageQuality: 'low' | 'medium' | 'high' | 'print';
  maxImageWidth: number;  // Max width in pixels
  compressImages: boolean;
  
  // Output
  outputFormat: 'pdf';
  pdfVersion: '1.4' | '1.5' | '1.6' | '1.7';
  allowPrinting: boolean;
  allowCopying: boolean;
  passwordProtected: boolean;
  password?: string;
}
```

### Recommended Settings by Packet Type

**Contractor Packet:**
```typescript
{
  pageSize: 'letter',
  orientation: 'portrait',
  margins: { top: 0.75, bottom: 0.75, left: 1, right: 1 },
  imageQuality: 'medium',
  enableBookmarks: true,  // Easy navigation
  passwordProtected: false // Easy sharing
}
```

**Stager Packet:**
```typescript
{
  pageSize: 'letter',
  orientation: 'portrait',
  margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 },
  imageQuality: 'high',  // Visual quality matters
  enableBookmarks: true,
  passwordProtected: false
}
```

**Photographer Packet:**
```typescript
{
  pageSize: 'letter',
  orientation: 'landscape',  // Better for shot lists
  margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 },
  imageQuality: 'high',
  enableBookmarks: true,
  passwordProtected: false
}
```

**Agent Packet:**
```typescript
{
  pageSize: 'letter',
  orientation: 'portrait',
  margins: { top: 0.75, bottom: 0.75, left: 1, right: 1 },
  imageQuality: 'high',
  enableBookmarks: true,
  passwordProtected: true,  // Often contains financials
  password: user_generated
}
```

### PDF Library Recommendations

**Next.js / React:**
```bash
npm install @react-pdf/renderer
# or
npm install jsPDF
# or  
npm install puppeteer  # For HTML-to-PDF
```

**Example with @react-pdf/renderer:**
```typescript
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  section: { margin: 10, padding: 10 },
  // ... more styles
});

const ContractorPDF = ({ data }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        <Text>Contractor Work Packet</Text>
      </View>
      {/* ... rest of document */}
    </Page>
  </Document>
);
```

---

## EMAIL TEMPLATES {#email-templates}

### Contractor Packet Email

**Subject:** Work Packet for {Property Address} - {Trade Name}

**Body:**
```
Hi {contractor_name},

Thank you for your interest in our project at {property_address}!

I've attached your customized work packet which includes:

✓ Project overview and timeline
✓ Design vision and material specifications  
✓ Detailed scope of work for your trade
✓ Site access information
✓ Project standards and expectations

PROPERTY DETAILS:
• Address: {property_address}
• Project Type: {project_type}
• Your Scope: {trade_description}
• Target Start: {estimated_start_date}
• Budget: ${trade_budget_if_sharing}

NEXT STEPS:
1. Review the attached packet carefully
2. Visit the property if needed (contact me to schedule)
3. Submit your bid by {bid_deadline}
4. Questions? Reply to this email or call {phone}

ACCESS FOR SITE VISIT:
{access_instructions}

Looking forward to working with you!

{sender_name}
{phone}
{email}

---
ATTACHMENT: {filename}.pdf ({file_size}MB)
```

### Stager Packet Email

**Subject:** Staging Brief for {Property Address} - Photo Date {Date}

**Body:**
```
Hi {stager_name},

Excited to work with you on staging {property_address}!

Attached is your complete staging brief with:

✓ Target buyer profile and design aesthetic
✓ Room-by-room priorities and budgets
✓ Full design moodboard for reference
✓ Before/after photos of renovation
✓ Photography schedule and shot list

QUICK DETAILS:
• Address: {property_address}
• Install Date: {install_date}
• Photography: {photo_date} at {time}
• Style: {design_style}
• Budget: ${staging_budget}

KEY PRIORITIES:
1. {priority_1}
2. {priority_2}
3. {priority_3}

TIMELINE:
• {timeline_item_1}
• {timeline_item_2}
• {timeline_item_3}

Let's schedule a walkthrough! When works for you this week?

{sender_name}
{phone}
{email}

---
ATTACHMENT: {filename}.pdf ({file_size}MB)
MOODBOARD: {moodboard_link}
```

### Photographer Packet Email

**Subject:** Photo Shoot Brief - {Property Address} on {Date}

**Body:**
```
Hi {photographer_name},

Looking forward to the shoot at {property_address} on {shoot_date}!

Your photography brief is attached with:

✓ Complete shot list (prioritized)
✓ Design vision and key features to capture
✓ Technical requirements and deliverables
✓ Property access and logistics

SHOOT DETAILS:
• Date: {shoot_date}
• Arrival: {arrival_time}
• Address: {property_address}
• Lockbox Code: {code} OR Key: {key_location}
• Expected Duration: {duration} hours

MUST-HAVE SHOTS:
⭐ Kitchen with island (HERO SHOT)
⭐ Living room showing flow
⭐ Primary bedroom suite
⭐ Front exterior (curb appeal)
⭐ Primary bathroom

DELIVERABLES:
• {photo_count} edited high-res images
• Delivery: {delivery_timeline}
• Method: {delivery_method}
• Editing style: {editing_preference}

WEATHER NOTE:
{weather_contingency_if_applicable}

Questions before the shoot? Call or text anytime.

{sender_name}
{phone}
{email}

---
ATTACHMENT: {filename}.pdf ({file_size}MB)
```

### Agent Packet Email

**Subject:** Listing Package - {Property Address} Ready to List!

**Body:**
```
Hi {agent_name},

{Property_address} is ready to hit the market! 🎉

I've prepared a comprehensive listing package with everything you need:

✓ AI-generated listing descriptions (ready to copy/paste)
✓ Property details and investment summary
✓ Competitive analysis and pricing recommendation
✓ Professional photos and visual assets
✓ Marketing strategy and timeline
✓ Buyer talking points and objection handlers

RECOMMENDED APPROACH:
• List Price: ${recommended_price}
• List Date: {recommended_date}
• Strategy: {strategy_summary}
• Expected DOM: {expected_days} days

THIS PROPERTY STANDS OUT:
• ${total_rehab} complete renovation
• Move-in ready, nothing to do
• Best value in ${price_range} range
• {key_selling_point}

MARKETING ASSETS READY:
• {photo_count} professional photos
• AI listing descriptions (3 versions)
• Design moodboard
• Before/after documentation
• Social media graphics

NEXT STEPS:
1. Review attached packet
2. Confirm list price and date
3. Schedule MLS entry
4. Launch marketing campaign

Let's get this listed! Available to chat anytime.

{sender_name}
{phone}
{email}

---
ATTACHMENTS:
• Listing_Package_{address}.pdf ({file_size}MB)
• Photos.zip ({file_size}MB)
• Marketing_Graphics.zip ({file_size}MB)
```

---

## GENERATION WORKFLOW

### Step-by-Step Process

```typescript
async function generateVendorPacket(
  projectId: string,
  packetType: 'contractor' | 'stager' | 'photographer' | 'agent',
  config: PacketGenerationConfig
): Promise<GeneratedPacket> {
  
  // 1. Gather all required data
  const data = await gatherPacketData(projectId, packetType, config);
  
  // 2. Apply content filtering
  const filteredData = applyFilters(data, config.filters);
  
  // 3. Generate packet sections
  const sections = await generateSections(filteredData, packetType);
  
  // 4. Render to HTML
  const html = renderToHTML(sections, config.template);
  
  // 5. Convert to PDF
  const pdf = await convertToPDF(html, config.pdfSettings);
  
  // 6. Upload to storage
  const pdfUrl = await uploadToStorage(pdf, `packets/${projectId}`);
  
  // 7. Create database record
  const packetRecord = await createPacketRecord({
    projectId,
    packetType,
    pdfUrl,
    recipientInfo: config.recipient,
    includedSections: config.sections,
    generatedAt: new Date()
  });
  
  // 8. Send email (if requested)
  if (config.sendEmail) {
    await sendPacketEmail(packetRecord, config.recipient);
  }
  
  return {
    packetId: packetRecord.id,
    pdfUrl,
    shareUrl: generateShareUrl(packetRecord.id),
    shortCode: packetRecord.shortCode
  };
}
```

---

## END OF VENDOR PACKET TEMPLATES

Total Template Count: 4 (Contractor, Stager, Photographer, Agent)
Total Sections: 35+ customizable content blocks
Estimated Implementation: 3-4 weeks for complete system
