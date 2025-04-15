import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '../../../lib/db-helpers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const API_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API call with retry logic
async function makeApiCallWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.get(url, {
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error: any) {
    // Check if we should retry
    if (retries > 0) {
      const isNetworkError = !error.response && error.code && (
        error.code === 'ECONNABORTED' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ECONNRESET'
      );
      
      // Only retry on network errors, not on API errors like 404 or 500
      if (isNetworkError) {
        console.log(`API call failed with network error, retrying (${retries} attempts left)...`);
        await sleep(RETRY_DELAY);
        return makeApiCallWithRetry(url, retries - 1);
      }
    }
    
    // If we shouldn't retry, or we've run out of retries, rethrow the error
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the activation ID from the query parameters
  const searchParams = request.nextUrl.searchParams;
  const activationId = searchParams.get('id');
  
  if (!activationId) {
    return NextResponse.json({ error: 'Activation ID parameter is required' }, { status: 400 });
  }
  
  try {
    // Get the current user to access their email
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Get or create user in Supabase
    const { id: supabaseUserId } = await getOrCreateUser(userId, primaryEmail);

    const apiKey = process.env.GRIZZLY_SMS_API_KEY;
    const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getStatus&id=${activationId}`;

    // First check if we already have the code in the database
    const { data: activationData, error: activationError } = await supabase
      .from('phone_activations')
      .select('sms_code, status')
      .eq('activation_id', activationId)
      .eq('user_id', supabaseUserId)
      .eq('is_active', true)
      .single();
    
    if (!activationError && activationData && activationData.sms_code) {
      // We already have the code in the database
      return NextResponse.json({ 
        status: 'success',
        message: 'SMS code received',
        code: activationData.sms_code
      });
    }
    
    // If not in database or no code yet, check the API
    const data = await makeApiCallWithRetry(url);
    
    // Parse the response based on possible status values
    if (data === 'STATUS_WAIT_CODE') {
      return NextResponse.json({ 
        status: 'waiting',
        message: 'Waiting for SMS code'
      });
    }
    
    if (data === 'STATUS_CANCEL') {
      // Update the database
      await supabase
        .from('phone_activations')
        .update({
          status: 'cancelled',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('activation_id', activationId)
        .eq('user_id', supabaseUserId);
        
      return NextResponse.json({ 
        status: 'cancelled',
        message: 'Activation was cancelled'
      });
    }
    
    if (typeof data === 'string' && data.startsWith('STATUS_WAIT_RETRY:')) {
      const lastCode = data.split(':')[1];
      return NextResponse.json({ 
        status: 'retry',
        message: 'Last code was not accepted',
        lastCode
      });
    }
    
    if (data === 'STATUS_WAIT_RESEND') {
      return NextResponse.json({ 
        status: 'resend',
        message: 'Waiting for SMS to be sent again'
      });
    }
    
    if (typeof data === 'string' && data.startsWith('STATUS_OK:')) {
      const code = data.split(':')[1];
      
      // Update the database with the received code
      await supabase
        .from('phone_activations')
        .update({
          sms_code: code,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('activation_id', activationId)
        .eq('user_id', supabaseUserId);
      
      return NextResponse.json({ 
        status: 'success',
        message: 'SMS code received',
        code
      });
    }
    
    // Handle error responses
    if (data === 'NO_ACTIVATION') {
      return NextResponse.json({ error: 'Activation not found' }, { status: 404 });
    }
    
    if (data === 'BAD_KEY') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }
    
    return NextResponse.json({ error: `Unexpected API response: ${data}` }, { status: 500 });
  } catch (error: any) {
    console.error('Error checking SMS status:', error.message);
    
    // Provide a more user-friendly error message
    const errorMessage = error.response?.status ? 
      `API responded with status ${error.response.status}` : 
      'Network error when checking SMS status';
    
    return NextResponse.json({ 
      error: errorMessage,
      message: 'Temporary service disruption, please try again' 
    }, { status: 500 });
  }
} 