import { useState, FormEvent } from 'react';
import { Eye, EyeOff, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signupUser } from '../services/api';

type UserType = 'student' | 'club';

interface StudentFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ClubFormData {
  clubName: string;
  email: string;
  department: string;
  category: string;
  president: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [userType, setUserType] = useState<UserType>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [studentForm, setStudentForm] = useState<StudentFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [clubForm, setClubForm] = useState<ClubFormData>({
    clubName: '',
    email: '',
    department: '',
    category: 'Technical',
    president: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const departments = [
    'Computer Science & Engineering',
    'Electronics Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Fine Arts & Humanities',
    'Physical Education',
    'Environmental Science',
    'Commerce & Economics',
  ];

  const categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Social'];

  const handleStudentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (studentForm.password !== studentForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await signupUser({
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password,
        isClub: false,
      });
      setSuccess(true);
      login(user, token);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
      setLoading(false);
    }
  };

  const handleClubSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (clubForm.password !== clubForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await signupUser({
        name: clubForm.clubName,
        email: clubForm.email,
        password: clubForm.password,
        isClub: true,
        clubName: clubForm.clubName,
        department: clubForm.department,
        category: clubForm.category,
        year: clubForm.category,
        president: clubForm.president,
      });
      setSuccess(true);
      login(user, token);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join VConnect</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create an account to discover and post events
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {(['student', 'club'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setUserType(type);
                  setError('');
                }}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  userType === type
                    ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {type === 'student' ? 'Student' : 'Club'}
              </button>
            ))}
          </div>

          {error && (
            <div className="m-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 animate-fade-in">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="m-4 flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800/50 animate-fade-in">
              <Check size={14} />
              Account created! Redirecting...
            </div>
          )}

          <form
            onSubmit={userType === 'student' ? handleStudentSubmit : handleClubSubmit}
            className="p-4 space-y-3"
          >
            {userType === 'student' ? (
              <>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    placeholder="Password"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={studentForm.confirmPassword}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm password"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={clubForm.clubName}
                  onChange={(e) => setClubForm({ ...clubForm, clubName: e.target.value })}
                  placeholder="Club name"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <input
                  type="email"
                  value={clubForm.email}
                  onChange={(e) => setClubForm({ ...clubForm, email: e.target.value })}
                  placeholder="Club email"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <select
                  value={clubForm.department}
                  onChange={(e) => setClubForm({ ...clubForm, department: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={clubForm.category}
                  onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={clubForm.president}
                  onChange={(e) => setClubForm({ ...clubForm, president: e.target.value })}
                  placeholder="President name"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={clubForm.password}
                    onChange={(e) => setClubForm({ ...clubForm, password: e.target.value })}
                    placeholder="Password"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={clubForm.confirmPassword}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm password"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-4 py-2.5 px-4 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <Check size={16} />
                  Account Created
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
