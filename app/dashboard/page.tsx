"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import { FcGoogle } from "react-icons/fc";
import { FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaAmazon } from "react-icons/fa";
import { SiSwiggy } from "react-icons/si";
import { FaQuestion } from "react-icons/fa";
import { Check, Copy, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
const variants = ['default', 'circle', 'pinwheel', 'circle-filled', 'ellipsis', 'ring', 'bars', 'infinite'];


// Define service options outside the component for better performance
const serviceOptions = [
  { 
    value: 'go', 
    price: 25,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FcGoogle className="h-4 w-4" />
          <span>Google, Gmail, Youtube</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹25</span>
      </div>
    ),
    icon: <FcGoogle className="h-5 w-5" />,
    displayName: "Google, Gmail, Youtube"
  },
  { 
    value: 'tg', 
    price: 50,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaTelegramPlane className="h-4 w-4 text-blue-500" />
          <span>Telegram</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹50</span>
      </div>  
    ),
    icon: <FaTelegramPlane className="h-5 w-5 text-blue-500" />,
    displayName: "Telegram"
  },
  { 
    value: 'wa', 
    price: 100,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaWhatsapp className="h-4 w-4 text-green-500" />
          <span>WhatsApp</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹100</span>
      </div>
    ),
    icon: <FaWhatsapp className="h-5 w-5 text-green-500" />,
    displayName: "WhatsApp"
  },
  { 
    value: 'ig', 
    price: 12,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaInstagram className="h-4 w-4 text-pink-500" />
          <span>Instagram</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹12</span>
      </div>  
    ),
    icon: <FaInstagram className="h-5 w-5 text-pink-500" />,
    displayName: "Instagram"
  },
  { 
    value: 'jx', 
    price: 22,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <SiSwiggy className="h-4 w-4 text-orange-500" />
          <span>Swiggy</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹22</span>
      </div>  
    ),
    icon: <SiSwiggy className="h-5 w-5 text-orange-500" />,
    displayName: "Swiggy"
  },
  { 
    value: 'am', 
    price: 20,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaAmazon className="h-4 w-4 text-orange-500" />
          <span>Amazon</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹20</span>
      </div>  
    ),
    icon: <FaAmazon className="h-5 w-5 text-orange-500" />,
    displayName: "Amazon"
  },
  { 
    value: 'wmh', 
    price: 21,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaQuestion className="h-4 w-4 text-orange-500" />
          <span>Winmatch</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹21</span>
      </div>  
    ),
    icon: <FaQuestion className="h-5 w-5 text-orange-500" />,
    displayName: "Winmatch"
  },
  { 
    value: 'sn', 
    price: 24,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaQuestion className="h-4 w-4 text-orange-500" />
          <span>OLX</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹24</span>
      </div>  
    ),
    icon: <FaQuestion className="h-5 w-5 text-orange-500" />,
    displayName: "OLX"
  },
  { 
    value: 'zpt', 
    price: 25,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaQuestion className="h-4 w-4 text-orange-500" />
          <span>Zepto</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹25</span>
      </div>  
    ),
    icon: <FaQuestion className="h-5 w-5 text-orange-500" />,
    displayName: "Zepto"
  },
  {
    value: 've',
    price: 26,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaQuestion className="h-4 w-4 text-orange-500" />
          <span>Dream11</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹26</span>
      </div>
    ),
    icon: <FaQuestion className="h-5 w-5 text-orange-500" />,
    displayName: "Dream11"
  },
  {
    value: 'us',
    price: 20,
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <FaQuestion className="h-4 w-4 text-orange-500" />
          <span>IRCTC</span>
        </div>
        <span className="text-sm font-medium text-green-600 ml-8">₹20</span>
        </div>
        ),
        icon: <FaQuestion className="h-5 w-5 text-orange-500" />,
        displayName: "IRCTC"
  }

];

// Polling interval in milliseconds
const POLLING_INTERVAL = 3000; // 3 seconds

// Maximum consecutive errors before stopping polling
const MAX_CONSECUTIVE_ERRORS = 5;

// Add interface for active number (added before the PhoneNumberCard component)
interface ActiveNumber {
  phoneNumber: string;
  activationId: string;
  service: string;
  activationTime: Date | null;
  smsCode: string;
  isPolling: boolean;
  pollCount: number;
  smsStatus: string;
  cancelAvailable: boolean;
  remainingSeconds: number;
  errorCount: number;
}

