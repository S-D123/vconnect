import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Building2, Loader } from 'lucide-react';
import { ClubDetail, Post } from '../types';
import { fetchClubDetail, fetchPosts } from '../services/api';
import PostCard from '../components/ui/PostCard';
import { PostSkeleton } from '../components/ui/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

export default function ClubDetailPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;
    fetchClubDetail(clubId).then(setClub).finally(() => setLoading(false));
    fetchPosts('All')
      .then((allPosts) => setPosts(allPosts.filter((p) => p.clubId === clubId)))
      .finally(() => setPostsLoading(false));
  }, [clubId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader size={28} className="animate-spin text-teal-500" /></div>;
  }

  if (!club) {
    return <div className="text-center py-20">Club not found</div>;
  }

  const canCreatePost = Boolean(user?.isClub && user?.clubId === club.id);
  const canViewAnalytics = canCreatePost || (user?.role ?? '').toLowerCase() === 'admin';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold mb-4">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6 p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{club.name}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{club.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{club.totalMembers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{club.followersCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{club.foundedYear}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Founded</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2"><Users size={14} /> {club.president}</div>
          <div className="flex items-center gap-2"><Mail size={14} /> {club.email || 'No email available'}</div>
          <div className="flex items-center gap-2"><Building2 size={14} /> {club.department}</div>
        </div>

        {(canCreatePost || canViewAnalytics) && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {canCreatePost && (
              <Link to={`/clubs/${club.id}/create-post`} className="block w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-center">
                Create Post
              </Link>
            )}
            {canViewAnalytics && (
              <Link to={`/clubs/${club.id}/comment-analytics`} className="block w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white dark:bg-gray-700 dark:hover:bg-gray-600 font-semibold rounded-lg text-center">
                Comment Analytics
              </Link>
            )}
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Posts from {club.name}</h2>
      {postsLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <PostSkeleton key={i} />)}</div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
        </div>
      )}
    </div>
  );
}
