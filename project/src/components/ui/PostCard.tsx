import { useState } from 'react';
import { Heart, MessageCircle, Share2, Calendar, MapPin, Bookmark, Check } from 'lucide-react';
import { Post, Comment } from '../../types';
import CommentModal from './CommentModal';
import { toggleLikePost } from '../../services/api';
import { formatRelativeTime, formatEventDate, copyToClipboard } from '../../utils/formatters';

const categoryColors: Record<string, string> = {
  Technical: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400',
  Cultural: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Sports: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Academic: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400',
  Social: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
};

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.isSaved);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? post.comments.length);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLike = async () => {
    const prev = liked;
    setLiked(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    try {
      await toggleLikePost(post.id);
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.eventName, text: post.description, url });
      } else {
        await copyToClipboard(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    setCommentCount((c) => c + 1);
  };

  return (
    <>
      <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-shadow duration-200 hover:shadow-md dark:hover:shadow-gray-900/50 animate-fade-in">
        <div className="px-4 pt-4 pb-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm flex-shrink-0">
            {post.clubName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {post.clubName}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                {post.category}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {post.department} &middot; {formatRelativeTime(post.postedDate)}
            </p>
          </div>
          <button
            onClick={() => setSaved((s) => !s)}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${saved ? 'text-teal-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <Bookmark size={18} className={saved ? 'fill-teal-500' : ''} />
          </button>
        </div>

        {post.image && (
          <div className="relative w-full bg-gray-100 dark:bg-gray-800" style={{ paddingBottom: '56.25%' }}>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            <img
              src={post.image}
              alt={post.eventName}
              onLoad={() => setImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        )}

        <div className="px-4 pt-3 pb-1">
          <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
            {post.eventName}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {post.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatEventDate(post.eventDate)}
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin size={13} className="flex-shrink-0" />
              <span className="truncate">{post.venue}</span>
            </span>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-1 border-t border-gray-100 dark:border-gray-800 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 ${
              liked
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-rose-500'
            }`}
          >
            <Heart
              size={16}
              className={`transition-all duration-150 ${liked ? 'fill-rose-500' : ''}`}
            />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-150 active:scale-95"
          >
            <MessageCircle size={16} />
            <span>{commentCount}</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 ml-auto ${
              copied
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-500'
            }`}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </article>

      {showComments && (
        <CommentModal
          postId={post.id}
          postTitle={post.eventName}
          initialComments={comments}
          onClose={() => setShowComments(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </>
  );
}
