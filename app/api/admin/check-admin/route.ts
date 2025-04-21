import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/utils/roles';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    const adminStatus = await isAdmin(userId);
    
    return NextResponse.json({
      isAdmin: adminStatus,
    });
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status', message: error.message },
      { status: 500 }
    );
  }
} 