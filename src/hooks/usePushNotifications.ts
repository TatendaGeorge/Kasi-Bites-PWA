import { useState, useEffect, useCallback } from 'react'
import pushNotifications from '@/services/pushNotifications'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported] = useState(() => {
    const supported = pushNotifications.isSupported()
    console.log('[Push] isSupported:', supported)
    return supported
  })
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    const perm = pushNotifications.getPermission()
    console.log('[Push] permission:', perm)
    return perm
  })
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check initial subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      console.log('[Push] Checking subscription status...')
      if (!isSupported) {
        console.log('[Push] Not supported, skipping check')
        setIsLoading(false)
        return
      }

      try {
        const subscribed = await pushNotifications.isSubscribed()
        console.log('[Push] isSubscribed:', subscribed)
        setIsSubscribed(subscribed)
      } catch (error) {
        console.error('[Push] Failed to check subscription status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    setIsLoading(true)
    try {
      const subscription = await pushNotifications.subscribe()
      if (subscription) {
        setIsSubscribed(true)
        setPermission(Notification.permission)
        return true
      }
      setPermission(Notification.permission)
      return false
    } catch (error) {
      console.error('Failed to subscribe:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    setIsLoading(true)
    try {
      const success = await pushNotifications.unsubscribe()
      if (success) {
        setIsSubscribed(false)
      }
      return success
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  }
}

export default usePushNotifications
