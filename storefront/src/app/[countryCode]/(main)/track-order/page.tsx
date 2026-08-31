'use client'

import React, { useState } from 'react'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { Button } from '@modules/common/components/button'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

interface OrderTrackingData {
  id: string
  display_id: number
  status: string
  created_at: string
  customer_name: string
  city: string
  address: string
  phone: string
  courier: string
  tracking_number: string
  tracking_url: string
  estimated_delivery: string
  payment_method: string
  items: Array<{
    title: string
    quantity: number
    unit_price: number | string
  }>
}

export default function TrackOrderPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<OrderTrackingData | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await fetch(`http://localhost:9000/tracking?q=${encodeURIComponent(searchTerm.trim())}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Order not found. Please verify your Order # or Phone number.')
      } else {
        setOrder(data.order)
      }
    } catch (err: any) {
      setError('Unable to fetch tracking status. Please check your network or try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="min-h-screen max-w-full bg-secondary !p-0">
      <Container className="!py-10 max-w-[1100px] mx-auto px-4">
        <StoreBreadcrumbs breadcrumb="Track Your Order" />

        <div className="mt-6 text-center max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
            Pakistan Nationwide Courier Tracking
          </span>
          <Heading as="h1" className="text-3xl medium:text-5xl font-bold tracking-tight text-static">
            Track Your NAAZ Order (ناز)
          </Heading>
          <Text className="mt-3 text-secondary text-sm medium:text-base">
            Enter your <strong>Order Number</strong> (e.g. 1) or <strong>Mobile Number</strong> (e.g. 03047437611) to check live courier fulfillment status via TCS, Leopards, or Trax.
          </Text>
        </div>

        {/* Search Box */}
        <form onSubmit={handleTrack} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Order # or 03XXXXXXXXX"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-5 py-3.5 rounded-xl bg-primary border border-basic-primary text-static placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          <Button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all duration-200 shadow-md flex items-center justify-center shrink-0"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Track Order'
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="mt-10 max-w-3xl mx-auto bg-primary rounded-2xl border border-basic-primary shadow-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-6 bg-basic-primary/30 border-b border-basic-primary flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-secondary font-medium">Order Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-static">Order #{order.display_id}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-secondary font-medium">Assigned Courier</span>
                <p className="text-lg font-bold text-amber-500">{order.courier}</p>
              </div>
            </div>

            {/* Tracking Progress */}
            <div className="p-6 sm:p-8 border-b border-basic-primary bg-secondary/50">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">✓</div>
                  <span className="mt-2 text-xs font-semibold text-static">Order Placed</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">✓</div>
                  <span className="mt-2 text-xs font-semibold text-static">Confirmed</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md animate-pulse">🚚</div>
                  <span className="mt-2 text-xs font-semibold text-amber-500">In Transit</span>
                </div>
                <div className="flex flex-col items-center opacity-50">
                  <div className="w-10 h-10 rounded-full bg-neutral-700 text-neutral-400 flex items-center justify-center font-bold text-sm">📦</div>
                  <span className="mt-2 text-xs font-medium text-secondary">Delivered</span>
                </div>
              </div>
            </div>

            {/* Courier Info & Live Link */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-semibold text-secondary tracking-wider">Customer & Delivery Info</h4>
                <div className="bg-secondary/70 p-4 rounded-xl space-y-1.5 text-sm">
                  <p className="font-semibold text-static">{order.customer_name}</p>
                  <p className="text-secondary">{order.address}</p>
                  <p className="text-secondary">{order.city}, Pakistan</p>
                  <p className="text-secondary">📞 {order.phone}</p>
                  <p className="text-amber-500 font-medium pt-1">💵 {order.payment_method}</p>
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase font-semibold text-secondary tracking-wider">Courier Consignment</h4>
                  <div className="bg-secondary/70 p-4 rounded-xl space-y-2 text-sm">
                    <p className="text-secondary">Courier Partner: <strong className="text-static">{order.courier}</strong></p>
                    <p className="text-secondary">Tracking #: <strong className="text-amber-500 font-mono">{order.tracking_number}</strong></p>
                    <p className="text-secondary">Estimated Arrival: <strong className="text-emerald-400">{order.estimated_delivery}</strong></p>
                  </div>
                </div>

                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-center transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                >
                  <span>Open Official {order.courier} Tracking</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Items List */}
            <div className="p-6 bg-basic-primary/20 border-t border-basic-primary">
              <h4 className="text-xs uppercase font-semibold text-secondary tracking-wider mb-3">Ordered Products</h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-basic-primary/50 last:border-0">
                    <span className="text-static font-medium">{item.title} × {item.quantity}</span>
                    <span className="text-amber-500 font-semibold">PKR {Number(item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Help */}
            <div className="p-4 bg-emerald-950/30 border-t border-emerald-500/20 text-center text-xs text-secondary flex items-center justify-center gap-2">
              <span>Need instant help with this order?</span>
              <a
                href={`https://wa.me/923047437611?text=${encodeURIComponent(`Hi NAAZ Support, I want an update regarding my Order #${order.display_id} (${order.tracking_number})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-semibold hover:underline"
              >
                Chat on WhatsApp 💬
              </a>
            </div>
          </div>
        )}
      </Container>
    </Container>
  )
}
