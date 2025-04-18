import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '../../../lib/db-helpers';

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

// Function to calculate refund amount based on activation status and time
const calculateRefundAmount = (service: string): number => {
  // Get the original service price
  const servicePrice = SERVICE_PRICES[service as keyof typeof SERVICE_PRICES] || 0;
  
  // For now, provide a full refund for cancellations
  // In the future, you could implement partial refunds based on time elapsed or service usage
  return servicePrice;
};

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

    // Get the activation details first to determine the service
    const { data: activationData, error: fetchError } = await supabase
      .from('phone_activations')
      .select('service, is_active, status, created_at')
      .eq('activation_id', activationId)
      .eq('user_id', supabaseUserId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching activation details:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch activation details' }, { status: 500 });
    }
    
    // If activation is not found or already cancelled, return error
    if (!activationData) {
      return NextResponse.json({ error: 'Activation not found' }, { status: 404 });
    }
    
    // If activation is already cancelled or not active, don't proceed
    if (!activationData.is_active || activationData.status === 'cancelled') {
      return NextResponse.json({ error: 'Activation is already cancelled or inactive' }, { status: 400 });
    }

    // Check if 2 minutes have passed since activation
    const now = new Date();
    const createdAt = new Date(activationData.created_at);
    const elapsedTimeMs = now.getTime() - createdAt.getTime();
    const twoMinutesMs = 2 * 60 * 1000;

    if (elapsedTimeMs < twoMinutesMs) {
      const remainingSeconds = Math.ceil((twoMinutesMs - elapsedTimeMs) / 1000);
      return NextResponse.json({ 
        error: 'EARLY_CANCEL_DENIED', 
        message: `Early cancellation denied. Please wait ${remainingSeconds} seconds.`,
        remainingSeconds
      }, { status: 429 }); // Too Many Requests is appropriate for rate limiting
    }

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
      
      // Calculate refund amount based on the service
      const refundAmount = calculateRefundAmount(activationData.service);
      
      if (refundAmount > 0) {
        // Get current user balance
        const { data: userData, error: balanceError } = await supabase
          .from('clerk_users')
          .select('balance')
          .eq('clerk_id', userId)
          .single();
        
        if (balanceError) {
          console.error('Error fetching user balance for refund:', balanceError);
          // Return success but note the refund error
          return NextResponse.json({ 
            success: true, 
            message: 'Activation cancelled successfully but refund failed. Please contact support.' 
          });
        }
        
        // Update user balance with refund
        const newBalance = Number(userData.balance) + refundAmount;
        const { error: updateBalanceError } = await supabase
          .from('clerk_users')
          .update({ balance: newBalance })
          .eq('clerk_id', userId);
        
        if (updateBalanceError) {
          console.error('Error updating balance for refund:', updateBalanceError);
          return NextResponse.json({ 
            success: true, 
            message: 'Activation cancelled successfully but refund failed. Please contact support.' 
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Activation cancelled successfully',
          refundAmount,
          newBalance
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Activation cancelled successfully',
        refundAmount: 0
      });
    }
    
    // Handle potential errors from external API
    if (data === 'BAD_KEY') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }
    if (data === 'NO_ACTIVATION') {
      return NextResponse.json({ error: 'Activation not found on provider' }, { status: 404 });
    }
    if (data && data.toString().includes('EARLY_CANCEL')) {
      return NextResponse.json({ 
        error: 'EARLY_CANCEL_DENIED', 
        message: 'Early cancellation denied by the provider. Please wait 2 minutes before cancelling.' 
      }, { status: 429 });
    }
    
    return NextResponse.json({ error: `Unexpected response: ${data}` }, { status: 500 });
  } catch (error) {
    console.error('Error cancelling activation:', error);
    // Check if it's an API error with EARLY_CANCEL in response
    if (error instanceof Error && error.message.includes('EARLY_CANCEL')) {
      return NextResponse.json({ 
        error: 'EARLY_CANCEL_DENIED', 
        message: 'Early cancellation denied by the provider. Please wait 2 minutes before cancelling.' 
      }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to cancel activation' }, { status: 500 });
  }
} 