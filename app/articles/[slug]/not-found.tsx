import Link from 'next/link';

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-gray-900 text-[20px] font-semibold">Article not found</p>
      <Link href="/articles" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">
        Back to all articles
      </Link>
    </div>
  );
}
