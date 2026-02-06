import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import Logo from '@/assets/logo.png';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col relative overflow-hidden">
      {/* Background Pattern - subtle diagonal lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(255,255,255,0.1) 20px,
            rgba(255,255,255,0.1) 40px
          )`
        }} />
      </div>

      {/* Loading Bar at Top */}
      <div className="w-full h-1 bg-orange-400">
        <div className="h-full bg-white w-3/4 rounded-r-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Kasi
          </h1>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Bites
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-white/80 text-lg text-center mb-12">
          Delicious food, delivered fast
        </p>
      </div>

      {/* Bottom Section with Buttons */}
      <div className="px-6 pb-12 safe-bottom relative z-10">
        {/* Sign In Button */}
        <Button
          onClick={() => navigate('/login')}
          fullWidth
          className="bg-white text-orange-500 hover:bg-gray-50 mb-3 py-4 text-base font-semibold"
        >
          Sign In
        </Button>

        {/* Create Account Button */}
        <Button
          onClick={() => navigate('/register')}
          variant="outline"
          fullWidth
          className="border-2 border-white text-white hover:bg-white/10 py-4 text-base font-semibold bg-transparent"
        >
          Create Account
        </Button>

        {/* Continue as Guest */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 text-center text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
