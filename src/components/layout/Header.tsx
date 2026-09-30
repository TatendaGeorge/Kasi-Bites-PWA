import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/shisa';

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
      if (window.history.length > 1 && location.key !== 'default') {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <header
      className={cn('sticky top-0 z-40 lg:hidden safe-top', className)}
      style={{
        background: transparent ? 'transparent' : 'var(--surface)',
        borderBottom: transparent ? undefined : '1px solid var(--line)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="w-10">
          {(showBack || showClose) && (
            <IconButton
              icon={showClose ? 'x' : 'arrow-left'}
              label={showClose ? 'Close' : 'Go back'}
              size="sm"
              flat={!transparent}
              onClick={handleBack}
            />
          )}
        </div>

        {title && (
          <h1
            className="text-center flex-1 truncate"
            style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink)' }}
          >
            {title}
          </h1>
        )}

        <div className="w-10 flex justify-end">{rightContent}</div>
      </div>
    </header>
  );
}
