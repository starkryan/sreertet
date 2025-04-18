import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '../../lib/db-helpers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Service price mapping
const SERVICE_PRICES = {
  'go': 20,
  'tg': 50,
  'wa': 120,
  'ig': 12,
  'jx': 22,
  'am': 20,
  'wmh': 16,
  'sn': 24,
  'zpt': 25,
  've': 26,
  'us': 20
};

const REAL_SERVICE_PRICES = {
  'sixer': 23,

}

// const REALOTP_API_KEY = process.env.REALOTP_SMSAPI_KEY || '';
// const REALOTP_API_URL = process.env.REALOTP_SMS_API_URL || '';

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

    // Check the user's balance
    const { data: userData, error: balanceError } = await supabase
      .from('clerk_users')
      .select('balance')
      .eq('clerk_id', userId)
      .single();

    if (balanceError) {
      console.error('Error fetching user balance:', balanceError);
      return NextResponse.json({ error: 'Failed to check balance' }, { status: 500 });
    }

    // Get the price for the requested service
    const servicePrice = SERVICE_PRICES[service as keyof typeof SERVICE_PRICES] || 0;
    if (servicePrice === 0) {
      return NextResponse.json({ error: 'Invalid service or price not configured' }, { status: 400 });
    }

    // Check if the user has enough balance
    if (userData.balance < servicePrice) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        requiredBalance: servicePrice,
        currentBalance: userData.balance 
      }, { status: 402 }); // 402 Payment Required
    }

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
      
      // Deduct balance from the user's account
      const newBalance = Number(userData.balance) - servicePrice;
      const { error: updateError } = await supabase
        .from('clerk_users')
        .update({ balance: newBalance })
        .eq('clerk_id', userId);
        
      if (updateError) {
        console.error('Error updating user balance:', updateError);
        // We got the number but couldn't update balance - still proceed but log error
        console.warn('User received phone number but balance was not deducted. Manual adjustment needed.');
      }
      
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
        phoneNumber,
        balanceDeducted: servicePrice,
        newBalance: newBalance
      });
    }
    
    return NextResponse.json({ error: 'Unexpected response from service', data }, { status: 500 });
  } catch (error) {
    console.error('Error fetching SMS number:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS number' }, { status: 500 });
  }
}
