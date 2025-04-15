import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const db = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Get user auth info
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user from database with Clerk ID
    const { data: userData, error: userError } = await db
      .from('clerk_users')
      .select('id')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const dbUserId = userData.id;
    
    // Fetch history from the database
    const { data: historyData, error: historyError } = await db
      .from('phone_activations')
      .select(`
        id,
        user_id,
        service,
        phone_number,
        activation_id,
        sms_code,
        status,
        created_at,
        updated_at
      `)
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (historyError) {
      console.error('History fetch error:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch history' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      history: historyData
    })
    
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' }, 
      { status: 500 }
    )
  }
} 