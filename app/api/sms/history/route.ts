import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const db = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // Parse the URL to get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // Calculate range based on page and pageSize
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

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
    
    // Get total count of records for pagination info
    const { count: totalCount, error: countError } = await db
      .from('phone_activations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', dbUserId);
      
    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json(
        { error: 'Failed to count history items' }, 
        { status: 500 }
      );
    }
    
    // Fetch paginated history from the database
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
      .range(from, to);
    
    if (historyError) {
      console.error('History fetch error:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch history' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      history: historyData,
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize)
      }
    })
    
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' }, 
      { status: 500 }
    )
  }
} 