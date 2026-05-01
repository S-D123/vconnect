import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Users, ChevronRight } from 'lucide-react';
import { Club, FilterCategory } from '../types';
import { fetchClubs } from '../services/api';
import { ClubCardSkeleton } from '../components/ui/SkeletonLoader';
import Avatar from '../components/ui/Avatar';

const CATEGORIES: FilterCategory[] = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Social'];

const categoryColors: Record<string, string> = {
  Technical: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400',
  Cultural: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Sports: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Academic: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400',
  Social: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
};

interface ClubCardProps {
  club: Club;
  onFollowToggle: (id: string) => void;
}

function ClubCard({ club, onFollowToggle }: ClubCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3 transition-shadow duration-150 hover:shadow-md dark:hover:shadow-gray-900/50 animate-fade-in">
      <div className="flex items-start gap-3">
        <Avatar src={club.logo} name={club.name} size="lg" className="rounded-xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                {club.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{club.department}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[club.category] ?? ''}`}
            >
              {club.category}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
        {club.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Users size={13} />
          {club.followersCount.toLocaleString()} followers
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFollowToggle(club.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 ${
              club.isFollowed
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50'
                : 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/20'
            }`}
          >
            {club.isFollowed ? 'Following' : 'Follow'}
          </button>
          <Link to={`/clubs/${club.id}`} className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadClubs = (q: string, cat: FilterCategory) => {
    setIsLoading(true);
    fetchClubs(q, cat).then((data) => {
      setClubs(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadClubs(query, activeCategory);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeCategory]);

  const handleFollowToggle = (id: string) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFollowed: !c.isFollowed } : c))
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Discover</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Find clubs and departments across campus</p>

      <div className="relative mb-4">
        <SearchIcon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs, departments..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {!isLoading && clubs.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {clubs.length} club{clubs.length !== 1 ? 's' : ''} found
        </p>
      )}

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ClubCardSkeleton key={i} />)
        ) : clubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <SearchIcon size={24} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No clubs found matching your search.</p>
            <button
              onClick={() => { setQuery(''); setActiveCategory('All'); }}
              className="mt-3 text-teal-500 text-sm font-medium hover:underline flex items-center gap-1"
            >
              Clear filters <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          clubs.map((club) => (
            <ClubCard key={club.id} club={club} onFollowToggle={handleFollowToggle} />
          ))
        )}
      </div>
    </div>
  );
}
