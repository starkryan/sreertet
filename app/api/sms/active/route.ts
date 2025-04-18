import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateUser } from '../../../lib/db-helpers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get all active phone activations for the user
    const { data: activationData, error: activationError } = await supabase
      .from('phone_activations')
      .select('*')
      .eq('user_id', supabaseUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activationError) {
      if (activationError.code === 'PGRST116') {
        // No active activation found (single row error)
        return NextResponse.json({ 
          success: true, 
          activations: [] 
        });
      }
      
      console.error('Error fetching activation:', activationError);
      return NextResponse.json({ error: 'Failed to fetch active numbers' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      activations: activationData || []
    });
  } catch (error) {
    console.error('Error fetching active phone number:', error);
    return NextResponse.json({ error: 'Failed to fetch active phone number' }, { status: 500 });
  }
} 