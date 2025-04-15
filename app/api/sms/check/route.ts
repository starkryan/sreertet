import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';

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

  const apiKey = process.env.GRIZZLY_SMS_API_KEY;
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getStatus&id=${activationId}`;

  try {
    const data = await makeApiCallWithRetry(url);
    
    // Parse the response based on possible status values
    if (data === 'STATUS_WAIT_CODE') {
      return NextResponse.json({ 
        status: 'waiting',
        message: 'Waiting for SMS code'
      });
    }
    
    if (data === 'STATUS_CANCEL') {
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
    
    return NextResponse.json({ error: `Unexpected response: ${data}` }, { status: 500 });
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