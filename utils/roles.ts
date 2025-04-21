import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/app/ssr/client'

export const checkRole = async (role: Roles) => {
  // Get auth data from Clerk
  const { userId, sessionClaims } = await auth()
  
  // First check Clerk metadata (backward compatibility)
  if (sessionClaims?.metadata.role === role) {
    return true
  }
  
  // If checking for admin role and not found in Clerk metadata, check database
  if (role === 'admin' && userId) {
    try {
      const supabase = createServerSupabaseClient()
      
      // Get clerk_users record for this user
      const { data: clerkUser, error: clerkUserError } = await supabase
        .from('clerk_users')
        .select('id')
        .eq('clerk_id', userId)
        .single()
      
      if (clerkUserError || !clerkUser) {
        console.error('Error fetching clerk user:', clerkUserError)
        return false
      }
      
      // Check if user is in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('clerk_user_id', clerkUser.id)
        .single()
      
      // User is admin if record exists in admin_users table
      return !adminError && !!adminUser
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }
  
  return false
}

export async function isAdmin(clerkId: string): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Check if the user exists in the clerk_admin_users table
    const { data, error } = await supabase
      .from('clerk_admin_users')
      .select('clerk_id')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isAdmin check:', error);
    return false;
  }
}