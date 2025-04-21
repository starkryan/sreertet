"use client";

import { useState } from "react";
import { adminUpdateUserBalance, adminFindUserByEmail } from "@/app/ssr/admin-actions";
import { toast } from "sonner";

type User = {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  balance: number;
  created_at: string;
};

type Props = {
  users: User[];
};

export default function BalanceManagement({ users }: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<"credit" | "debit">("credit");
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);

  // Search user by email
  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      toast.error("Please enter an email to search");
      return;
    }

    setIsSearching(true);
    
    try {
      const result = await adminFindUserByEmail(searchEmail);
      
      if (result.success && result.data) {
        setFoundUser(result.data);
        toast.success(`Found user: ${result.data.email}`);
      } else {
        setFoundUser(null);
        toast.error(result.message || "User not found");
      }
    } catch (error: any) {
      toast.error(error.message || "Error searching for user");
      setFoundUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle balance update
  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foundUser) {
      toast.error("Please search and select a user first");
      return;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await adminUpdateUserBalance(
        foundUser.id, 
        amount, 
        transactionType
      );
      
      if (result.success && result.data) {
        toast.success(result.message);
        // Update found user's balance
        setFoundUser({
          ...foundUser,
          balance: Number(result.data.balance)
        });
        // Reset amount
        setAmount(0);
      } else {
        toast.error(result.message || "Failed to update balance");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to display user name or email
  const getUserDisplayName = (user: User) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.email;
  };

  return (
    <div className="space-y-6">
      {/* Email search form */}
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h2 className="mb-4 text-xl font-semibold">Find User by Email</h2>
        
        <form onSubmit={handleSearchUser} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter user email"
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={isSearching}
              className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 ${
                isSearching ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      {/* User details and balance update form */}
      {foundUser && (
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="mb-4 text-xl font-semibold">User Details</h2>
          
          <div className="p-4 mb-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {getUserDisplayName(foundUser) || "No name provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{foundUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-lg font-bold text-green-600">{foundUser.balance}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-gray-600">{foundUser.id}</p>
              </div>
            </div>
          </div>

          <h3 className="mb-4 text-lg font-semibold">Adjust Balance</h3>
          
          <form onSubmit={handleUpdateBalance} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">
                Transaction Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="transactionType"
                    checked={transactionType === "credit"}
                    onChange={() => setTransactionType("credit")}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Credit (Add)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="transactionType"
                    checked={transactionType === "debit"}
                    onChange={() => setTransactionType("debit")}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Debit (Subtract)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Amount
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount === 0 ? "" : amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm">
                <p className="text-gray-500">
                  {transactionType === "credit" 
                    ? `Adding ${amount || 0} to current balance (${foundUser.balance})`
                    : `Subtracting ${amount || 0} from current balance (${foundUser.balance})`}
                </p>
                {amount > 0 && (
                  <p className="font-medium">
                    New balance will be: {transactionType === "credit" 
                      ? Number(foundUser.balance) + Number(amount) 
                      : Math.max(0, Number(foundUser.balance) - Number(amount))}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 text-white rounded ${
                  transactionType === "credit" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading 
                  ? "Processing..." 
                  : transactionType === "credit" 
                    ? "Add Balance" 
                    : "Subtract Balance"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent users list */}
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h2 className="mb-4 text-xl font-semibold">Recent Users</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.slice(0, 10).map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.first_name || user.last_name ? (
                        <div>
                          {user.first_name} {user.last_name}
                        </div>
                      ) : (
                        <div className="text-gray-500">No name</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setFoundUser(user);
                          setSearchEmail(user.email);
                          window.scrollTo({top: 0, behavior: 'smooth'});
                        }}
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 