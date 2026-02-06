import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { cn, validateEmail } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col">
      {/* Top Section with Close Button */}
      <div className="p-4 safe-top">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Logo Section */}
      <div className="px-6 pt-4 pb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome</h1>
        <h1 className="text-4xl font-black text-white">back</h1>
        <p className="text-white/70 mt-2">Sign in to your account</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              autoComplete="email"
              className={cn(
                'w-full bg-gray-50 border border-gray-200 rounded-xl',
                'px-4 py-4 text-base text-black placeholder-gray-400',
                'outline-none transition-all duration-150',
                'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                autoComplete="current-password"
                className={cn(
                  'w-full bg-gray-50 border border-gray-200 rounded-xl',
                  'px-4 py-4 pr-12 text-base text-black placeholder-gray-400',
                  'outline-none transition-all duration-150',
                  'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-orange-500 font-medium hover:text-orange-600"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="bg-orange-500 hover:bg-orange-600 py-4 text-base mt-4"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-4 text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Continue as Guest */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 text-center text-gray-600 hover:text-gray-800 font-medium"
        >
          Continue as guest
        </button>

        {/* Register Link */}
        <p className="mt-6 text-center text-gray-600 safe-bottom">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
