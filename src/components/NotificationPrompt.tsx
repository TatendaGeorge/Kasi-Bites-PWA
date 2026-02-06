import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { cn } from '@/lib/utils'

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
    console.log('[NotificationPrompt] State:', {
      show,
      isDismissed,
      isSupported,
      permission,
      isSubscribed,
      isLoading,
    })

    // Wait for loading to complete before showing prompt
    if (isLoading) {
      console.log('[NotificationPrompt] Still loading, waiting...')
      return
    }

    // Show prompt only if:
    // - show prop is true
    // - not already dismissed
    // - push notifications are supported
    // - permission hasn't been denied
    // - not already subscribed
    if (
      show &&
      !isDismissed &&
      isSupported &&
      permission !== 'denied' &&
      !isSubscribed
    ) {
      console.log('[NotificationPrompt] Showing prompt')
      // Small delay before showing for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      console.log('[NotificationPrompt] Not showing - conditions not met')
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
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 p-4',
        'transform transition-all duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-orange-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 pr-6">
            Stay Updated
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Enable notifications to get real-time updates on your order status.
          </p>

          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={handleEnable}
              isLoading={isLoading}
              className="flex-1"
            >
              Enable Notifications
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-gray-500"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPrompt
