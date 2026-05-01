import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Image as ImageIcon, Lock, MapPin, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/api';

interface CreatePostForm {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  tags: string;
  imageUrl: string;
}

const initialForm: CreatePostForm = {
  title: 'AI Workshop 2026: Build Your First Campus App',
  description:
    'Join us for a hands-on workshop where we will design, build, and deploy a mini AI-powered app. Open to all departments. Limited seats available, so register early through the club desk.',
  eventDate: '2026-04-30',
  eventTime: '15:30',
  venue: 'Innovation Lab - Block C, Room 204',
  tags: 'Workshop, AI, Beginner Friendly',
  imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
};

function validateForm(form: CreatePostForm): string | null {
  const title = form.title.trim();
  const description = form.description.trim();
  const venue = form.venue.trim();
  const tags = form.tags.trim();

  if (title.length < 5 || title.length > 150) {
    return 'Title must be between 5 and 150 characters.';
  }
  if (description.length < 20 || description.length > 3000) {
    return 'Description must be between 20 and 3000 characters.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.eventDate)) {
    return 'Event date must be in YYYY-MM-DD format.';
  }
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.eventTime)) {
    return 'Event time must be in HH:mm format.';
  }
  if (!venue || venue.length > 255) {
    return 'Venue is required and must be at most 255 characters.';
  }
  if (tags.length > 255) {
    return 'Tags cannot exceed 255 characters.';
  }
  if (form.imageUrl.trim().length > 2000) {
    return 'Image URL is too long.';
  }
  return null;
}

export default function CreatePostPage() {
  const { user } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<CreatePostForm>(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isAdmin = (user?.role ?? '').toLowerCase() === 'admin';
  const isClubOwner = Boolean(user?.isClub && user?.clubId && clubId && user.clubId === clubId);
  const canCreatePost = isAdmin || isClubOwner;
  const imagePreview = useMemo(() => form.imageUrl.trim(), [form.imageUrl]);

  const handleChange = (field: keyof CreatePostForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);

    if (!clubId) {
      setError('Invalid club context. Please open this page from a club profile.');
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        clubId,
        eventName: form.title.trim(),
        description: form.description.trim(),
        image: form.imageUrl.trim() || undefined,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        venue: form.venue.trim(),
        tags: form.tags.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => navigate(`/clubs/${clubId}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreatePost) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Lock size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Access restricted</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This page is only available for club owners and admins.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold mb-5 hover:gap-3 transition-all"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Post</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Club owners/admins can publish updates to their community
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
          <Sparkles size={12} />
          Owner / Admin
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4"
      >
        {error && (
          <div className="text-sm rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-2.5">
            {error}
          </div>
        )}
        {isSuccess && (
          <div className="text-sm rounded-lg border border-teal-200 dark:border-teal-900/40 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-2.5 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Post created successfully.
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Post title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Description
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Event date
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-sm text-gray-800 dark:text-gray-200">
              <CalendarDays size={15} className="text-gray-500" />
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => handleChange('eventDate', e.target.value)}
                className="bg-transparent w-full outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Event time
            </label>
            <input
              type="time"
              value={form.eventTime}
              onChange={(e) => handleChange('eventTime', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Venue
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-sm text-gray-800 dark:text-gray-200">
            <MapPin size={15} className="text-gray-500" />
            <input
              type="text"
              value={form.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              className="bg-transparent w-full outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Tags
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Cover image URL
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Cover image
          </label>
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70">
            {imagePreview ? (
              <img src={imagePreview} alt="Event cover" className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                No image preview
              </div>
            )}
            <div className="px-3.5 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
              <ImageIcon size={13} />
              Image preview
            </div>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full py-2.5 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:bg-teal-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : isSuccess ? 'Published' : 'Publish Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/clubs/${clubId}`)}
            className="w-full py-2.5 rounded-lg text-center bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
