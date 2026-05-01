import { useState, FormEvent } from 'react';
import {
  Moon, Sun, Lock, User, Bell, ChevronRight, LogOut, Check, AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updatePassword, updateProfile } from '../services/api';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1 mb-2">
      {children}
    </p>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  right,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors duration-150 ${
        danger
          ? 'hover:bg-red-50 dark:hover:bg-red-900/10'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${!onClick ? 'cursor-default' : ''}`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Icon
          size={16}
          className={danger ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight ${
            danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {right !== undefined ? right : onClick ? (
        <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
      ) : null}
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
        theme === 'dark' ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={10} className="text-teal-600" />
        ) : (
          <Sun size={10} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}

function PasswordChangePanel({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setErrorMsg('New passwords do not match.');
      setStatus('error');
      return;
    }
    if (next.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await updatePassword(current, next);
      setStatus('success');
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update password.');
      setStatus('error');
    }
  };

  return (
    <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-3">
        {status === 'error' && (
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800/50">
            <AlertCircle size={13} className="flex-shrink-0" />
            {errorMsg}
          </div>
        )}
        {status === 'success' && (
          <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800/50">
            <Check size={13} className="flex-shrink-0" />
            Password updated successfully!
          </div>
        )}
        {(['current', 'next', 'confirm'] as const).map((field) => (
          <input
            key={field}
            type="password"
            value={field === 'current' ? current : field === 'next' ? next : confirm}
            onChange={(e) =>
              field === 'current' ? setCurrent(e.target.value) : field === 'next' ? setNext(e.target.value) : setConfirm(e.target.value)
            }
            placeholder={field === 'current' ? 'Current password' : field === 'next' ? 'New password' : 'Confirm new password'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
          />
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 disabled:bg-teal-400 transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            {status === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Update'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditProfilePanel({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { user: next } = await updateProfile({ name, bio });
      updateUser({ name: next.name, bio: next.bio });
      setStatus('success');
      setTimeout(onClose, 1200);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-3">
        {status === 'success' && (
          <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800/50">
            <Check size={13} />
            Profile updated!
          </div>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio (optional)"
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150 resize-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 disabled:bg-teal-400 transition-all duration-150 flex items-center justify-center"
          >
            {status === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState<'password' | 'profile' | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const togglePanel = (panel: 'password' | 'profile') => {
    setOpenPanel((p) => (p === panel ? null : panel));
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Settings</h1>

      <div className="space-y-5">
        <div>
          <SectionTitle>Appearance</SectionTitle>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SettingsRow
              icon={theme === 'dark' ? Moon : Sun}
              label="Dark Mode"
              description={theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              right={<ThemeToggle />}
              onClick={toggleTheme}
            />
          </div>
        </div>

        <div>
          <SectionTitle>Account</SectionTitle>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            <SettingsRow
              icon={User}
              label="Edit Profile"
              description="Update your name and bio"
              onClick={() => togglePanel('profile')}
              right={
                <ChevronRight
                  size={16}
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openPanel === 'profile' ? 'rotate-90' : ''}`}
                />
              }
            />
            {openPanel === 'profile' && (
              <EditProfilePanel onClose={() => setOpenPanel(null)} />
            )}
            <SettingsRow
              icon={Lock}
              label="Change Password"
              description="Update your account password"
              onClick={() => togglePanel('password')}
              right={
                <ChevronRight
                  size={16}
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openPanel === 'password' ? 'rotate-90' : ''}`}
                />
              }
            />
            {openPanel === 'password' && (
              <PasswordChangePanel onClose={() => setOpenPanel(null)} />
            )}
            <SettingsRow
              icon={Bell}
              label="Notification Preferences"
              description="Manage what you're notified about"
              onClick={() => {}}
            />
          </div>
        </div>

        <div>
          <SectionTitle>Session</SectionTitle>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SettingsRow
              icon={LogOut}
              label="Log Out"
              description="Sign out of your account"
              onClick={handleLogout}
              danger
              right={null}
            />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-2">
          VConnect v1.0.0 &middot; Built for the campus community
        </p>
      </div>
    </div>
  );
}
