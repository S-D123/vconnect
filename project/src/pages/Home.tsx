import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Post, FilterCategory } from '../types';
import { fetchPosts } from '../services/api';
import PostCard from '../components/ui/PostCard';
import { PostSkeleton } from '../components/ui/SkeletonLoader';

const FILTERS: FilterCategory[] = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Social'];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchPosts(activeFilter).then((data) => {
      if (!cancelled) {
        setPosts(data);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="lg:hidden w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            Event Feed
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Stay updated with campus happenings</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-4 px-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              activeFilter === f
                ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <Zap size={24} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No events found in this category.</p>
            <button
              onClick={() => setActiveFilter('All')}
              className="mt-3 text-teal-500 text-sm font-medium hover:underline"
            >
              View all events
            </button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
