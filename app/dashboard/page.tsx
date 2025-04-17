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
    )
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
    )
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
    )
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
    )
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
    )
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
    )
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
    )
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
    )
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
    )
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
    )
  }
];

// Polling interval in milliseconds
const POLLING_INTERVAL = 3000; // 3 seconds

// Maximum consecutive errors before stopping polling
const MAX_CONSECUTIVE_ERRORS = 5;

export default function DashboardPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activationId, setActivationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [balance, setBalance] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [copyCodeStatus, setCopyCodeStatus] = useState<"idle" | "copied">("idle");
  
  // SMS code and status state
  const [smsCode, setSmsCode] = useState("");
  const [smsStatus, setSmsStatus] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [codeReceived, setCodeReceived] = useState(false);

  // Error handling state
  const [errorCount, setErrorCount] = useState(0);
  
  // Activation time tracking
  const [activationTime, setActivationTime] = useState<Date | null>(null);
  const [cancelAvailable, setCancelAvailable] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120); // 2 minutes in seconds
  
  // Reference to store the countdown interval
  const countdownInterval = React.useRef<NodeJS.Timeout | null>(null);
  const cancelTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Function to start the countdown timer
  const startCountdown = React.useCallback((seconds: number) => {
    // Clear any existing interval first
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
    
    // Set initial remaining time
    setRemainingSeconds(seconds);
    
    // Start new interval
    countdownInterval.current = setInterval(() => {
      setRemainingSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          // Clear interval when reached zero
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  }, []);

  // Clear the countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
      if (cancelTimer.current) {
        clearTimeout(cancelTimer.current);
      }
    };
  }, []);

  // Fetch user data on component mount
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
        
        // Check for active phone numbers from server
        const activeResponse = await fetch('/api/sms/active');
        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          if (activeData.success && activeData.activation) {
            // Set the active phone number
            setPhoneNumber(activeData.activation.phone_number);
            setActivationId(activeData.activation.activation_id);
            setSelectedService(activeData.activation.service);
            setShowResult(true);
            
            // Store activation data in localStorage
            const activationData = {
              phone_number: activeData.activation.phone_number,
              activation_id: activeData.activation.activation_id,
              service: activeData.activation.service,
              activation_time: activeData.activation.created_at || new Date().toISOString(),
              sms_code: activeData.activation.sms_code || ''
            };
            localStorage.setItem('activationData', JSON.stringify(activationData));
            
            // If there's a code, display it
            if (activeData.activation.sms_code) {
              setSmsCode(activeData.activation.sms_code);
              setCodeReceived(true);
            } else {
              // Start polling for SMS code
              setIsPolling(true);
              toast.info("Waiting for SMS code", { 
                description: "We'll notify you when it arrives" 
              });
            }
            
            // Set activation time based on server data or fall back to now
            const serverTime = activeData.activation.created_at ? new Date(activeData.activation.created_at) : new Date();
            setActivationTime(serverTime);
            
            // Calculate if cancel is available based on elapsed time
            const now = new Date();
            const elapsedMs = now.getTime() - serverTime.getTime();
            const twoMinutesMs = 2 * 60 * 1000;
            
            if (elapsedMs >= twoMinutesMs) {
              setCancelAvailable(true);
            } else {
              // Calculate remaining seconds and start countdown
              const remainingSecs = Math.max(0, Math.ceil((twoMinutesMs - elapsedMs) / 1000));
              startCountdown(remainingSecs);
            }
          } else {
            // Check localStorage for any saved activation
            const savedActivation = localStorage.getItem('activationData');
            if (savedActivation) {
              try {
                const activationData = JSON.parse(savedActivation);
                setPhoneNumber(activationData.phone_number);
                setActivationId(activationData.activation_id);
                setSelectedService(activationData.service);
                setShowResult(true);
                
                if (activationData.sms_code) {
                  setSmsCode(activationData.sms_code);
                  setCodeReceived(true);
                } else {
                  // Start polling for SMS code
                  setIsPolling(true);
                }
                
                // Set activation time from saved data
                const savedTime = new Date(activationData.activation_time);
                setActivationTime(savedTime);
                
                // Calculate if cancel is available based on elapsed time
                const now = new Date();
                const elapsedMs = now.getTime() - savedTime.getTime();
                const twoMinutesMs = 2 * 60 * 1000;
                
                if (elapsedMs >= twoMinutesMs) {
                  setCancelAvailable(true);
                } else {
                  // Calculate remaining seconds and start countdown
                  const remainingSecs = Math.max(0, Math.ceil((twoMinutesMs - elapsedMs) / 1000));
                  startCountdown(remainingSecs);
                }
              } catch (error) {
                console.error('Error parsing saved activation data:', error);
                localStorage.removeItem('activationData');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast.error("Failed to load user data");
      }
    };

    checkAuth();
  }, [router, startCountdown]);

  // Function to check for SMS code
  const checkSmsCode = useCallback(async () => {
    if (!activationId) return;
    
    try {
      const response = await fetch(`/api/sms/check?id=${activationId}`);
      
      // Handle HTTP errors
      if (!response.ok) {
        // Increment error count but don't stop polling immediately
        setErrorCount(prev => prev + 1);
        
        // If we've had too many consecutive errors, stop polling
        if (errorCount >= MAX_CONSECUTIVE_ERRORS) {
          console.error(`Stopping SMS polling after ${MAX_CONSECUTIVE_ERRORS} consecutive errors`);
          setIsPolling(false);
          setError(`Failed to check for SMS after ${MAX_CONSECUTIVE_ERRORS} attempts. Please try again.`);
          toast.error(`Failed to check for SMS. Please try again.`);
          return;
        }
        
        // For 404 errors (activation not found), stop polling immediately
        if (response.status === 404) {
          setIsPolling(false);
          setError("The number activation was not found. It may have expired.");
          toast.error("Number activation not found. It may have expired.");
          return;
        }
        
        // For other errors, continue polling
        console.warn(`Error checking SMS (attempt ${errorCount + 1}/${MAX_CONSECUTIVE_ERRORS})`);
        return;
      }
      
      // Reset error count on successful request
      setErrorCount(0);
      
      const data = await response.json();
      
      // Update status
      setSmsStatus(data.status);
      
      // If we received a code, stop polling and display it
      if (data.status === 'success' && data.code) {
        setSmsCode(data.code);
        setIsPolling(false);
        setCodeReceived(true);
        
        // Update SMS code in localStorage
        const savedActivation = localStorage.getItem('activationData');
        if (savedActivation) {
          try {
            const activationData = JSON.parse(savedActivation);
            activationData.sms_code = data.code;
            localStorage.setItem('activationData', JSON.stringify(activationData));
          } catch (error) {
            console.error('Error updating SMS code in localStorage:', error);
          }
        }
        
        toast.success("SMS code received!", {
          description: "Your verification code has arrived"
        });
      }
      
      // If the activation was cancelled, stop polling
      if (data.status === 'cancelled') {
        setIsPolling(false);
      }
      
      // Increment poll count to show progress to user
      setPollCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Error checking SMS code:', error);
      // Increment error count but don't stop polling immediately
      setErrorCount(prev => prev + 1);
    }
  }, [activationId, errorCount]);

  // Set up polling effect
  useEffect(() => {
    let pollingTimer: NodeJS.Timeout | null = null;
    
    if (isPolling && activationId) {
      // Initial check immediately
      checkSmsCode();
      
      // Set up interval for subsequent checks
      pollingTimer = setInterval(checkSmsCode, POLLING_INTERVAL);
    }
    
    // Clean up function to clear the interval when component unmounts
    // or when polling is stopped
    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }, [isPolling, activationId, checkSmsCode]);

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

    // Reset states
    setError("");
    setSmsCode("");
    setSmsStatus("");
    setPollCount(0);
    setErrorCount(0);
    setCodeReceived(false);
    setCancelAvailable(false);
    
    // Clear any existing timers before starting new ones
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (cancelTimer.current) {
      clearTimeout(cancelTimer.current);
      cancelTimer.current = null;
    }
    
    // Reset remaining seconds to full duration
    setRemainingSeconds(120);
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/sms?service=${selectedService}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }
      
      // Display the number and save activation ID
      setPhoneNumber(data.phoneNumber);
      setActivationId(data.activationId);
      setShowResult(true);
      
      // Set activation time to current time and start the countdown
      const now = new Date();
      setActivationTime(now);
      
      // Start countdown for 2 minutes (120 seconds)
      startCountdown(120);
      
      // Store in localStorage
      const activationData = {
        phone_number: data.phoneNumber,
        activation_id: data.activationId,
        service: selectedService,
        activation_time: now.toISOString(),
        sms_code: ''
      };
      localStorage.setItem('activationData', JSON.stringify(activationData));
      
      // Update balance immediately to reflect the purchase
      setBalance(prevBalance => prevBalance - selectedServicePrice);
      
      // Start polling for SMS code
      setIsPolling(true);
      
      // Show success toast
      toast.success("Phone number obtained successfully");
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get a number. Please try again.');
      toast.error('Failed to get a number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelActivation = async () => {
    if (!activationId) {
      setError("No active number to cancel");
      toast.error("No active number to cancel");
      return;
    }

    // Check if 2 minutes have passed since activation
    if (activationTime) {
      const now = new Date();
      const elapsedTimeMs = now.getTime() - activationTime.getTime();
      const twoMinutesMs = 2 * 60 * 1000;
      
      if (elapsedTimeMs < twoMinutesMs) {
        const remainingSeconds = Math.ceil((twoMinutesMs - elapsedTimeMs) / 1000);
        setError(`Early cancellation denied. Please wait ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} to cancel.`);
        toast.error(`Early cancellation denied`, {
          description: `You can cancel after 2 minutes (${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} remaining)`
        });
        return;
      }
    }

    // Stop polling when cancelling
    setIsPolling(false);
    setCancelLoading(true);
    
    try {
      const response = await fetch('/api/sms/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activationId }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        // Handle EARLY_CANCEL_DENIED error specifically
        if (data.error.includes("EARLY_CANCEL_DENIED") || data.error.toLowerCase().includes("early cancel")) {
          setError("Early cancellation denied. You can cancel after 2 minutes.");
          toast.error("Early cancellation denied", {
            description: "You can cancel this number after 2 minutes"
          });
          setIsPolling(true); // Resume polling
          setCancelLoading(false);
          return;
        }
        
        setError(data.error);
        toast.error(data.error);
        return;
      }
      
      // Reset state after successful cancellation
      setShowResult(false);
      setPhoneNumber("");
      setActivationId("");
      setSmsCode("");
      setSmsStatus("");
      setPollCount(0);
      setCodeReceived(false);
      setActivationTime(null);
      setCancelAvailable(false);
      
      // Clear any existing timers
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      if (cancelTimer.current) {
        clearTimeout(cancelTimer.current);
        cancelTimer.current = null;
      }
      
      // Reset remaining seconds
      setRemainingSeconds(120);
      
      // Clear localStorage
      localStorage.removeItem('activationData');
      
      // Show success toast
      toast.success("Phone number cancelled successfully");
      
      // Refetch balance as it might have changed
      try {
        const balanceResponse = await fetch('/api/user/balance');
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData.balance);
        }
      } catch (err) {
        console.error('Error refreshing balance:', err);
      }
      
    } catch (error) {
      console.error('Error cancelling activation:', error);
      setError('Failed to cancel. Please try again.');
      toast.error('Failed to cancel. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCopy = (text: string, setCopyStateFunc: React.Dispatch<React.SetStateAction<"idle" | "copied">>) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyStateFunc("copied");
        setTimeout(() => {
          setCopyStateFunc("idle");
        }, 2000);
        toast.success("Copied to clipboard");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy text");
      });
  };

  // Render OTP input with SMS code
  const renderOtpInput = () => {
    if (!smsCode) return null;

    // Determine max length based on SMS code length
    const codeLength = smsCode.length;
    
    // Determine optimal grouping based on code length
    let groups = [];
    
    if (codeLength <= 3) {
      // For 1-3 digits, just one group
      groups = [codeLength];
    } else if (codeLength <= 6) {
      // For 4-6 digits, split into two groups
      const firstGroupSize = Math.ceil(codeLength / 2);
      groups = [firstGroupSize, codeLength - firstGroupSize];
    } else {
      // For 7+ digits (including 8), use three groups
      // For 8 digits, do 3-2-3 grouping
      if (codeLength === 8) {
        groups = [3, 2, 3];
      } else {
        // For other lengths, divide evenly into 3 groups
        const groupSize = Math.floor(codeLength / 3);
        const remainder = codeLength % 3;
        
        groups = [groupSize, groupSize, groupSize];
        
        // Distribute remainder
        if (remainder === 1) {
          groups[1] += 1; // Add to middle group
        } else if (remainder === 2) {
          groups[0] += 1; // Add to first and last group
          groups[2] += 1;
        }
      }
    }

    return (
      <div className="mt-2 sm:mt-4">
        <div className={`p-3 sm:p-5 rounded-md border-2 ${codeReceived ? 'bg-green-100 border-green-400 shadow-md animate-pulse' : ''}`}>
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="rounded-full bg-green-500 p-1">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <h4 className="font-semibold text-green-800 ml-2 text-sm sm:text-base">Verification Code Received</h4>
          </div>
          
          <div className="flex flex-col gap-3">
            <InputOTP 
              value={smsCode} 
              maxLength={codeLength} 
              disabled
              containerClassName="justify-center flex-wrap gap-x-1 gap-y-2 sm:gap-x-2 sm:gap-y-3"
            >
              {groups.map((groupSize, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  {groupIndex > 0 && (
                    <InputOTPSeparator className="text-green-500 mx-0.5 sm:mx-1 font-bold" />
                  )}
                  <InputOTPGroup>
                    {[...Array(groupSize)].map((_, i) => {
                      const index = groups.slice(0, groupIndex).reduce((sum, size) => sum + size, 0) + i;
                      return (
                        <InputOTPSlot 
                          key={index} 
                          index={index} 
                          className={`bg-white border-2 border-green-400 text-green-700 font-bold 
                          h-7 w-7 sm:h-9 md:h-10 sm:w-9 md:w-10 text-xs sm:text-sm md:text-base shadow-sm
                          ${codeReceived ? 'ring-green-500/50 ring-1 sm:ring-2' : ''}`}
                        />
                      );
                    })}
                  </InputOTPGroup>
                </React.Fragment>
              ))}
            </InputOTP>
            
            <div className="flex justify-center mt-2 sm:mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(smsCode, setCopyCodeStatus)}
                className={`bg-green-50 text-green-700 border-2 border-green-400 hover:bg-green-100 
                hover:text-green-800 font-medium px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors
                ${copyCodeStatus === "copied" ? "bg-green-200" : ""}`}
              >
                {copyCodeStatus === "copied" ? (
                  <span className="flex items-center">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Copied
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Copy Code
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render function for SMS status indicator
  const renderSmsStatus = () => {
    if (!isPolling && !smsCode) return null;
    
    if (smsCode) {
      return renderOtpInput();
    }
    
    return (
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-md text-xs sm:text-sm">
        <div className="flex items-center">
          <div className="animate-spin mr-2 h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Waiting for SMS code... ({pollCount} checks)</span>
        </div>
        <div className="mt-1 sm:mt-2 text-xs">
          {errorCount > 0 && (
            <div className="text-orange-500 font-medium mb-1">
              Network issues detected. Retrying... ({errorCount}/{MAX_CONSECUTIVE_ERRORS})
            </div>
          )}
          {smsStatus === 'waiting' && "The system is waiting for a code to be sent to this number."}
          {smsStatus === 'retry' && "The last code wasn't accepted. Waiting for a new one."}
          {smsStatus === 'resend' && "The system is waiting for the code to be resent."}
        </div>
      </div>
    );
  };

  // Set up activation timer when activationTime changes
  useEffect(() => {
    if (activationTime && !cancelAvailable) {
      const now = new Date();
      const elapsedTimeMs = now.getTime() - activationTime.getTime();
      const twoMinutesMs = 2 * 60 * 1000;
      
      if (elapsedTimeMs >= twoMinutesMs) {
        setCancelAvailable(true);
        setRemainingSeconds(0);
      } else {
        // Calculate initial remaining seconds
        const initialRemainingSeconds = Math.ceil((twoMinutesMs - elapsedTimeMs) / 1000);
        
        // Start the countdown
        startCountdown(initialRemainingSeconds);
        
        // Set a timer to enable cancel button after remaining time
        if (cancelTimer.current) {
          clearTimeout(cancelTimer.current);
        }
        cancelTimer.current = setTimeout(() => {
          setCancelAvailable(true);
          setRemainingSeconds(0);
          toast.info("Cancellation is now available for this number");
          
          // Clear the countdown interval
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
        }, twoMinutesMs - elapsedTimeMs);
      }
    }
    
    return () => {
      // Clean up timers when activationTime changes
      if (cancelTimer.current) {
        clearTimeout(cancelTimer.current);
      }
    };
  }, [activationTime, cancelAvailable, startCountdown]);

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
        <p className="mb-3 sm:mb-4 text-sm sm:text-base">Your Balance: <span className="font-medium">{balance} ₹</span></p>
        
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="w-full">
            <label htmlFor="service-select" className="block text-sm font-medium mb-1 sm:mb-2">
              Select Service
            </label>
            <Combobox 
              options={serviceOptions}
              value={selectedService}
              onValueChange={setSelectedService}
              placeholder="Select service"
              className="w-full"
              id="service-select"
            />
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
              disabled={loading || isPolling}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner variant="circle" className="h-4 w-4" />
                  Loading...
                </span>
              ) : showResult ? "Get Another Number" : "Get Number"}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        
        {showResult && (
          <div className="mt-4 sm:mt-5">
            <div className="p-3 sm:p-4 border rounded-md">
              <h3 className="font-medium mb-2 text-sm sm:text-base">Virtual Phone Number:</h3>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-base sm:text-lg font-bold break-all">{phoneNumber}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopy(phoneNumber, setCopyStatus)}
                  className={`whitespace-nowrap transition-colors ${copyStatus === "copied" ? "border-green-500 text-green-600 bg-green-50" : ""}`}
                >
                  {copyStatus === "copied" ? (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </span>
                  )}
                </Button>
              </div>
              <div className="mt-1 text-xs text-gray-500 break-all">
                <span>Activation ID: {activationId}</span>
              </div>
              
              {renderSmsStatus()}
              
              {/* Add timer display when cancellation is not available */}
              {!cancelAvailable && showResult && !codeReceived && remainingSeconds > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-700">Cancellation available in:</span>
                    <span className="font-mono font-bold text-sm text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                      {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000 ease-linear" 
                      style={{ width: `${(remainingSeconds / 120) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:justify-between mt-4 gap-2">
                {/* Add Repeat button when SMS code is received */}
                {codeReceived && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      // Store current service for reuse
                      const currentService = selectedService;
                      // Reset states
                      setShowResult(false);
                      setPhoneNumber("");
                      setActivationId("");
                      setSmsCode("");
                      setSmsStatus("");
                      setPollCount(0);
                      setCodeReceived(false);
                      setIsPolling(false);
                      setActivationTime(null);
                      setCancelAvailable(false);
                      
                      // Clear any existing timers
                      if (countdownInterval.current) {
                        clearInterval(countdownInterval.current);
                        countdownInterval.current = null;
                      }
                      if (cancelTimer.current) {
                        clearTimeout(cancelTimer.current);
                        cancelTimer.current = null;
                      }
                      
                      // Reset remaining seconds
                      setRemainingSeconds(120);
                      
                      // Clear localStorage to reset persistent state
                      localStorage.removeItem('activationData');
                      
                      // Keep the same service selected
                      setSelectedService(currentService);
                      // Small delay to avoid button flash
                      setTimeout(() => {
                        getPhoneNumber();
                      }, 100);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                  >
                    Get Another Number
                  </Button>
                )}
                
                <div className={`${codeReceived ? "sm:ml-auto" : ""} w-full sm:w-auto`}>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={cancelActivation}
                    disabled={cancelLoading || codeReceived || !cancelAvailable}
                    className={`w-full sm:w-auto ${codeReceived ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={codeReceived ? "Cancel not available after SMS is received" : !cancelAvailable ? `You can cancel after 2 minutes (${remainingSeconds}s remaining)` : "Cancel this number"}
                  >
                    {cancelLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner variant="circle" className="h-4 w-4" />
                        Cancelling...
                      </span>
                    ) : !cancelAvailable ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">⏱️</span> 
                        {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    ) : "Cancel Number"}
                  </Button>
                </div>
              </div>
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
      `}</style>
    </div>
  );
}