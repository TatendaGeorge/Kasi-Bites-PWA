import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { cn, validateEmail, validateSAPhoneNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.phone.trim() || !validateSAPhoneNumber(formData.phone)) {
      setError('Please enter a valid SA phone number');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password
      );

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
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
      <div className="px-6 pt-2 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Create</h1>
        <h1 className="text-4xl font-black text-white">account</h1>
        <p className="text-white/70 mt-2">Sign up to get started</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-6 overflow-y-auto">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoComplete="name"
              className={cn(
                'w-full bg-gray-50 border border-gray-200 rounded-xl',
                'px-4 py-3.5 text-base text-black placeholder-gray-400',
                'outline-none transition-all duration-150',
                'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              autoComplete="email"
              className={cn(
                'w-full bg-gray-50 border border-gray-200 rounded-xl',
                'px-4 py-3.5 text-base text-black placeholder-gray-400',
                'outline-none transition-all duration-150',
                'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="0821234567"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              autoComplete="tel"
              className={cn(
                'w-full bg-gray-50 border border-gray-200 rounded-xl',
                'px-4 py-3.5 text-base text-black placeholder-gray-400',
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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                autoComplete="new-password"
                className={cn(
                  'w-full bg-gray-50 border border-gray-200 rounded-xl',
                  'px-4 py-3.5 pr-12 text-base text-black placeholder-gray-400',
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
            <p className="mt-1.5 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              autoComplete="new-password"
              className={cn(
                'w-full bg-gray-50 border border-gray-200 rounded-xl',
                'px-4 py-3.5 text-base text-black placeholder-gray-400',
                'outline-none transition-all duration-150',
                'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              )}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="bg-orange-500 hover:bg-orange-600 py-4 text-base mt-4"
          >
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600 safe-bottom">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
