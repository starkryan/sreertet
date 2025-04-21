import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/app/ssr/client';
import { isAdmin } from '@/utils/roles';

export async function POST(request: NextRequest) {
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
    
    // Get request body
    const body = await request.json();
    const { userId: targetUserId, amount } = body;
    
    if (!targetUserId || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get current balance
    const { data: userData, error: fetchError } = await supabase
      .from('clerk_users')
      .select('balance')
      .eq('id', targetUserId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user balance:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user balance' },
        { status: 500 }
      );
    }
    
    // Calculate new balance
    const currentBalance = Number(userData.balance) || 0;
    const newBalance = currentBalance + Number(amount);
    
    // Update balance in database
    const { data, error: updateError } = await supabase
      .from('clerk_users')
      .update({ balance: newBalance })
      .eq('id', targetUserId)
      .select('balance')
      .single();
    
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      newBalance: data.balance,
      previousBalance: currentBalance,
      change: Number(amount)
    });
    
  } catch (error: any) {
    console.error('Error in update-balance API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 