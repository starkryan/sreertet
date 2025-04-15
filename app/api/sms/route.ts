import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the service from the request URL
  const searchParams = request.nextUrl.searchParams;
  const service = searchParams.get('service');
  
  if (!service) {
    return NextResponse.json({ error: 'Service parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GRIZZLY_SMS_API_KEY;
  const country = '22';
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getNumber&service=${service}&country=${country}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Check for error responses
    if (data === 'BAD_KEY') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }
    if (data === 'NO_NUMBERS') {
      return NextResponse.json({ error: 'No numbers available for this service/country' }, { status: 404 });
    }
    
    // Parse successful response (ACCESS_NUMBER:ID:NUMBER)
    if (typeof data === 'string' && data.startsWith('ACCESS_NUMBER:')) {
      const parts = data.split(':');
      const activationId = parts[1];
      const phoneNumber = parts[2];
      
      return NextResponse.json({ 
        success: true,
        activationId,
        phoneNumber 
      });
    }
    
    return NextResponse.json({ error: 'Unexpected response from service', data }, { status: 500 });
  } catch (error) {
    console.error('Error fetching SMS number:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS number' }, { status: 500 });
  }
}
