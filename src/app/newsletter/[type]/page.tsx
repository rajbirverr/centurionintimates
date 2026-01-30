import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NewsletterTemplate from '@/components/newsletter/NewsletterTemplate'

// Note: dynamic and revalidate are not compatible with cacheComponents
// Newsletter pages are always dynamic by nature, handled by cacheComponents

const newsletterTypes = [
  'welcome',
  'sale',
  'festival',
  'blog-post',
  'order-confirmation',
  'cart-reminder',
  'invoice'
]

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params

  const typeNames: Record<string, string> = {
    'welcome': 'Welcome to Centurion',
    'sale': 'Sale Newsletter',
    'festival': 'Festival Collection',
    'blog-post': 'Blog Update',
    'order-confirmation': 'Order Confirmation',
    'cart-reminder': 'Complete Your Purchase',
    'invoice': 'Invoice'
  }

  return {
    title: `${typeNames[type] || 'Newsletter'} | Centurion`,
    description: `View your ${typeNames[type] || 'newsletter'} from Centurion`,
  }
}

export default async function NewsletterPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params

  if (!newsletterTypes.includes(type)) {
    notFound()
  }

  return <NewsletterTemplate type={type as any} />
}
