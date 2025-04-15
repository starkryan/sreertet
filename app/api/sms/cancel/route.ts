import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the activation ID from the request body
  const body = await request.json();
  const { activationId } = body;
  
  if (!activationId) {
    return NextResponse.json({ error: 'Activation ID is required' }, { status: 400 });
  }

  const apiKey = process.env.GRIZZLY_SMS_API_KEY;
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${apiKey}&action=setStatus&status=8&id=${activationId}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Check for success response
    if (data === 'ACCESS_CANCEL') {
      return NextResponse.json({ 
        success: true, 
        message: 'Activation cancelled successfully' 
      });
    }
    
    // Handle potential errors
    if (data === 'BAD_KEY') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }
    if (data === 'NO_ACTIVATION') {
      return NextResponse.json({ error: 'Activation not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: `Unexpected response: ${data}` }, { status: 500 });
  } catch (error) {
    console.error('Error cancelling activation:', error);
    return NextResponse.json({ error: 'Failed to cancel activation' }, { status: 500 });
  }
} 