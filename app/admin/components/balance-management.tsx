'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Search } from 'lucide-react';

// Schema for search
const searchSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Schema for balance update
const updateSchema = z.object({
  amount: z.coerce.number().int('Amount must be an integer'),
});

type SearchFormValues = z.infer<typeof searchSchema>;
type UpdateFormValues = z.infer<typeof updateSchema>;

// Type for user data
type UserData = {
  id: string;
  email: string;
  balance: number;
  first_name?: string;
  last_name?: string;
  clerk_id?: string;
};

export default function BalanceManagement() {
  const [loading, setLoading] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Form for searching user
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form for updating balance
  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      amount: 0,
    },
  });
  
  // Search for user by email
  const onSearch = async () => {
    if (!searchForm.getValues('email')) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    setUserFound(false);
    setUserData(null);
    
    try {
      const response = await fetch(`/api/admin/list-users?email=${encodeURIComponent(searchForm.getValues('email'))}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        const userMatch = data.users.find((user: UserData) => user.email.toLowerCase() === searchForm.getValues('email').toLowerCase());
        
        if (userMatch) {
          setUserData({
            id: userMatch.id,
            email: userMatch.email,
            balance: Number(userMatch.balance) || 0,
            first_name: userMatch.first_name,
            last_name: userMatch.last_name,
          });
          setUserFound(true);
          toast.success('User found', {
            description: `Found user: ${userMatch.email} with balance ${userMatch.balance}`,
          });
        } else {
          toast.error('User not found', {
            description: 'No user found with that exact email address',
          });
        }
      } else {
        toast.error('User not found', {
          description: 'No user found with that email address',
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Search failed', {
        description: error.message || 'Failed to search for user',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update user balance
  const onUpdateBalance = async () => {
    if (!userData) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/update-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: userData.id, 
          amount: Number(updateForm.getValues('amount')) 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update local data with new balance
      setUserData({
        ...userData,
        balance: Number(result.newBalance) || 0,
      });
      
      toast.success('Balance updated', {
        description: `New balance: ${result.newBalance}`,
      });
      
      // Reset form
      updateForm.reset({
        amount: 0,
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Update failed', {
        description: error.message || 'Failed to update balance',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Balance Management</CardTitle>
        <CardDescription>Search for users by email and manage their balance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search form */}
        <Form {...searchForm}>
          <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex items-end gap-3">
            <FormField
              control={searchForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </form>
        </Form>
        
        {/* User details and balance update */}
        {userFound && userData && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold">User Details</h3>
              <p>
                <span className="font-medium">Name:</span> {userData.first_name || ''} {userData.last_name || ''}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p className="text-xl">
                <span className="font-medium">Current Balance:</span> <span className="font-bold">{userData.balance}</span>
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Update Balance</h3>
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateBalance)} className="flex items-end gap-3">
                  <FormField
                    control={updateForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Amount (positive to add, negative to subtract)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Update Balance
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 