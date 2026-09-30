import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button, IconButton, Icon } from '@/components/shisa'

const DISMISSED_KEY = 'notification_prompt_dismissed'

interface NotificationPromptProps {
  show: boolean
  onDismiss?: () => void
}

export function NotificationPrompt({ show, onDismiss }: NotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() =>
    localStorage.getItem(DISMISSED_KEY) === 'true'
  )
  const { isSupported, permission, isSubscribed, isLoading, subscribe } =
    usePushNotifications()

  useEffect(() => {
    if (isLoading) return

    if (
      show &&
      !isDismissed &&
      isSupported &&
      permission !== 'denied' &&
      !isSubscribed
    ) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [show, isDismissed, isSupported, permission, isSubscribed, isLoading])

  const handleEnable = async () => {
    const success = await subscribe()
    if (success) {
      setIsVisible(false)
      onDismiss?.()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, 'true')
    onDismiss?.()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 p-4"
      style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)' }}
    >
      <div className="absolute top-3 right-3">
        <IconButton icon="x" label="Dismiss" size="sm" flat onClick={handleDismiss} />
      </div>

      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-soft)' }}
        >
          <Icon name="bell" size={24} style={{ color: 'var(--brand-text)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="pr-6" style={{ font: '600 16px/22px var(--font-display)', color: 'var(--ink)' }}>
            Stay updated
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Enable notifications to get real-time updates on your order status.
          </p>

          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleEnable} disabled={isLoading} block>
              {isLoading ? 'Enabling…' : 'Enable notifications'}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPrompt
