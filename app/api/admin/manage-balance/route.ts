import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/app/ssr/client';
import { isAdmin } from '@/utils/roles';
import { z } from 'zod';

// Schema for request validation
const manageBalanceSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
  operation: z.enum(['credit', 'debit']),
});

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
    
    // Get and validate request body
    const body = await request.json();
    const validation = manageBalanceSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { email, amount, operation } = validation.data;
    
    // Initialize Supabase client
    const supabase = createServerSupabaseClient();
    
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('clerk_users')
      .select('id, clerk_id, balance')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      console.error('Error finding user:', userError);
      return NextResponse.json(
        { error: 'User not found with the provided email' },
        { status: 404 }
      );
    }
    
    // Calculate new balance
    let newBalance: number;
    const currentBalance = Number(userData.balance) || 0;
    
    if (operation === 'credit') {
      newBalance = currentBalance + amount;
    } else {
      // For debit, ensure user has sufficient balance
      if (currentBalance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance for debit operation' },
          { status: 400 }
        );
      }
      newBalance = currentBalance - amount;
    }
    
    // Update user balance
    const { data: updateData, error: updateError } = await supabase
      .from('clerk_users')
      .update({ balance: newBalance })
      .eq('id', userData.id)
      .select('balance')
      .single();
    
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user balance' },
        { status: 500 }
      );
    }
    
    // Log transaction (in a real system, you would store this in a transactions table)
    console.log(`Admin ${userId} ${operation}ed ${amount} ${operation === 'credit' ? 'to' : 'from'} user ${email}. New balance: ${newBalance}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${operation === 'credit' ? 'credited' : 'debited'} user balance`,
      newBalance,
      user: {
        email,
        clerk_id: userData.clerk_id,
      }
    });
    
  } catch (error: any) {
    console.error('Error in manage-balance API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 