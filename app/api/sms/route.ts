import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '../../lib/db-helpers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const country = '22';
    const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${apiKey}&action=getNumber&service=${service}&country=${country}`;

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
      
      // Save the activation to the database
      const { error: insertError } = await supabase
        .from('phone_activations')
        .insert([
          {
            user_id: supabaseUserId,
            activation_id: activationId,
            phone_number: phoneNumber,
            service: service,
            status: 'pending',
            is_active: true
          }
        ]);
      
      if (insertError) {
        console.error('Error saving activation:', insertError);
        // Continue anyway since we got the number
      }
      
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
