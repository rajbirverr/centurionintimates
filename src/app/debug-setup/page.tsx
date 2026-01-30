'use client';

import React, { useEffect, useState } from 'react';
import { getCategoriesWithSubcategories, getAllCategories, getAdminDebugCategories, getDebugRelations } from '@/lib/actions/categories';
import { createClient } from '@supabase/supabase-js';

export default function DebugSetupPage() {
    const [simpleCategories, setSimpleCategories] = useState<any>(null);
    const [nestedCategories, setNestedCategories] = useState<any>(null);
    const [adminCategories, setAdminCategories] = useState<any>(null);
    const [relationDebug, setRelationDebug] = useState<any>(null);
    const [clientFetchResult, setClientFetchResult] = useState<any>(null);
    const [envInfo, setEnvInfo] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // This runs on client
    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING';
        setEnvInfo(url);
    }, []);

    useEffect(() => {
        async function checkData() {
            try {
                setLoading(true);

                // 1. Simple Fetch
                console.log('Fetching simple categories...');
                const simple = await getAllCategories();
                setSimpleCategories(simple);

                // 2. Nested Fetch
                console.log('Fetching nested categories...');
                const nested = await getCategoriesWithSubcategories();
                setNestedCategories(nested);

                // 3. Admin Fetch (Server-side bypass RLS)
                console.log('Fetching admin debug categories...');
                const adminRes = await getAdminDebugCategories();
                setAdminCategories(adminRes.data || adminRes.error);

                // 3b. Relation Debug
                console.log('Fetching relation debug...');
                const relRes = await getDebugRelations();
                setRelationDebug(relRes);

                // 4. Client-Side Fetch
                console.log('Fetching direct client-side...');
                try {
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    )
                    const { data: directData, error: directError } = await supabase.from('categories').select('*');
                    if (directError) throw directError;
                    setClientFetchResult(directData);
                } catch (e: any) {
                    setClientFetchResult({ error: e.message });
                }

            } catch (err: any) {
                console.error('Debug Error:', err);
                setError(err.message || String(err));
            } finally {
                setLoading(false);
            }
        }

        checkData();
    }, []);

    return (
        <div className="p-10 font-mono text-sm max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Database Connection Debugger</h1>

            {loading && <div className="text-blue-600 mb-4">Loading data...</div>}

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 mb-6 rounded">
                    <h3 className="font-bold">Error Occurred</h3>
                    <p>{error}</p>
                </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
                <h3 className="font-bold">Environment Diagnostic</h3>
                <p>Connected Supabase URL: <strong>{envInfo}</strong></p>
                <p className="text-xs text-gray-500 mt-1">Check if this matches the project ID in your URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID</p>
            </div>

            <div className="grid gap-8">
                <section className="border p-4 rounded bg-gray-50">
                    <h2 className="font-bold text-lg mb-2">1. Simple Categories Fetch (Public)</h2>
                    <div className="text-gray-600 mb-2">Result count: {simpleCategories?.length ?? '...'}</div>
                    <pre className="bg-white p-2 border rounded overflow-auto max-h-60">
                        {JSON.stringify(simpleCategories, null, 2)}
                    </pre>
                </section>

                <section className="border p-4 rounded bg-gray-50">
                    <h2 className="font-bold text-lg mb-2">2. Nested Categories (Public)</h2>
                    <div className="text-gray-600 mb-2">Result count: {nestedCategories?.length ?? '...'}</div>
                    <pre className="bg-white p-2 border rounded overflow-auto max-h-60">
                        {JSON.stringify(nestedCategories, null, 2)}
                    </pre>
                </section>

                <section className="border border-red-200 p-4 rounded bg-red-50">
                    <h2 className="font-bold text-lg mb-2 text-red-800">3. Admin Bypass Fetch (Server-Side)</h2>
                    <div className="text-gray-600 mb-2">Result count: {Array.isArray(adminCategories) ? adminCategories.length : 'Error'}</div>
                    <p className="text-xs text-gray-500 mb-2">
                        This bypasses RLS. If this has data, your RLS policies are blocking public access.
                        If this is empty, your database is EMPTY.
                    </p>
                    <pre className="bg-white p-2 border rounded overflow-auto max-h-60">
                        {JSON.stringify(adminCategories, null, 2)}
                    </pre>
                </section>

                <section className="border border-purple-200 p-4 rounded bg-purple-50">
                    <h2 className="font-bold text-lg mb-2 text-purple-800">3b. Relationship Debug (Crucial)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-sm">Admin (Bypass RLS)</h4>
                            <pre className="text-xs bg-white p-2 border rounded overflow-auto h-40">
                                {JSON.stringify(relationDebug?.adminResult, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Public (RLS)</h4>
                            <pre className="text-xs bg-white p-2 border rounded overflow-auto h-40">
                                {JSON.stringify(relationDebug?.publicResult, null, 2)}
                            </pre>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        If "Admin" works but "Public" fails: It's RLS.
                        If BOTH fail with "Could not find relationship": It's a Schema/Naming issue.
                    </p>
                </section>

                <section className="border p-4 rounded bg-gray-50">
                    <h2 className="font-bold text-lg mb-2">4. Direct Client-Side Fetch</h2>
                    <div className="text-gray-600 mb-2">Result count: {clientFetchResult?.length ?? '...'}</div>
                    <p className="text-xs text-gray-500 mb-2">
                        If this has data but the others don't, it means your Server Environment Variables are wrong/stale.
                        If this is also 0, then your Table is truly empty or RLS policies are blocking access.
                    </p>
                    <pre className="bg-white p-2 border rounded overflow-auto max-h-60">
                        {JSON.stringify(clientFetchResult, null, 2)}
                    </pre>
                </section>
            </div>
        </div>
    );
}
