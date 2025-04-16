import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserBalance } from '@/app/ssr/user-actions';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    console.error('No userId found in auth context for balance API');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('API: Fetching balance for user:', userId);
    // Get user balance using the existing server action
    const balance = await getUserBalance();
    
    console.log('API: Retrieved balance:', balance);
    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error('Error fetching user balance:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch user balance' }, { status: 500 });
  }
} 