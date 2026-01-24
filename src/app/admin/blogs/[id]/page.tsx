
import { notFound } from 'next/navigation';
import BlogEditor from '@/components/admin/BlogEditor';
import { getBlogById } from '@/lib/actions/blogs';

interface PageProps {
    params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminEditBlogPage({ params }: PageProps) {
    const { id } = await params
    const result = await getBlogById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <BlogEditor initialData={result.data} />;
}
