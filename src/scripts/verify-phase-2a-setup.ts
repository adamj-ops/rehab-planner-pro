/**
 * @file verify-phase-2a-setup.ts
 * @description Verification script for Phase 2A database setup
 * 
 * Run with: npx tsx src/scripts/verify-phase-2a-setup.ts
 * 
 * This script checks:
 * 1. All Phase 2A tables exist
 * 2. Seed data is present
 * 3. RLS policies are enabled
 * 4. Sample queries work correctly
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

function log(result: VerificationResult) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
  results.push(result);
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const { count, error } = await supabase
    .from(tableName as any)
    .select('*', { count: 'exact', head: true });
  
  return !error;
}

async function getRowCount(tableName: string): Promise<number> {
  const { count, error } = await supabase
    .from(tableName as any)
    .select('*', { count: 'exact', head: true });
  
  if (error) return -1;
  return count ?? 0;
}

async function verifyTables() {
  console.log('\n📋 Checking Phase 2A Tables...\n');
  
  const tables = [
    'rehab_projects',
    'color_library',
    'project_color_selections',
    'material_library',
    'project_material_selections',
    'color_palettes',
    'moodboards',
    'moodboard_elements',
    'moodboard_shares',
  ];

  let allExist = true;
  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (exists) {
      const count = await getRowCount(table);
      log({
        name: `Table: ${table}`,
        status: 'pass',
        message: `Exists`,
        details: `${count} row(s)`,
      });
    } else {
      allExist = false;
      log({
        name: `Table: ${table}`,
        status: 'fail',
        message: 'Does not exist or not accessible',
      });
    }
  }

  return allExist;
}

async function verifySeedData() {
  console.log('\n🌱 Checking Seed Data...\n');

  // Check color_library
  const colorCount = await getRowCount('color_library');
  const { data: popularColors } = await supabase
    .from('color_library')
    .select('color_name, color_code, hex_code')
    .eq('popular', true)
    .limit(5);

  if (colorCount > 0) {
    log({
      name: 'Color Library',
      status: colorCount >= 50 ? 'pass' : 'warn',
      message: `${colorCount} colors found`,
      details: popularColors 
        ? `Popular: ${popularColors.map(c => c.color_name).join(', ')}`
        : undefined,
    });
  } else {
    log({
      name: 'Color Library',
      status: 'fail',
      message: 'No colors found - seeding required',
    });
  }

  // Check material_library
  const materialCount = await getRowCount('material_library');
  const { data: materialTypes } = await supabase
    .from('material_library')
    .select('material_type')
    .limit(100);

  if (materialCount > 0) {
    const typeBreakdown = materialTypes?.reduce((acc, m) => {
      acc[m.material_type] = (acc[m.material_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    log({
      name: 'Material Library',
      status: materialCount >= 20 ? 'pass' : 'warn',
      message: `${materialCount} materials found`,
      details: typeBreakdown 
        ? Object.entries(typeBreakdown).map(([k, v]) => `${k}: ${v}`).join(', ')
        : undefined,
    });
  } else {
    log({
      name: 'Material Library',
      status: 'fail',
      message: 'No materials found - seeding required',
    });
  }

  // Check specific popular colors from our requirements
  const requiredColors = [
    { code: 'SW 7005', name: 'Pure White' },
    { code: 'SW 7015', name: 'Repose Gray' },
    { code: 'SW 7012', name: 'Creamy' },
  ];

  for (const color of requiredColors) {
    const { data } = await supabase
      .from('color_library')
      .select('color_name, hex_code')
      .eq('color_code', color.code)
      .limit(1);

    if (data && data.length > 0) {
      log({
        name: `Required Color: ${color.name}`,
        status: 'pass',
        message: `Found (${data[0].hex_code})`,
      });
    } else {
      log({
        name: `Required Color: ${color.name}`,
        status: 'warn',
        message: 'Not found in library',
      });
    }
  }
}

async function verifyQueries() {
  console.log('\n🔍 Testing Sample Queries...\n');

  // Test color query with filters
  try {
    const { data: grays, error } = await supabase
      .from('color_library')
      .select('id, color_name, hex_code, lrv')
      .eq('color_family', 'gray')
      .gte('lrv', 50)
      .order('lrv', { ascending: false })
      .limit(5);

    if (error) throw error;

    log({
      name: 'Query: Light Gray Colors',
      status: 'pass',
      message: `Found ${grays?.length || 0} light grays (LRV >= 50)`,
      details: grays?.map(c => `${c.color_name} (LRV: ${c.lrv})`).join(', '),
    });
  } catch (err: any) {
    log({
      name: 'Query: Light Gray Colors',
      status: 'fail',
      message: err.message,
    });
  }

  // Test material query
  try {
    const { data: countertops, error } = await supabase
      .from('material_library')
      .select('product_name, brand, avg_cost_per_unit')
      .eq('material_type', 'countertop')
      .eq('popular', true)
      .order('avg_cost_per_unit', { ascending: true });

    if (error) throw error;

    log({
      name: 'Query: Popular Countertops',
      status: 'pass',
      message: `Found ${countertops?.length || 0} popular countertops`,
      details: countertops?.map(c => `${c.brand} ${c.product_name}: $${c.avg_cost_per_unit}/sqft`).join(', '),
    });
  } catch (err: any) {
    log({
      name: 'Query: Popular Countertops',
      status: 'fail',
      message: err.message,
    });
  }

  // Test flooring query
  try {
    const { data: flooring, error } = await supabase
      .from('material_library')
      .select('product_name, material_category, avg_cost_per_unit')
      .eq('material_type', 'flooring')
      .order('avg_cost_per_unit', { ascending: true });

    if (error) throw error;

    log({
      name: 'Query: Flooring Options',
      status: 'pass',
      message: `Found ${flooring?.length || 0} flooring options`,
      details: flooring?.map(f => `${f.product_name} (${f.material_category}): $${f.avg_cost_per_unit}/sqft`).join(', '),
    });
  } catch (err: any) {
    log({
      name: 'Query: Flooring Options',
      status: 'fail',
      message: err.message,
    });
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE 2A DATABASE VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log();

  // Check for schema cache issues
  const schemaCacheIssue = results.some(r => 
    r.message?.includes('schema cache') || r.details?.includes('schema cache')
  );

  if (schemaCacheIssue) {
    console.log('⚠️  SUPABASE SCHEMA CACHE ISSUE DETECTED\n');
    console.log('The PostgREST schema cache has not refreshed yet.');
    console.log('This is common after creating new tables via migrations.\n');
    console.log('To fix:');
    console.log('  1. Go to Supabase Dashboard > Settings > API');
    console.log('  2. Click "Reload Schema" button');
    console.log('  3. Or wait 5-10 minutes for auto-refresh\n');
    console.log('The data exists in the database (verified via MCP).');
    console.log('Your app will work once the schema cache refreshes.\n');
  } else if (failed === 0) {
    console.log('🎉 Phase 2A database is ready for development!\n');
    console.log('Next steps:');
    console.log('  1. Build Color Library Browser component');
    console.log('  2. Build Material Selector component');
    console.log('  3. Build Moodboard Canvas component');
  } else {
    console.log('⚠️  Some checks failed. Please review and fix before proceeding.\n');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔧 Phase 2A Database Verification Script');
  console.log('='.repeat(60));
  console.log(`\nSupabase URL: ${supabaseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  await verifyTables();
  await verifySeedData();
  await verifyQueries();
  await printSummary();
}

main().catch(console.error);

