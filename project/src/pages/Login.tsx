import { useState, FormEvent } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { user, token } = await loginUser(identifier, password);
      login(user, token);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-gray-950 dark:to-teal-950/20 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500 rounded-2xl mb-4 shadow-lg shadow-teal-500/30">
            <Zap size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            v<span className="text-teal-500">connect</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Your college events & community hub
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email or Student ID
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. CS2021047 or you@uni.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Forgot password?
                </button> */}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm shadow-teal-500/30 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Use the email and password from your API account. With the dev proxy, requests go to <code className="text-gray-500">/api</code> on the same host.
        </p>

        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Use any email/ID with a password of 4+ characters to sign in.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}
