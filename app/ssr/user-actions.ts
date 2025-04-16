"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "./client";

const supabase = createServerSupabaseClient();

export async function getUserBalance() {
  try {
    const { userId } = await auth();
    
    console.log('Fetching balance for Clerk userId:', userId);
    
    if (!userId) {
      console.error('No userId found in auth context');
      throw new Error("Not authenticated");
    }

    try {
      // First ensure the user exists
      await ensureUserExists();
      
      // Then query for their balance
      console.log('Querying balance for clerk_id:', userId);
      const { data, error } = await supabase
        .from("clerk_users")
        .select("balance")
        .eq("clerk_id", userId);
      
      if (error) {
        console.error("Database query error:", error);
        throw error;
      }
      
      // We should have at least one result since we ensured the user exists
      if (data && data.length > 0) {
        console.log('Database balance result:', data[0]);
        // Convert to number to ensure correct type
        const balanceValue = Number(data[0]?.balance) || 0;
        return balanceValue;
      } else {
        console.log('No balance data found for clerk_id:', userId);
        return 0;
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
      throw new Error("Failed to fetch balance");
    }
  } catch (error: any) {
    console.error("Error in getUserBalance:", error.message);
    throw new Error("Failed to get balance: " + error.message);
  }
}

// Admin-only function - should be protected by appropriate middleware
export async function updateUserBalance(clerkId: string, amount: number) {
  try {
    // This would typically be protected by admin middleware
    try {
      const { data } = await supabase
        .from("clerk_users")
        .update({ balance: amount })
        .eq("clerk_id", clerkId)
        .select("balance")
        .single();

      return data?.balance;
    } catch (error) {
      console.error("Error updating user balance:", error);
      throw new Error("Failed to update balance");
    }
  } catch (error: any) {
    console.error("Error in updateUserBalance:", error.message);
    throw new Error("Failed to update balance");
  }
}

// For internal use by other server actions
export async function incrementUserBalance(clerkId: string, increment: number) {
  try {
    try {
      // Get current balance first
      const { data: userData } = await supabase
        .from("clerk_users")
        .select("balance")
        .eq("clerk_id", clerkId)
        .single();

      const currentBalance = userData?.balance || 0;
      const newBalance = Number(currentBalance) + Number(increment);

      // Update balance
      const { data } = await supabase
        .from("clerk_users")
        .update({ balance: newBalance })
        .eq("clerk_id", clerkId)
        .select("balance")
        .single();

      return data?.balance;
    } catch (error) {
      console.error("Error incrementing user balance:", error);
      throw new Error("Failed to increment balance");
    }
  } catch (error: any) {
    console.error("Error in incrementUserBalance:", error.message);
    throw new Error("Failed to increment balance");
  }
}

// Check if user exists in database
export async function ensureUserExists() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    console.log('Ensuring user exists for Clerk userId:', userId);
    
    if (!userId || !user) {
      throw new Error("Not authenticated");
    }

    try {
      // Try to select the user first
      const { data, error } = await supabase
        .from("clerk_users")
        .select("clerk_id, balance")
        .eq("clerk_id", userId);
      
      if (error) {
        console.error("Error checking if user exists:", error);
        throw error;
      }
      
      // If user exists
      if (data && data.length > 0) {
        console.log("User found in database:", data[0]);
        return true;
      }
      
      // If we get here, user doesn't exist, create one
      console.log("User not found, creating new user record");
      const primaryEmail = user.emailAddresses[0]?.emailAddress || '';
      
      const { data: insertData, error: insertError } = await supabase
        .from("clerk_users")
        .insert({
          clerk_id: userId,
          email: primaryEmail,
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          avatar_url: user.imageUrl || '',
          balance: 1000, // Set default balance to 1000
        })
        .select();
      
      if (insertError) {
        console.error("Error creating user:", insertError);
        throw insertError;
      }
      
      console.log("Successfully created user:", insertData);
      return true;
    } catch (error) {
      console.error("Database error in ensureUserExists:", error);
      throw error;
    }
  } catch (error: any) {
    console.error("Error in ensureUserExists:", error.message);
    throw new Error("Failed to ensure user exists");
  }
} 