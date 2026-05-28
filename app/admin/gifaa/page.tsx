'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, Globe, FileText } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  tenant: string;
  category: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

export default function AdminGifaaPage() {
  return (
    <AdminShell>
      <GifaaArticlesList />
    </AdminShell>
  );
}

function GifaaArticlesList() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    const { data } = await supabase
      .from('gifaa_articles')
      .select('id, slug, title, tenant, category, status, published_at, updated_at')
      .order('updated_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('gifaa_articles').delete().eq('id', id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gifaa Articles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog articles for the Gifaa section</p>
        </div>
        <Button onClick={() => router.push('/admin/gifaa/edit/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-10 text-center">Loading...</p>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">No articles yet</p>
          <Button onClick={() => router.push('/admin/gifaa/edit/new')} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Create your first article
          </Button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tenant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{article.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/articles/{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {article.tenant}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{article.category || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(article.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                        className="h-8 w-8 p-0"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/gifaa/edit/${article.id}`)}
                        className="h-8 w-8 p-0"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article.id, article.title)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
