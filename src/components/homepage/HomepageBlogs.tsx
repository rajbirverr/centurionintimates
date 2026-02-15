'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SafeImage from '@/components/common/SafeImage'
import StylizedTitle from '@/components/common/StylizedTitle'
import { getPublishedBlogs, type BlogPost } from '@/lib/actions/blogs'

export default function HomepageBlogs() {
    const [blogs, setBlogs] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // Fetch all published blogs
                const allBlogs = await getPublishedBlogs()
                // Take the top 4 most recent/featured
                setBlogs(allBlogs.slice(0, 4))
            } catch (error) {
                console.error('Failed to fetch homepage blogs:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBlogs()
    }, [])

    if (loading) {
        return null // Or a skeleton if desired
    }

    if (blogs.length === 0) {
        return null
    }

    return (
        <section className="w-full bg-white mb-20 px-4 md:px-8 lg:px-12">
            <div className="max-w-[1440px] mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center mb-12 md:mb-16">
                    <StylizedTitle
                        text="The Centurion Edit"
                        className="text-[#BDBEBF] text-xl md:text-3xl mb-3 tracking-wider"
                        style={{ fontFamily: 'var(--font-rhode)' }}
                    />
                    <p className="text-[#8B7355] text-lg md:text-xl tracking-wide uppercase" style={{ fontFamily: 'var(--font-audiowide)' }}>
                        Discover trends & style advice
                    </p>
                </div>

                {/* Blog Grid - 2 cols mobile, 2 cols desktop */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-10 md:gap-8">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="flex flex-col items-center group">
                            <Link href={`/blogs/${blog.slug}`} className="block w-full">
                                {/* Circular Image Wrapper - Smaller & Centered */}
                                <div className="w-40 h-40 md:w-56 md:h-56 mx-auto rounded-full overflow-hidden mb-6 bg-[#FAF9F7] shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md relative">
                                    {blog.featured_image ? (
                                        <SafeImage
                                            src={blog.featured_image}
                                            alt={blog.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 160px, 224px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#8B7355]/30">
                                            <span className="text-4xl font-light">?</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="text-center px-4 max-w-[280px] mx-auto">
                                    <h3
                                        className="text-[#3d2e22] text-xs md:text-sm font-bold uppercase tracking-wider mb-1 leading-relaxed group-hover:text-[#a48b72] transition-colors"
                                        style={{ fontFamily: 'var(--font-manrope)' }}
                                    >
                                        {blog.title}
                                    </h3>

                                    {/* Optional Category/Date */}
                                    <p
                                        className="text-[#8B7355] text-[10px] md:text-xs font-medium uppercase tracking-[0.15em]"
                                        style={{ fontFamily: 'var(--font-manrope)' }}
                                    >
                                        {blog.category || 'Editors Pick'}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* View All Link */}
                <div className="flex justify-center mt-12 md:mt-16">
                    <Link
                        href="/blogs"
                        className="inline-block px-8 py-2.5 rounded-lg border text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 text-[#3d2e22] border-[#3d2e22] hover:bg-[#3d2e22] hover:text-white active:scale-[0.98]"
                        style={{ fontFamily: 'var(--font-manrope)' }}
                    >
                        VIEW ALL STORIES
                    </Link>
                </div>
            </div>
        </section>
    )
}
