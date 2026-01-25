import NewsletterManagement from '@/components/admin/NewsletterManagement'

export default async function AdminNewsletterPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#5a4c46]">Newsletter Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <NewsletterManagement />
      </div>
    </div>
  )
}
