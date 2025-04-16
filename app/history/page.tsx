"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Copy, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
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

interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [copyStatus, setCopyStatus] = useState<{[key: string]: "idle" | "copied"}>({})
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  })
  
  const fetchHistory = useCallback(async (page: number, resetHistory = false) => {
    if (resetHistory) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      const response = await fetch(`/api/sms/history?page=${page}&pageSize=${pagination.pageSize}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch history')
      }
      
      const data = await response.json()
      
      if (resetHistory) {
        setHistory(data.history || [])
      } else {
        setHistory(prev => [...prev, ...(data.history || [])])
      }
      
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('Failed to load history. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [router, pagination.pageSize])

  // Initial data fetch
  useEffect(() => {
    fetchHistory(1, true)
  }, [fetchHistory])

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !loadingMore) {
      fetchHistory(pagination.page + 1)
    }
  }

  const handleChangePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage, true)
    }
  }

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

  // Render pagination controls
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center gap-1 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page === 1}
          onClick={() => handleChangePage(pagination.page - 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm mx-2">
          Page {pagination.page} of {pagination.totalPages}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handleChangePage(pagination.page + 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 mt-4 sm:mt-10 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-xl font-bold">Number History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-xs sm:text-sm self-end sm:self-auto"
            asChild
          >
            <a href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back to Dashboard
            </a>
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
          <>
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
            
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {pagination.page < pagination.totalPages && !loadingMore && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline"
                  onClick={handleLoadMore}
                  className="text-xs sm:text-sm"
                >
                  Load More
                </Button>
              </div>
            )}
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  )
} 