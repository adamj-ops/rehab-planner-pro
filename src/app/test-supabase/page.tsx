'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { testSupabaseConnection } from '@/lib/supabase/test-connection'

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const result = await testSupabaseConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: 'Test failed' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertDescription>
                {testResult.success ? (
                  <div>
                    <strong>✅ Connection Successful!</strong>
                    <p className="mt-2">Your Supabase environment variables are properly configured.</p>
                  </div>
                ) : (
                  <div>
                    <strong>❌ Connection Failed</strong>
                    <p className="mt-2">Error: {testResult.error}</p>
                    <p className="mt-2">Please check your environment variables and Supabase project setup.</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Environment Variables Status:</p>
            <ul className="mt-2 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
