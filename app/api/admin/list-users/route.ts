import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/app/ssr/client';
import { isAdmin } from '@/utils/roles';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const adminStatus = await isAdmin(userId);
    
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Initialize Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase
      .from('clerk_users')
      .select('id, clerk_id, email, first_name, last_name, balance, created_at', { count: 'exact' });
    
    // Add search if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }
    
    // Add pagination
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      users: data,
      total: count,
      page: Math.floor(offset / limit) + 1,
      limit,
      offset,
    });
    
  } catch (error: any) {
    console.error('Error in list-users API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 