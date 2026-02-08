import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = false,
  showClose = false,
  onBack,
  rightContent,
  className,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Check if we have history to go back to
      // If PWA opened directly to this page, go to home instead
      if (window.history.length > 1 && location.key !== 'default') {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 lg:hidden',
        transparent ? 'bg-transparent' : 'bg-white border-b border-gray-100',
        'safe-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back/Close button */}
        <div className="w-10">
          {(showBack || showClose) && (
            <button
              onClick={handleBack}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-full',
                'transition-colors hover:bg-gray-100 active:bg-gray-200',
                transparent && 'bg-white shadow-sm'
              )}
              aria-label={showClose ? 'Close' : 'Go back'}
            >
              {showClose ? (
                <X className="w-6 h-6" />
              ) : (
                <ArrowLeft className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Center: Title */}
        {title && (
          <h1 className="text-lg font-semibold text-center flex-1 truncate">
            {title}
          </h1>
        )}

        {/* Right: Custom content */}
        <div className="w-10 flex justify-end">
          {rightContent}
        </div>
      </div>
    </header>
  );
}
