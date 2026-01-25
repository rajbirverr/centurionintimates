'use client'

import { useState, useEffect } from 'react'
import { getSubscribers, getSendHistory, type NewsletterSubscriber, type NewsletterSend } from '@/lib/actions/newsletter'
import NewsletterSendModal from './NewsletterSendModal'

interface NewsletterTemplate {
  type: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice'
  name: string
  description: string
  icon: string
}

const templates: NewsletterTemplate[] = [
  {
    type: 'welcome',
    name: 'Welcome Email',
    description: 'Send to new subscribers when they sign up',
    icon: '👋'
  },
  {
    type: 'sale',
    name: 'Sale Newsletter',
    description: 'Promote sales and special offers',
    icon: '🏷️'
  },
  {
    type: 'festival',
    name: 'Festival Collection',
    description: 'Celebrate festivals with special collections',
    icon: '🎉'
  },
  {
    type: 'blog-post',
    name: 'Blog Post',
    description: 'Share latest blog posts and updates',
    icon: '📝'
  },
  {
    type: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Confirm order placement (automated)',
    icon: '✅'
  },
  {
    type: 'cart-reminder',
    name: 'Cart Reminder',
    description: 'Remind customers about abandoned carts',
    icon: '🛒'
  },
  {
    type: 'invoice',
    name: 'Invoice',
    description: 'Send order invoices (automated)',
    icon: '📄'
  }
]

export default function NewsletterManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [sendHistory, setSendHistory] = useState<NewsletterSend[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [subscribersResult, historyResult] = await Promise.all([
        getSubscribers(),
        getSendHistory(20)
      ])

      if (subscribersResult.success && subscribersResult.data) {
        setSubscribers(subscribersResult.data)
      }

      if (historyResult.success && historyResult.data) {
        setSendHistory(historyResult.data)
      }
    } catch (error) {
      console.error('Error loading newsletter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateClick = (template: NewsletterTemplate) => {
    setSelectedTemplate(template)
  }

  const handleCloseModal = () => {
    setSelectedTemplate(null)
    loadData() // Refresh data after sending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#84756f]">Loading newsletter data...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-[#5a4c46] border-b-2 border-[#5a4c46]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-[#5a4c46] border-b-2 border-[#5a4c46]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Send History ({sendHistory.length})
        </button>
        <div className="flex-1"></div>
        <div className="pb-3 text-sm text-gray-600">
          {subscribers.length} active subscribers
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <button
              key={template.type}
              onClick={() => handleTemplateClick(template)}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#5a4c46] hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{template.icon}</div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-[#5a4c46] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#5a4c46] mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {sendHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No send history yet. Start by sending your first newsletter!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sendHistory.map((send) => (
                    <tr key={send.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5a4c46]">
                        {templates.find(t => t.type === send.template_type)?.name || send.template_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {send.recipient_email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {send.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            send.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : send.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {send.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(send.sent_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Send Modal */}
      {selectedTemplate && (
        <NewsletterSendModal
          template={selectedTemplate}
          subscribers={subscribers}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
