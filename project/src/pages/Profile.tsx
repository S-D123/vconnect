import { useState, useEffect } from 'react';
import { MessageSquare, Bookmark, GraduationCap, Building2, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';
import { Post } from '../types';
import Avatar from '../components/ui/Avatar';
import PostCard from '../components/ui/PostCard';
import { formatRelativeTime } from '../utils/formatters';

interface UserComment {
  postId: string;
  postTitle: string;
  clubName: string;
  comment: string;
  createdAt: string;
  likes: number;
}

type TabKey = 'comments' | 'saved';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('comments');
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserProfile().then(({ user: fresh, comments, savedPosts: sp }) => {
      updateUser(fresh);
      setUserComments(comments);
      setSavedPosts(sp);
      setIsLoading(false);
    });
  }, [user?.id, updateUser]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Profile</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
        <div className="flex items-start gap-4">
          <Avatar src={user.avatar} name={user.name} size="xl" className="rounded-2xl ring-4 ring-teal-500/20" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{user.name}</h2>
            {user.studentId ? (
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mt-0.5">{user.studentId}</p>
            ) : null}
            {user.bio && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <Building2 size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate">{user.department ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <GraduationCap size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>{user.year ?? '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{user.followedClubs.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Clubs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{userComments.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Comments</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{savedPosts.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Saved</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {([
            { key: 'comments', label: 'My Comments', icon: MessageSquare },
            { key: 'saved', label: 'Saved Events', icon: Bookmark },
          ] as { key: TabKey; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-150 border-b-2 ${
                activeTab === key
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'comments' ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {userComments.length === 0 ? (
              <EmptyState icon={MessageSquare} message="No comments yet" />
            ) : (
              userComments.map((c, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs font-medium text-teal-600 dark:text-teal-400">{c.clubName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{c.postTitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      <Calendar size={11} />
                      {formatRelativeTime(c.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">"{c.comment}"</p>
                  {c.likes > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <Heart size={12} className="fill-rose-400 text-rose-400" />
                      {c.likes} likes
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {savedPosts.length === 0 ? (
              <EmptyState icon={Bookmark} message="No saved events yet" />
            ) : (
              savedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
        <Icon size={22} className="text-gray-400 dark:text-gray-600" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
