'use client'

import { useState, useEffect } from 'react'
import { sendNewsletter, type NewsletterSubscriber } from '@/lib/actions/newsletter'
import Link from 'next/link'

interface NewsletterTemplate {
  type: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice'
  name: string
  description: string
  icon: string
}

interface NewsletterSendModalProps {
  template: NewsletterTemplate
  subscribers: NewsletterSubscriber[]
  onClose: () => void
}

type RecipientType = 'all' | 'custom' | 'single'

export default function NewsletterSendModal({ template, subscribers, onClose }: NewsletterSendModalProps) {
  const [recipientType, setRecipientType] = useState<RecipientType>('all')
  const [customEmails, setCustomEmails] = useState('')
  const [singleEmail, setSingleEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null)

  useEffect(() => {
    // Set default subject based on template type
    const defaultSubjects: Record<string, string> = {
      'welcome': 'Welcome to Centurion!',
      'sale': 'Limited Time Sale - Up to 50% Off',
      'festival': 'Festival Collection - Celebrate in Style',
      'blog-post': 'Latest from The Centurion Edit',
      'order-confirmation': 'Order Confirmation',
      'cart-reminder': "Don't Forget Your Cart Items!",
      'invoice': 'Invoice'
    }
    setSubject(defaultSubjects[template.type] || 'Newsletter from Centurion')
  }, [template])

  const handleSend = async () => {
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Determine recipients
      let recipients: string[] = []

      if (recipientType === 'all') {
        recipients = subscribers.map(s => s.email)
      } else if (recipientType === 'custom') {
        // Parse comma or newline separated emails
        recipients = customEmails
          .split(/[,\n]/)
          .map(email => email.trim())
          .filter(email => email.length > 0 && email.includes('@'))
      } else if (recipientType === 'single') {
        if (!singleEmail || !singleEmail.includes('@')) {
          setError('Please enter a valid email address')
          setLoading(false)
          return
        }
        recipients = [singleEmail.trim()]
      }

      if (recipients.length === 0) {
        setError('Please select at least one recipient')
        setLoading(false)
        return
      }

      if (!subject.trim()) {
        setError('Please enter a subject line')
        setLoading(false)
        return
      }

      // Send newsletter
      const result = await sendNewsletter(
        template.type,
        recipients,
        subject,
        {} // Data can be customized later
      )

      if (result.success) {
        setSuccess(true)
        setSendResult({ sent: result.sent, failed: result.failed })
      } else {
        setError(result.error || 'Failed to send newsletter')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-[#5a4c46] mb-2">Newsletter Sent!</h2>
            {sendResult && (
              <p className="text-sm text-gray-600 mb-4">
                Successfully sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? 's' : ''}
                {sendResult.failed > 0 && `, ${sendResult.failed} failed`}
              </p>
            )}
            <button
              onClick={onClose}
              className="w-full bg-[#5a4c46] hover:bg-[#4a3c36] text-white px-6 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-[#5a4c46] mb-1">
              Send {template.name}
            </h2>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview Link */}
        <div className="mb-6 p-4 bg-[#fafafa] border border-[#e8ded0] rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Preview this template:</p>
          <Link
            href={`/newsletter/${template.type}`}
            target="_blank"
            className="text-sm text-[#5a4c46] hover:underline"
          >
            View {template.name} Template →
          </Link>
        </div>

        {/* Recipient Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5a4c46] mb-3">
            Recipients
          </label>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="recipientType"
                value="all"
                checked={recipientType === 'all'}
                onChange={() => setRecipientType('all')}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">
                All subscribers ({subscribers.length} emails)
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="recipientType"
                value="single"
                checked={recipientType === 'single'}
                onChange={() => setRecipientType('single')}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Single email</span>
            </label>
            {recipientType === 'single' && (
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="email@example.com"
                className="ml-8 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
              />
            )}
            
            <label className="flex items-center">
              <input
                type="radio"
                name="recipientType"
                value="custom"
                checked={recipientType === 'custom'}
                onChange={() => setRecipientType('custom')}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Custom list (comma or newline separated)</span>
            </label>
            {recipientType === 'custom' && (
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                rows={4}
                className="ml-8 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
              />
            )}
          </div>
        </div>

        {/* Subject Line */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5a4c46] mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Enter email subject"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-6 py-2 bg-[#5a4c46] hover:bg-[#4a3c36] text-white rounded-md text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Newsletter'}
          </button>
        </div>
      </div>
    </div>
  )
}
