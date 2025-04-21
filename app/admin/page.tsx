import React from 'react';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import BalanceManagement from './components/balance-management';
import { isAdmin } from '@/utils/roles';

export default async function AdminPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }
  
  // Check if user is admin directly using our utility function
  const adminStatus = await isAdmin(user.id);
  
  if (!adminStatus) {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage user balances and system settings</p>
      </div>
      
      <div className="grid gap-8">
        <BalanceManagement />
      </div>
    </div>
  );
} 