import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '../../../lib/db-helpers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${apiKey}&action=setStatus&status=8&id=${activationId}`;

    const response = await axios.get(url);
    const data = response.data;
    
    // Check for success response
    if (data === 'ACCESS_CANCEL') {
      // Update the activation status in the database
      const { error: updateError } = await supabase
        .from('phone_activations')
        .update({
          status: 'cancelled',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('activation_id', activationId)
        .eq('user_id', supabaseUserId);
      
      if (updateError) {
        console.error('Error updating activation status:', updateError);
        // Continue anyway since the cancellation was successful
      }
      
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