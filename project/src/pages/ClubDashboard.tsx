import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { createPost } from '../services/api';

interface PostForm {
  eventName: string;
  description: string;
  imageUrl: string;
}

export default function ClubDashboardPage() {
  const { user } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<PostForm>({
    eventName: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const canCreatePost = Boolean(user?.isClub && user?.clubId && clubId && user.clubId === clubId);

  if (!canCreatePost) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Access Denied</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Only the club owner can create posts.</p>
        <button onClick={() => navigate('/')} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
          Back to home
        </button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = String(reader.result || '');
      setImagePreview(image);
      setForm((prev) => ({ ...prev, imageUrl: image }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.eventName.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    try {
      await createPost({
        clubId: clubId!,
        eventName: form.eventName,
        description: form.description,
        image: imagePreview || undefined,
      });

      setSuccess(true);
      setForm({ eventName: '', description: '', imageUrl: '' });
      setImagePreview('');
      setTimeout(() => navigate(`/clubs/${clubId}`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold mb-6 hover:gap-3 transition-all">
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Post</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Share an update with your club community</p>

          {error && <div className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</div>}
          {success && <div className="mb-4 text-sm text-teal-600 dark:text-teal-400">Post created successfully!</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              value={form.eventName}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              placeholder="Post title"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Write your post..."
              rows={5}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none"
            />

            <div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer">
                <ImageIcon size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Upload image</span>
              </label>
            </div>

            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-6 py-3 px-4 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : success ? <><Check size={18} />Created</> : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
