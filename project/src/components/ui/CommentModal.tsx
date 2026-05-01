import { useState, useRef, useEffect } from 'react';
import { X, Heart, CornerDownRight, Send } from 'lucide-react';
import { Comment } from '../../types';
import Avatar from './Avatar';
import { addComment, fetchComments } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

interface CommentModalProps {
  postId: string;
  postTitle: string;
  initialComments: Comment[];
  onClose: () => void;
  onCommentAdded: (comment: Comment) => void;
}

function CommentItem({ comment }: { comment: Comment }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className="flex gap-3 py-3">
      <Avatar src={comment.userAvatar} name={comment.userName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{comment.userDepartment}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{comment.content}</p>
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 hover:text-rose-500 transition-colors duration-150 group"
        >
          <Heart
            size={13}
            className={`transition-all duration-150 ${liked ? 'fill-rose-500 text-rose-500' : 'group-hover:text-rose-500'}`}
          />
          <span className={liked ? 'text-rose-500' : ''}>{likeCount > 0 ? likeCount : ''}</span>
        </button>
      </div>
    </div>
  );
}

export default function CommentModal({ postId, postTitle, initialComments, onClose, onCommentAdded }: CommentModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loadingComments, setLoadingComments] = useState(true);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingComments(true);
    fetchComments(postId)
      .then((list) => {
        if (!cancelled) setComments(list);
      })
      .catch(() => {
        if (!cancelled) setComments(initialComments);
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per open for this postId
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    if (!user) return;
    try {
      const newComment = await addComment(postId, trimmed);
      setComments((prev) => [newComment, ...prev]);
      onCommentAdded(newComment);
      setInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-0 lg:p-4"
    >
      <div className="w-full lg:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl lg:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Comments</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{postTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 ml-3 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100 dark:divide-gray-800">
          {loadingComments ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CornerDownRight size={28} className="text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((c) => <CommentItem key={c.id} comment={c} />)
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3"
        >
          <Avatar src={user?.avatar} name={user?.name ?? 'U'} size="sm" />
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            {!user && (
              <p className="text-xs text-amber-600 dark:text-amber-400 px-1">Sign in to comment.</p>
            )}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? 'Share your opinion...' : 'Sign in to comment'}
              disabled={!user}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!user || !input.trim() || isSubmitting}
              className="text-teal-500 disabled:text-gray-300 dark:disabled:text-gray-600 hover:text-teal-600 transition-colors duration-150 flex-shrink-0"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} strokeWidth={2.5} />
              )}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
