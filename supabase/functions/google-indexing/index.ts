// Follow Google's OAuth 2.0 flow for service accounts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateGoogleJWT(privateKey: string, clientEmail: string) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Base64Url encode header and claim
  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encodedClaim = btoa(JSON.stringify(claim)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  // Create the signing input
  const signInput = `${encodedHeader}.${encodedClaim}`;

  // Create signing key
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the input
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    encoder.encode(signInput)
  );

  // Encode the signature
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${signInput}.${encodedSignature}`;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token and get the user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Get the user's Google credentials
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from('google_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (credentialsError || !credentials) {
      throw new Error('Google credentials not found');
    }

    // Parse request body
    const { url, type = 'URL_UPDATED' } = await req.json();
    if (!url) {
      throw new Error('URL is required');
    }

    // Generate JWT token for Google API
    const googleJWT = await generateGoogleJWT(credentials.private_key, credentials.client_email);

    // Get access token from Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: googleJWT,
      }),
    });

    const { access_token, error: tokenError } = await tokenResponse.json();

    if (tokenError || !access_token) {
      console.error('Token error:', tokenError);
      throw new Error('Failed to get Google access token');
    }

    // Make request to Indexing API
    const indexingResponse = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          url: url,
          type: type,
        }),
      }
    );

    const indexingResult = await indexingResponse.json();

    // Update credentials status if successful
    if (indexingResponse.ok) {
      await supabaseClient
        .from('google_credentials')
        .update({ status: 'active' })
        .eq('id', credentials.id);
    } else {
      console.error('Indexing API error:', indexingResult);
      await supabaseClient
        .from('google_credentials')
        .update({ 
          status: 'invalid',
          error_message: indexingResult.error?.message || 'Unknown error occurred'
        })
        .eq('id', credentials.id);
    }

    return new Response(
      JSON.stringify(indexingResult),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});