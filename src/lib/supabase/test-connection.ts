import { supabase } from './client'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set')
    console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set')
    
    // Test basic connection
    const { data, error } = await supabase.from('rehab_projects').select('count').limit(1)
    
    if (error) {
      console.log('Connection test result:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful!')
    return { success: true, data }
  } catch (error) {
    console.log('❌ Supabase connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