// Add a new PhoneNumberCard component above the main DashboardPage
const PhoneNumberCard = ({
  phoneNumber,
  activationId,
  service,
  activationTime,
  smsCode,
  isPolling,
  pollCount,
  smsStatus,
  cancelAvailable,
  remainingSeconds,
  onCancel,
  onCopy
}: {
  phoneNumber: string;
  activationId: string;
  service: string;
  activationTime: Date | null;
  smsCode: string;
  isPolling: boolean;
  pollCount: number;
  smsStatus: string;
  cancelAvailable: boolean;
  remainingSeconds: number;
  onCancel: () => void;
  onCopy: (text: string, type: string) => void;
}) => {
  const serviceName = serviceOptions.find(option => option.value === service)?.label || service;
  const [showShimmer, setShowShimmer] = useState(false);
  
  // Effect for shimmer animation when SMS code is received
  useEffect(() => {
    if (smsCode && smsCode.length > 0) {
      setShowShimmer(true);
      const timer = setTimeout(() => {
        setShowShimmer(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [smsCode]);
  
  // For display of copied status
  const [copyStatus, setCopyStatus] = useState<{ number: boolean; code: boolean }>({ number: false, code: false });
  
  // Handle copy function with visual feedback
  const handleCopyWithFeedback = (text: string, type: string) => {
    onCopy(text, type);
    
    if (type === 'number') {
      setCopyStatus({ ...copyStatus, number: true });
      setTimeout(() => setCopyStatus(prev => ({ ...prev, number: false })), 2000);
    } else if (type === 'code') {
      setCopyStatus({ ...copyStatus, code: true });
      setTimeout(() => setCopyStatus(prev => ({ ...prev, code: false })), 2000);
    }
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-3 relative 
      ${showShimmer ? 'shimmer-bg' : ''} 
      ${smsStatus === 'success' ? 'border-green-300 dark:border-green-800' : ''}
      ${smsStatus === 'waiting' ? 'border-yellow-300 dark:border-yellow-800' : ''}
      ${smsStatus === 'cancelling' ? 'border-red-300 dark:border-red-800' : ''}`}>
      
      {/* Service and number header */}
      <div className="flex justify-between mb-3">
        <h3 className="font-medium text-sm sm:text-base">Virtual Phone Number:</h3>
        <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
          {serviceName}
        </div>
      </div>
      
      {/* Phone number with copy button */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-base sm:text-lg font-mono bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 flex-1">
          {phoneNumber}
        </div>
        <button
          className={`p-1.5 rounded-md ${copyStatus.number ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
          onClick={() => handleCopyWithFeedback(phoneNumber, 'number')}
          aria-label="Copy phone number"
        >
          {copyStatus.number ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      
      {/* SMS Code display - show code or waiting message */}
      <div className="mb-4">
        <h3 className="font-medium text-sm mb-1">SMS Code:</h3>
        {smsCode ? (
          <div className="flex items-center gap-2">
            <div className="font-mono bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded px-3 py-1.5 text-base sm:text-lg flex-1 tracking-wider text-center">
              {smsCode}
            </div>
            <button
              className={`p-1.5 rounded-md ${copyStatus.code ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
              onClick={() => handleCopyWithFeedback(smsCode, 'code')}
              aria-label="Copy SMS code"
            >
              {copyStatus.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <div className="flex-1 h-9 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center">
            {isPolling ? (
              <div className="flex items-center gap-2">
                <Spinner variant="circle" className="h-4 w-4" />
                <span>Waiting for SMS... (poll #{pollCount})</span>
              </div>
            ) : (
              "No SMS code received yet"
            )}
          </div>
        )}
      </div>
      
      {/* Cancellation timer / button */}
      {!smsCode && (
        <>
          {!cancelAvailable && remainingSeconds > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Cancellation available in <span className="font-semibold">{remainingSeconds}</span> seconds
            </div>
          )}
          
          {cancelAvailable && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Cancel Number
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Status indicator badge */}
      <div className="absolute top-2 right-2">
        {smsStatus === 'success' && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Success
          </span>
        )}
        {smsStatus === 'waiting' && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Waiting
          </span>
        )}
        {smsStatus === 'cancelling' && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Cancelling
          </span>
        )}
      </div>
      
      {/* Activation time */}
      {activationTime && (
        <div className="text-xs text-gray-400 mt-2">
          Activated: {new Date(activationTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  
  // Multiple phone numbers state
  const [activeNumbers, setActiveNumbers] = useState<Array<ActiveNumber>>([]);
  
  // References for timers
  const countdownIntervals = React.useRef<{[key: string]: NodeJS.Timeout | null}>({});
  const cancelTimers = React.useRef<{[key: string]: NodeJS.Timeout | null}>({});
  const pollingIntervals = React.useRef<{[key: string]: NodeJS.Timeout | null}>({});

  // Function to start countdown for a specific activation
  const startCountdown = React.useCallback((activationId: string, seconds: number) => {
    // Clear any existing interval for this activation
    if (countdownIntervals.current[activationId]) {
      clearInterval(countdownIntervals.current[activationId] as NodeJS.Timeout);
    }
    
    // Update the state for this specific activation
    setActiveNumbers(prev => prev.map(item => 
      item.activationId === activationId 
        ? { ...item, remainingSeconds: seconds } 
        : item
    ));
    
    // Set new interval
    countdownIntervals.current[activationId] = setInterval(() => {
      setActiveNumbers(prev => {
        const updatedNumbers = prev.map(item => {
          if (item.activationId === activationId) {
            const newValue = item.remainingSeconds - 1;
            
            if (newValue <= 0) {
              // Clear interval when reached zero
              if (countdownIntervals.current[activationId]) {
                clearInterval(countdownIntervals.current[activationId] as NodeJS.Timeout);
                countdownIntervals.current[activationId] = null;
              }
              
              // Set cancel available
              return { 
                ...item, 
                remainingSeconds: 0,
                cancelAvailable: true 
              };
            }
            
            return { ...item, remainingSeconds: newValue };
          }
          return item;
        });
        
        return updatedNumbers;
      });
    }, 1000);
  }, []);

  // Clean up all intervals on unmount
  useEffect(() => {
    return () => {
      // Clear all countdown intervals
      Object.keys(countdownIntervals.current).forEach(key => {
        if (countdownIntervals.current[key]) {
          clearInterval(countdownIntervals.current[key] as NodeJS.Timeout);
        }
      });
      
      // Clear all cancel timers
      Object.keys(cancelTimers.current).forEach(key => {
        if (cancelTimers.current[key]) {
          clearTimeout(cancelTimers.current[key] as NodeJS.Timeout);
        }
      });
      
      // Clear all polling intervals
      Object.keys(pollingIntervals.current).forEach(key => {
        if (pollingIntervals.current[key]) {
          clearInterval(pollingIntervals.current[key] as NodeJS.Timeout);
        }
      });
    };
  }, []);

  // Fetch user data and active numbers on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fetch balance
        console.log('Fetching user balance from API...');
        const balanceResponse = await fetch('/api/user/balance');
        if (!balanceResponse.ok) {
          if (balanceResponse.status === 401) {
            console.error('User not authenticated, redirecting to home');
            router.push('/');
            return;
          }
          const errorData = await balanceResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Balance fetch error:', balanceResponse.status, errorData);
          throw new Error(`Failed to fetch balance: ${errorData.error || balanceResponse.statusText}`);
        }
        const balanceData = await balanceResponse.json();
        
        // Use the actual balance from database 
        console.log('Retrieved balance:', balanceData.balance);
        setBalance(Number(balanceData.balance) || 0);
        
        // Show a warning toast if balance is low
        if (balanceData.balance < 10) {
          toast.warning("Your balance is low", {
            description: "Please recharge to continue using the service"
          });
        }
        
        // First, restore numbers from localStorage to ensure persistence between page navigations
        const savedNumbers = localStorage.getItem('activeNumbers');
        let restoredNumbers: ActiveNumber[] = [];
        
        if (savedNumbers) {
          try {
            const parsedNumbers = JSON.parse(savedNumbers);
            
            if (Array.isArray(parsedNumbers) && parsedNumbers.length > 0) {
              restoredNumbers = parsedNumbers.map((number: any) => {
                // Ensure activationTime is a Date object
                const activationTime = number.activationTime 
                  ? new Date(number.activationTime) 
                  : new Date();
                  
                // Recalculate cancel availability and remaining time
                const now = new Date();
                const elapsedMs = now.getTime() - activationTime.getTime();
                const twoMinutesMs = 2 * 60 * 1000;
                const cancelAvailable = elapsedMs >= twoMinutesMs;
                const remainingSecs = Math.max(0, Math.ceil((twoMinutesMs - elapsedMs) / 1000));
                
                // Important: preserve the poll count from localStorage
                return {
                  ...number,
                  activationTime,
                  cancelAvailable,
                  remainingSeconds: remainingSecs,
                  pollCount: number.pollCount || 0,
                  errorCount: number.errorCount || 0
                };
              });
              
              // Set active numbers from localStorage
              setActiveNumbers(restoredNumbers);
            }
          } catch (error) {
            console.error('Error parsing saved activation data:', error);
            // Don't clear localStorage yet, we'll try to fetch from API first
          }
        }
        
        // Now try to get active phone numbers from server to complement localStorage data
        const activeResponse = await fetch('/api/sms/active');
        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          
          // Support multiple active numbers (API needs to be updated to return array)
          const activations = Array.isArray(activeData.activations) 
            ? activeData.activations 
            : (activeData.activation ? [activeData.activation] : []);
            
          if (activations.length > 0) {
            // Create active number entries for each activation
            const numbersData = activations.map((activation: any) => {
              const activationTime = activation.created_at 
                ? new Date(activation.created_at) 
                : new Date();
                
              // Calculate if cancel is available and remaining seconds
              const now = new Date();
              const elapsedMs = now.getTime() - activationTime.getTime();
              const twoMinutesMs = 2 * 60 * 1000;
              const cancelAvailable = elapsedMs >= twoMinutesMs;
              const remainingSecs = Math.max(0, Math.ceil((twoMinutesMs - elapsedMs) / 1000));
              
              // Find if we have this activation in our restoredNumbers to preserve poll count
              const existingNumber = restoredNumbers.find(
                num => num.activationId === activation.activation_id
              );
              
              // Create the active number entry
              return {
                phoneNumber: activation.phone_number,
                activationId: activation.activation_id,
                service: activation.service,
                activationTime: activationTime,
                smsCode: activation.sms_code || '',
                isPolling: !activation.sms_code,
                // If we have this number in localStorage, preserve poll count
                pollCount: existingNumber ? existingNumber.pollCount : 0,
                smsStatus: 'waiting',
                cancelAvailable,
                remainingSeconds: remainingSecs,
                errorCount: existingNumber ? existingNumber.errorCount : 0
              };
            });
            
            // Set all active numbers
            setActiveNumbers(numbersData);
            
            // Store data in localStorage
            localStorage.setItem('activeNumbers', JSON.stringify(numbersData));
          } else if (restoredNumbers.length === 0) {
            // If no activations from API and nothing in localStorage, clear
            localStorage.removeItem('activeNumbers');
          }
        }
        
        // Start timers for all active numbers
        const numbersToProcess = activeNumbers.length > 0 ? activeNumbers : restoredNumbers;
        
        numbersToProcess.forEach((number: ActiveNumber) => {
          // If cancellation is not available yet and there are remaining seconds
          if (!number.cancelAvailable && number.remainingSeconds > 0) {
            startCountdown(number.activationId, number.remainingSeconds);
          }
          
          // If polling is needed (no SMS code yet)
          if (number.isPolling && !number.smsCode) {
            startPolling(number.activationId);
          }
        });
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast.error("Failed to load user data");
      }
    };

    checkAuth();
  }, [router, startCountdown]);

  // Function to check SMS code for a specific activation
  const checkSmsCode = useCallback(async (activationId: string) => {
    try {
      // Find the activation in state first to verify it exists
      const activationExists = activeNumbers.some(num => num.activationId === activationId);
      if (!activationExists) {
        console.warn(`Attempted to check SMS code for non-existent activation: ${activationId}`);
        return;
      }
      
      // Critical: Update poll count BEFORE the API call to ensure it's saved
      // even if the user navigates away immediately
      setActiveNumbers(prev => {
        const updatedNumbers = prev.map(item => {
          if (item.activationId === activationId) {
            return { ...item, pollCount: item.pollCount + 1 };
          }
          return item;
        });
        
        // Update localStorage with latest poll count IMMEDIATELY
        // This ensures the count is saved even if user navigates away during API call
        localStorage.setItem('activeNumbers', JSON.stringify(updatedNumbers));
        
        return updatedNumbers;
      });
      
      const response = await fetch(`/api/sms/check?id=${activationId}`);
      
      // If the request failed, increment error count
      if (!response.ok) {
        setActiveNumbers(prev => {
          const updatedNumbers = prev.map(item => {
            if (item.activationId === activationId) {
              const newErrorCount = item.errorCount + 1;
              
              // If too many consecutive errors, stop polling
              if (newErrorCount >= MAX_CONSECUTIVE_ERRORS) {
                console.error(`Too many errors (${newErrorCount}) checking SMS code for ${activationId}, stopping polling`);
                
                // Clear interval
                if (pollingIntervals.current[activationId]) {
                  clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
                  pollingIntervals.current[activationId] = null;
                }
                
                toast.error("SMS polling stopped due to errors", {
                  description: "Please refresh the page to restart polling"
                });
                
                return { 
                  ...item, 
                  errorCount: newErrorCount,
                  isPolling: false
                };
              }
              
              return { ...item, errorCount: newErrorCount };
            }
            return item;
          });
          
          // Update localStorage with latest error count
          localStorage.setItem('activeNumbers', JSON.stringify(updatedNumbers));
          
          return updatedNumbers;
        });
        
        // If 404, the activation might have been deleted on the server
        if (response.status === 404) {
          console.error(`Activation not found on server: ${activationId}`);
          
          // Clear interval
          if (pollingIntervals.current[activationId]) {
            clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
            pollingIntervals.current[activationId] = null;
          }
          
          toast.error("Activation not found", {
            description: "The number may have expired or been cancelled"
          });
        }
        
        return;
      }
      
      const data = await response.json();
      
      // Update active numbers with new data
      setActiveNumbers(prev => {
        const updatedNumbers = prev.map(item => {
          if (item.activationId === activationId) {
            const updatedItem = { 
              ...item,
              // Reset error count on successful response
              errorCount: 0,
              // Update status from response
              smsStatus: data.status || item.smsStatus
            };
            
            // If we received a code
            if (data.status === 'success' && data.code) {
              // Show a success toast with the code
              toast.success('SMS Code Received!', {
                description: `Code: ${data.code}`,
                duration: 5000
              });
              
              // Clear polling interval
              if (pollingIntervals.current[activationId]) {
                clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
                pollingIntervals.current[activationId] = null;
              }
              
              // Update state with code and stop polling
              return {
                ...updatedItem,
                smsCode: data.code,
                isPolling: false,
                smsStatus: 'success'
              };
            }
            
            // If the activation was cancelled, stop polling
            if (data.status === 'cancelled') {
              // Clear polling interval
              if (pollingIntervals.current[activationId]) {
                clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
                pollingIntervals.current[activationId] = null;
              }
              
              return {
                ...updatedItem,
                isPolling: false,
                smsStatus: 'cancelled'
              };
            }
            
            return updatedItem;
          }
          return item;
        });
        
        // Update localStorage with the latest state
        localStorage.setItem('activeNumbers', JSON.stringify(updatedNumbers));
        
        return updatedNumbers;
      });
      
    } catch (error) {
      console.error('Error checking SMS code:', error);
      
      // Update error count
      setActiveNumbers(prev => {
        const updatedNumbers = prev.map(item => {
          if (item.activationId === activationId) {
            const newErrorCount = item.errorCount + 1;
            
            // If too many consecutive errors, stop polling
            if (newErrorCount >= MAX_CONSECUTIVE_ERRORS) {
              console.error(`Too many errors (${newErrorCount}) checking SMS code for ${activationId}, stopping polling`);
              
              // Clear interval
              if (pollingIntervals.current[activationId]) {
                clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
                pollingIntervals.current[activationId] = null;
              }
              
              return { 
                ...item, 
                errorCount: newErrorCount,
                isPolling: false
              };
            }
            
            return { ...item, errorCount: newErrorCount };
          }
          return item;
        });
        
        // Update localStorage with latest error count
        localStorage.setItem('activeNumbers', JSON.stringify(updatedNumbers));
        
        return updatedNumbers;
      });
    }
  }, [activeNumbers]);

  // Store the checkSmsCode function in a ref to avoid dependency cycles
  const checkSmsCodeRef = React.useRef(checkSmsCode);
  useEffect(() => {
    checkSmsCodeRef.current = checkSmsCode;
  }, [checkSmsCode]);

  // Function to start polling for a specific activation
  const startPolling = useCallback((activationId: string) => {
    // Clear any existing interval
    if (pollingIntervals.current[activationId]) {
      clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
      pollingIntervals.current[activationId] = null;
    }
    
    // Set the activation to polling state but preserve all existing state
    setActiveNumbers(prev => {
      const updatedNumbers = prev.map(item => {
        if (item.activationId === activationId) {
          return { 
            ...item, 
            isPolling: true,
            // If we're restarting polling and had errors before, reset them
            errorCount: 0,
            // Keep existing poll count
            pollCount: item.pollCount || 0
          };
        }
        return item;
      });
      
      // Store updated state in localStorage
      localStorage.setItem('activeNumbers', JSON.stringify(updatedNumbers));
      
      return updatedNumbers;
    });
    
    // Initial check - use a slight delay to avoid immediate call that might fail
    setTimeout(() => {
      checkSmsCodeRef.current(activationId);
    }, 200);
    
    // Set up interval for subsequent checks
    pollingIntervals.current[activationId] = setInterval(() => {
      checkSmsCodeRef.current(activationId);
    }, POLLING_INTERVAL);
  }, []);

  // Now place the restoration effect after all function declarations
  // Function to restore polling when component mounts or page is revisited
  useEffect(() => {
    // Restore active numbers from localStorage when component mounts
    const savedNumbers = localStorage.getItem('activeNumbers');
    if (savedNumbers) {
      try {
        const parsedNumbers = JSON.parse(savedNumbers);
        if (Array.isArray(parsedNumbers) && parsedNumbers.length > 0) {
          // Convert activation time strings back to Date objects
          const processedNumbers = parsedNumbers.map(number => ({
            ...number,
            activationTime: number.activationTime ? new Date(number.activationTime) : null
          }));
          
          // Update the active numbers state
          setActiveNumbers(processedNumbers);
          
          // Restart polling for any numbers that should be polling
          processedNumbers.forEach(number => {
            if (number.isPolling && !number.smsCode) {
              // If this number should be polling, start it
              startPolling(number.activationId);
            }
            
            // If cancellation is not available yet, restart countdown
            if (!number.cancelAvailable && number.remainingSeconds > 0) {
              startCountdown(number.activationId, number.remainingSeconds);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing saved active numbers:', error);
      }
    }
    
    // Cleanup polling intervals when unmounting
    return () => {
      Object.keys(pollingIntervals.current).forEach(key => {
        if (pollingIntervals.current[key]) {
          clearInterval(pollingIntervals.current[key] as NodeJS.Timeout);
          pollingIntervals.current[key] = null;
        }
      });
    };
  }, [startPolling, startCountdown]);

  // Function to get a new phone number
  const getPhoneNumber = async () => {
    if (!selectedService) {
      setError("Please select a service first");
      toast.error("Please select a service first");
      return;
    }

    // Get selected service price
    const selectedServicePrice = serviceOptions.find(option => option.value === selectedService)?.price || 0;
    
    // Check if user has enough balance
    if (balance < selectedServicePrice) {
      setError(`Contact support. You need ₹${selectedServicePrice} but have ₹${balance}.`);
      toast.error("Insufficient balance", {
        description: `This service costs ₹${selectedServicePrice}. Please recharge your account.`
      });
      return;
    }

    // Reset error state
    setError("");
    setLoading(true);
    
    try {
      // Show pending toast to indicate request is being processed
      const pendingToast = toast.loading("Requesting phone number...");
      
      const response = await fetch(`/api/sms?service=${selectedService}`);
      const data = await response.json();
      
      // Dismiss the pending toast
      toast.dismiss(pendingToast);
      
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }
      
      // Create activation time
      const now = new Date();
      
      // Create new activation object
      const newNumber = {
        phoneNumber: data.phoneNumber,
        activationId: data.activationId,
        service: selectedService,
        activationTime: now,
        smsCode: '',
        isPolling: true,
        pollCount: 0,
        smsStatus: 'waiting',
        cancelAvailable: false,
        remainingSeconds: 120,
        errorCount: 0
      };
      
      // Add to state
      setActiveNumbers(prev => [newNumber, ...prev]);
      
      // Start countdown and polling
      startCountdown(data.activationId, 120);
      startPolling(data.activationId);
      
      // Update localStorage
      localStorage.setItem('activeNumbers', JSON.stringify([newNumber, ...activeNumbers]));
      
      // Update balance
      setBalance(prevBalance => prevBalance - selectedServicePrice);
      
      // Show success toast with more detailed information
      toast.success(`Phone number received`, {
        description: `Number: ${data.phoneNumber} for ${serviceOptions.find((option) => option.value === selectedService)?.label?.toString() || 'service'}`
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get a number. Please try again.');
      toast.error('Failed to get a number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel a specific activation
  const cancelActivation = async (activationId: string) => {
    // Find the activation
    const activation = activeNumbers.find(num => num.activationId === activationId);
    if (!activation) {
      toast.error("No activation found to cancel");
      return;
    }

    // Check if 2 minutes have passed
    if (activation.activationTime) {
      const now = new Date();
      const elapsedTimeMs = now.getTime() - activation.activationTime.getTime();
      const twoMinutesMs = 2 * 60 * 1000;
      
      if (elapsedTimeMs < twoMinutesMs) {
        const remainingSeconds = Math.ceil((twoMinutesMs - elapsedTimeMs) / 1000);
        toast.error(`Early cancellation denied`, {
          description: `You can cancel after 2 minutes (${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} remaining)`
        });
        return;
      }
    }

    // Stop polling
    if (pollingIntervals.current[activationId]) {
      clearInterval(pollingIntervals.current[activationId] as NodeJS.Timeout);
      pollingIntervals.current[activationId] = null;
    }
    
    // Mark as cancelling in UI
    setActiveNumbers(prev => prev.map(item => {
      if (item.activationId === activationId) {
        return { ...item, isPolling: false, smsStatus: 'cancelling' };
      }
      return item;
    }));
    
    // Show cancellation in progress toast
    const cancelToast = toast.loading("Cancelling phone number...");
    
    try {
      const response = await fetch('/api/sms/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activationId }),
      });
      
      const data = await response.json();
      
      // Dismiss the loading toast
      toast.dismiss(cancelToast);
      
      if (data.error) {
        // Handle EARLY_CANCEL_DENIED error
        if (data.error.includes("EARLY_CANCEL_DENIED") || data.error.toLowerCase().includes("early cancel")) {
          toast.error("Early cancellation denied", {
            description: "You can cancel this number after 2 minutes"
          });
          
          // Resume polling
          setActiveNumbers(prev => prev.map(item => {
            if (item.activationId === activationId) {
              return { ...item, isPolling: true, smsStatus: 'waiting' };
            }
            return item;
          }));
          
          startPolling(activationId);
          return;
        }
        
        toast.error(data.error);
        return;
      }
      
      // Remove from state on success
      setActiveNumbers(prev => prev.filter(item => item.activationId !== activationId));
      
      // Clear timers
      if (countdownIntervals.current[activationId]) {
        clearInterval(countdownIntervals.current[activationId] as NodeJS.Timeout);
        delete countdownIntervals.current[activationId];
      }
      
      // Update localStorage
      localStorage.setItem('activeNumbers', JSON.stringify(
        activeNumbers.filter(item => item.activationId !== activationId)
      ));
      
      // Show success message with refund information
      if (data.refundAmount) {
        toast.success(`Number cancelled successfully`, {
          description: `₹${data.refundAmount} has been refunded to your balance.`,
          duration: 5000
        });
        
        // Update balance with refund
        if (data.newBalance) {
          setBalance(data.newBalance);
        }
      } else {
        toast.success(`Number cancelled successfully`);
      }
      
    } catch (error) {
      // Dismiss the loading toast
      toast.dismiss(cancelToast);
      
      console.error('Error cancelling number:', error);
      toast.error("Failed to cancel number", {
        description: "Please try again or contact support if the issue persists."
      });
      
      // Restore the status in UI
      setActiveNumbers(prev => prev.map(item => {
        if (item.activationId === activationId) {
          return { ...item, isPolling: true, smsStatus: 'waiting' };
        }
        return item;
      }));
    }
  };

  // Get active numbers count
  const activeNumbersCount = activeNumbers.length;
  
  // Calculate total cost of active numbers
  const totalActiveCost = activeNumbers.reduce((sum, num) => {
    const price = serviceOptions.find(option => option.value === num.service)?.price || 0;
    return sum + price;
  }, 0);

  // Handle copy functionality
  const handleCopy = (text: string, type: string, activationId: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy text");
      });
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 mt-4 sm:mt-10 max-w-xl">
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-xl font-bold">Get a Virtual Phone Number</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => router.push('/history')}
            className="flex items-center gap-1 text-xs sm:text-sm self-end sm:self-auto"
          >
            <PhoneIcon className="h-3.5 w-3.5" />
            View History
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
          <p className="text-sm sm:text-base">Your Balance: <span className="font-medium">{balance} ₹</span></p>
          
          {activeNumbersCount > 0 && (
            <div className="text-xs sm:text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md mt-1 sm:mt-0">
              <span className="font-medium">{activeNumbersCount}</span> active number{activeNumbersCount !== 1 ? 's' : ''} 
              {totalActiveCost > 0 && <span> (₹{totalActiveCost} total)</span>}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="w-full">
            <label htmlFor="service-select" className="block text-sm font-medium mb-1 sm:mb-2">
              Select Service
            </label>
            
            {/* Desktop dropdown */}
            <div className="hidden sm:block">
              <Combobox 
                options={serviceOptions}
                value={selectedService}
                onValueChange={setSelectedService}
                placeholder="Select service"
                className="w-full"
                id="service-select"
              />
            </div>
            
            {/* Mobile-friendly service selection grid */}
            <div className="grid grid-cols-2 sm:hidden gap-2 mt-1">
              {serviceOptions.map((service) => (
                <div 
                  key={service.value} 
                  className={`cursor-pointer border rounded-md p-2 transition-all ${
                    selectedService === service.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedService(service.value)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {service.icon}
                    <span className="font-medium text-sm">{service.displayName}</span>
                  </div>
                  <div className="text-green-600 font-medium text-sm">₹{service.price}</div>
                </div>
              ))}
            </div>
            
            {selectedService && (
              <div className="mt-2 text-sm">
                <span>Selected service price: </span>
                <span className="font-medium text-green-600">
                  ₹{serviceOptions.find(option => option.value === selectedService)?.price || 0}
                </span>
              </div>
            )}
          </div>
          
          <div className="w-full">
            <Button 
              className="w-full py-2 sm:py-4 text-sm sm:text-base"
              onClick={getPhoneNumber}
              disabled={loading || !selectedService}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner variant="circle" className="h-4 w-4" />
                  Loading...
                </span>
              ) : (
                activeNumbersCount > 0 ? "Get Another Number" : "Get Number"
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Show warning if attempting to get too many numbers */}
        {activeNumbersCount >= 5 && (
          <div className="mt-3 p-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span>You have many active numbers. Consider cancelling some to save your balance.</span>
            </div>
          </div>
        )}
        
        {/* Active Numbers List */}
        {activeNumbersCount > 0 && (
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm sm:text-base">Active Numbers</h3>
              
              {activeNumbersCount > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // Show confirmation dialog
                    if (confirm("Are you sure you want to cancel all active numbers? This cannot be undone.")) {
                      // Cancel all numbers that are eligible (have cancel available)
                      const eligibleForCancel = activeNumbers.filter(num => num.cancelAvailable);
                      
                      if (eligibleForCancel.length === 0) {
                        toast.error("No numbers are eligible for cancellation yet");
                        return;
                      }
                      
                      // Cancel each eligible number
                      eligibleForCancel.forEach(num => {
                        cancelActivation(num.activationId);
                      });
                    }
                  }}
                >
                  Cancel All Eligible
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {activeNumbers.map((number: ActiveNumber) => (
                <PhoneNumberCard
                  key={number.activationId}
                  phoneNumber={number.phoneNumber}
                  activationId={number.activationId}
                  service={number.service}
                  activationTime={number.activationTime}
                  smsCode={number.smsCode}
                  isPolling={number.isPolling}
                  pollCount={number.pollCount}
                  smsStatus={number.smsStatus}
                  cancelAvailable={number.cancelAvailable}
                  remainingSeconds={number.remainingSeconds}
                  onCancel={() => cancelActivation(number.activationId)}
                  onCopy={(text, type) => handleCopy(text, type, number.activationId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Hide Clerk components on mobile with CSS */}
      <style jsx global>{`
        @media (max-width: 640px) {
          #clerk-components {
            display: none !important;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }
        
        .shimmer-bg {
          animation-duration: 2s;
          animation-fill-mode: forwards;
          animation-iteration-count: infinite;
          animation-name: shimmer;
          animation-timing-function: linear;
          background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
          background-size: 800px 104px;
        }
      `}</style>
    </div>
  );
}