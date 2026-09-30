import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button, Logo, TextField, IconButton } from '@/components/shisa';

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
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col lg:items-center lg:justify-center"
      style={{ minHeight: '100dvh', background: 'var(--bg)' }}
    >
      {/* Mobile: top bar with close */}
      <div className="p-4 safe-top lg:hidden flex justify-end">
        <IconButton icon="x" label="Close" flat onClick={() => navigate('/')} />
      </div>

      <div
        className="flex-1 lg:flex-none lg:w-full lg:max-w-md relative"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '32px 24px 24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="hidden lg:block mb-8">
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
            Welcome back
          </h1>
          <p className="text-center mt-1" style={{ color: 'var(--ink-muted)' }}>
            Sign in to your account
          </p>
        </div>

        <div className="lg:hidden mb-6">
          <h1 style={{ font: '600 28px/34px var(--font-display)', color: 'var(--ink)' }}>Welcome back</h1>
          <p className="mt-1" style={{ color: 'var(--ink-muted)' }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-3 mb-6"
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            autoComplete="email"
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            autoComplete="current-password"
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

          <div className="text-right">
            <button type="button" className="sh-link">
              Forgot password?
            </button>
          </div>

          <Button type="submit" block disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span className="px-4 text-sm" style={{ color: 'var(--ink-subtle)' }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 text-center font-bold safe-bottom lg:pb-0"
          style={{ color: 'var(--ink-muted)' }}
        >
          Continue as guest
        </button>

        <p className="mt-6 text-center" style={{ color: 'var(--ink-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="sh-link">
            Sign up
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
