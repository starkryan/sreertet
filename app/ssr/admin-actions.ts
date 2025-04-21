"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "./client";
import { revalidatePath } from "next/cache";

const supabase = createServerSupabaseClient();

/**
 * Admin-only function to credit or debit a user's balance
 * A positive amount adds to balance, negative amount deducts from balance
 */
export async function adminUpdateUserBalance(userId: string, amount: number, transactionType: 'credit' | 'debit') {
  try {
    const { sessionClaims } = await auth();
    
    // Check if user is admin
    if (sessionClaims?.metadata.role !== 'admin') {
      throw new Error("Unauthorized. Only admins can perform this action.");
    }

    // First get current balance
    const { data: userData, error: fetchError } = await supabase
      .from("clerk_users")
      .select("balance")
      .eq("id", userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching user balance:", fetchError);
      throw new Error("Failed to fetch user balance");
    }

    let currentBalance = Number(userData?.balance || 0);
    
    // Calculate new balance (add for credit, subtract for debit)
    const adjustmentAmount = transactionType === 'credit' ? Math.abs(amount) : -Math.abs(amount);
    const newBalance = currentBalance + adjustmentAmount;

    // Prevent negative balance
    if (newBalance < 0) {
      throw new Error("Cannot reduce balance below zero");
    }

    // Update balance
    const { data, error: updateError } = await supabase
      .from("clerk_users")
      .update({ balance: newBalance })
      .eq("id", userId)
      .select("balance, clerk_id, email, first_name, last_name")
      .single();
    
    if (updateError) {
      console.error("Error updating user balance:", updateError);
      throw new Error("Failed to update balance");
    }

    // Create a transaction record (in the future if you add a transactions table)
    // This would be a good place to log the transaction details

    revalidatePath('/admin/balance');
    return {
      success: true,
      message: `Successfully ${transactionType === 'credit' ? 'credited' : 'debited'} ${Math.abs(amount)} to user ${data.first_name || data.email}`,
      data
    };
  } catch (error: any) {
    console.error(`Error in adminUpdateUserBalance (${transactionType}):`, error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Admin-only function to fetch all users for the admin panel
 */
export async function adminGetAllUsers() {
  try {
    const { sessionClaims } = await auth();
    
    // Check if user is admin
    if (sessionClaims?.metadata.role !== 'admin') {
      throw new Error("Unauthorized. Only admins can perform this action.");
    }

    const { data, error } = await supabase
      .from("clerk_users")
      .select("id, clerk_id, email, first_name, last_name, balance, created_at")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error("Error in adminGetAllUsers:", error.message);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}

/**
 * Admin-only function to find a user by email
 */
export async function adminFindUserByEmail(email: string) {
  try {
    const { sessionClaims } = await auth();
    
    // Check if user is admin
    if (sessionClaims?.metadata.role !== 'admin') {
      throw new Error("Unauthorized. Only admins can perform this action.");
    }

    if (!email || email.trim() === '') {
      return {
        success: false,
        message: "Email is required",
        data: null
      };
    }

    const { data, error } = await supabase
      .from("clerk_users")
      .select("id, clerk_id, email, first_name, last_name, balance, created_at")
      .ilike("email", `%${email}%`)
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return {
          success: false,
          message: `No user found with email containing '${email}'`,
          data: null
        };
      }
      
      console.error("Error finding user by email:", error);
      throw new Error("Failed to find user");
    }

    return {
      success: true,
      message: "User found",
      data
    };
  } catch (error: any) {
    console.error("Error in adminFindUserByEmail:", error.message);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
} 