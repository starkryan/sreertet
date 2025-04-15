"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "./client";

const supabase = createServerSupabaseClient();

export async function getUserBalance() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Not authenticated");
    }

    try {
      const { data } = await supabase
        .from("clerk_users")
        .select("balance")
        .eq("clerk_id", userId)
        .single();

      return data?.balance || 0;
    } catch (error) {
      console.error("Error fetching user balance:", error);
      throw new Error("Failed to fetch balance");
    }
  } catch (error: any) {
    console.error("Error in getUserBalance:", error.message);
    throw new Error("Failed to get balance");
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
    
    if (!userId || !user) {
      throw new Error("Not authenticated");
    }

    try {
      // Check if user exists in database
      const { data } = await supabase
        .from("clerk_users")
        .select("clerk_id")
        .eq("clerk_id", userId)
        .single();
      
      // User exists, nothing more to do
      return true;
    } catch (checkError: any) {
      // If no user found or error is PGRST116, create one
      if (checkError.code === "PGRST116") {
        const primaryEmail = user.emailAddresses[0]?.emailAddress || '';
        
        // Insert user with default balance
        try {
          await supabase
            .from("clerk_users")
            .insert({
              clerk_id: userId,
              email: primaryEmail,
              first_name: user.firstName || '',
              last_name: user.lastName || '',
              avatar_url: user.imageUrl || '',
              balance: 0, // Default balance
            });
          
          return true;
        } catch (insertError: any) {
          console.error("Error creating user:", insertError);
          throw new Error("Failed to create user");
        }
      } else {
        // For other errors
        console.error("Error checking user:", checkError);
        throw new Error("Failed to check user");
      }
    }
  } catch (error: any) {
    console.error("Error in ensureUserExists:", error.message);
    throw new Error("Failed to ensure user exists");
  }
} 