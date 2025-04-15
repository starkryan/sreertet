import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Gets or creates a user in the Supabase database based on Clerk user ID
 * @param clerkId - The Clerk user ID
 * @param email - The user's email
 * @returns The user's Supabase UUID
 */
export async function getOrCreateUser(clerkId: string, email: string) {
  try {
    // First try to get the user
    const { data: existingUser, error: getUserError } = await supabase
      .from('clerk_users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();

    // If the user exists, return their ID
    if (existingUser) {
      return { id: existingUser.id, isNewUser: false };
    }
    
    // If there was an error other than "no rows returned", throw it
    if (getUserError && getUserError.code !== 'PGRST116') {
      throw getUserError;
    }

    // User doesn't exist, so create them
    const { data: newUser, error: createError } = await supabase
      .from('clerk_users')
      .insert([
        {
          clerk_id: clerkId,
          email: email,
          balance: 0, // Initial balance
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }

    return { id: newUser.id, isNewUser: true };
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
} 