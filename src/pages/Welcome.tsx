import { useNavigate } from 'react-router-dom';
import { Logo, Button } from '@/components/shisa';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--night)', color: 'var(--on-night)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <Logo variant="lockup" size={56} reversed className="mb-6" />
        <p className="text-lg text-center" style={{ color: 'var(--on-night)', opacity: 0.8 }}>
          Kasi food, hot from the corner.
        </p>
      </div>

      <div className="px-6 pb-12 safe-bottom flex flex-col gap-3">
        <Button variant="light" block onClick={() => navigate('/login')}>
          Sign in
        </Button>
        <Button variant="secondary" block onClick={() => navigate('/register')}>
          Create account
        </Button>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-2 text-center text-sm font-bold transition-colors"
          style={{ color: 'var(--on-night)', opacity: 0.8 }}
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}
