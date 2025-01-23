import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { JWT } from 'https://deno.land/x/jwt@v2.0.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the JWT token and get the user
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Get the user's Google credentials
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('google_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (credentialsError || !credentials) {
      throw new Error('Google credentials not found')
    }

    // Parse request body
    const { url, type = 'URL_UPDATED' }: RequestBody = await req.json()
    if (!url) {
      throw new Error('URL is required')
    }

    // Create JWT token for Google API
    const jwtToken = await new JWT({
      alg: 'RS256',
      typ: 'JWT'
    }).setIssuer(credentials.client_email)
      .setAudience('https://www.googleapis.com/oauth2/v4/token')
      .setIssuedAt(new Date().getTime() / 1000)
      .setExpirationTime(new Date().getTime() / 1000 + 3600)
      .setPayload({
        scope: 'https://www.googleapis.com/auth/indexing'
      })
      .sign(credentials.private_key)

    // Get access token from Google
    const tokenResponse = await fetch('https://www.googleapis.com/oauth2/v4/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken
      })
    })

    const { access_token } = await tokenResponse.json()

    if (!access_token) {
      throw new Error('Failed to get Google access token')
    }

    // Make request to Indexing API
    const indexingResponse = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          url: url,
          type: type
        })
      }
    )

    const indexingResult = await indexingResponse.json()

    // Update credentials status if successful
    if (indexingResponse.ok) {
      await supabaseClient
        .from('google_credentials')
        .update({ status: 'active' })
        .eq('id', credentials.id)
    }

    return new Response(
      JSON.stringify(indexingResult),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})