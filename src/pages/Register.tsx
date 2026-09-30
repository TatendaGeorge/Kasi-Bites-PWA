import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validateSAPhoneNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button, Logo, TextField, IconButton } from '@/components/shisa';

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
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const result = await register(formData.name, formData.email, formData.phone, formData.password);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col lg:items-center lg:justify-center lg:py-8"
      style={{ minHeight: '100dvh', background: 'var(--bg)' }}
    >
      <div className="p-4 safe-top lg:hidden flex justify-end">
        <IconButton icon="x" label="Close" flat onClick={() => navigate('/')} />
      </div>

      <div
        className="flex-1 overflow-y-auto lg:flex-none lg:w-full lg:max-w-md lg:overflow-visible relative"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '24px 24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="hidden lg:block mb-6">
          <IconButton
            icon="x"
            label="Close"
            flat
            onClick={() => navigate('/')}
            className="absolute top-4 right-4"
          />
          <Link to="/" className="flex justify-center mb-6">
            <Logo size={48} />
          </Link>
          <h1 className="text-center" style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>
            Create account
          </h1>
          <p className="text-center mt-1" style={{ color: 'var(--ink-muted)' }}>
            Sign up to get started
          </p>
        </div>

        <div className="lg:hidden mb-6">
          <h1 style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>Create account</h1>
          <p className="mt-1" style={{ color: 'var(--ink-muted)' }}>
            Sign up to get started
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-3 mb-5"
            style={{
              background: 'var(--brand-soft)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Full name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            autoComplete="name"
          />

          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            autoComplete="email"
          />

          <TextField
            label="Phone number"
            type="tel"
            placeholder="0821234567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            autoComplete="tel"
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            autoComplete="new-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--ink-subtle)', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
          <p className="-mt-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
            Must be at least 8 characters
          </p>

          <TextField
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            autoComplete="new-password"
          />

          <Button type="submit" block disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center safe-bottom lg:pb-0" style={{ color: 'var(--ink-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="sh-link">
            Sign in
          </Link>
        </p>
      </div>

      <div className="hidden lg:block mt-6">
        <button onClick={() => navigate('/')} className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          ← Back to home
        </button>
      </div>
    </div>
  );
}
