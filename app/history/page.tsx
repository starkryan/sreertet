"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Copy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'

interface HistoryItem {
  id: string
  service: string
  phone_number: string
  activation_id: string
  sms_code: string | null
  status: string
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copyStatus, setCopyStatus] = useState<{[key: string]: "idle" | "copied"}>({})
  
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/sms/history')
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/')
            return
          }
          throw new Error('Failed to fetch history')
        }
        
        const data = await response.json()
        setHistory(data.history || [])
      } catch (err) {
        console.error('Error fetching history:', err)
        setError('Failed to load history. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [router])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyStatus(prev => ({ ...prev, [id]: "copied" }))
        setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [id]: "idle" }))
        }, 2000)
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
      })
  }

  const renderServiceName = (serviceCode: string) => {
    const serviceMap: {[key: string]: string} = {
      'go': 'Google',
      'tg': 'Telegram',
      'wa': 'WhatsApp',
      'ig': 'Instagram',
      'jx': 'Swiggy',
      'am': 'Amazon',
      'wmh': 'Winmatch',
      'sn': 'OLX',
      'zpt': 'Zepto'
    }
    
    return serviceMap[serviceCode] || serviceCode
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 mt-4 sm:mt-10 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Number History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No phone number history found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="border rounded-lg p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{renderServiceName(item.service)}</h3>
                    <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.sms_code ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.sms_code ? 'OTP Received' : 'No OTP'}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Phone Number:</div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold break-all">{item.phone_number}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCopy(item.phone_number, `phone-${item.id}`)}
                        className={`ml-2 h-8 px-2 transition-colors ${
                          copyStatus[`phone-${item.id}`] === "copied" ? "border-green-500 text-green-600 bg-green-50" : ""
                        }`}
                      >
                        {copyStatus[`phone-${item.id}`] === "copied" ? (
                          <span className="flex items-center text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </span>
                        ) : (
                          <span className="flex items-center text-xs">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {item.sms_code && (
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">OTP Code:</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.sms_code}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopy(item.sms_code || '', `code-${item.id}`)}
                          className={`ml-2 h-8 px-2 transition-colors ${
                            copyStatus[`code-${item.id}`] === "copied" ? "border-green-500 text-green-600 bg-green-50" : ""
                          }`}
                        >
                          {copyStatus[`code-${item.id}`] === "copied" ? (
                            <span className="flex items-center text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </span>
                          ) : (
                            <span className="flex items-center text-xs">
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-gray-500 break-all">
                  <span>Activation ID: {item.activation_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 