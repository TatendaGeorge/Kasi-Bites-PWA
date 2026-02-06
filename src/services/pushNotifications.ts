import api from './api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * Check if push notifications are supported by the browser
 */
export function isSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Get the current notification permission status
 */
export function getPermission(): NotificationPermission {
  if (!isSupported()) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) {
    return 'denied'
  }
  return await Notification.requestPermission()
}

/**
 * Convert a base64 string to a Uint8Array for the applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Get the current push subscription
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  if (!isSupported()) {
    return null
  }

  const registration = await navigator.serviceWorker.ready
  return await registration.pushManager.getSubscription()
}

/**
 * Subscribe to push notifications
 */
export async function subscribe(): Promise<PushSubscription | null> {
  console.log('[Push] subscribe() called')

  if (!isSupported()) {
    console.warn('[Push] Not supported')
    return null
  }

  const permission = await requestPermission()
  console.log('[Push] Permission result:', permission)

  if (permission !== 'granted') {
    console.warn('[Push] Permission denied')
    return null
  }

  try {
    console.log('[Push] Waiting for service worker...')
    const registration = await navigator.serviceWorker.ready
    console.log('[Push] Service worker ready')

    // Get VAPID public key from env or fetch from API
    let vapidPublicKey = VAPID_PUBLIC_KEY
    console.log('[Push] VAPID from env:', vapidPublicKey ? 'present' : 'missing')

    if (!vapidPublicKey) {
      console.log('[Push] Fetching VAPID from API...')
      const response = await api.getVapidPublicKey()
      vapidPublicKey = response.public_key
      console.log('[Push] VAPID from API:', vapidPublicKey ? 'received' : 'missing')
    }

    if (!vapidPublicKey) {
      console.error('[Push] VAPID public key not available')
      return null
    }

    // Subscribe to push notifications
    console.log('[Push] Creating push subscription...')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    })
    console.log('[Push] Subscription created:', subscription.endpoint)

    // Send subscription to server
    const p256dh = subscription.getKey('p256dh')
    const auth = subscription.getKey('auth')

    if (!p256dh || !auth) {
      console.error('[Push] Failed to get subscription keys')
      return null
    }

    console.log('[Push] Sending subscription to server...')
    const result = await api.subscribeWebPush({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
        auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
      },
    })
    console.log('[Push] Server response:', result)

    return subscription
  } catch (error) {
    console.error('[Push] Failed to subscribe:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribe(): Promise<boolean> {
  try {
    const subscription = await getSubscription()
    if (!subscription) {
      return true
    }

    // Unsubscribe from browser
    await subscription.unsubscribe()

    // Remove subscription from server
    await api.unsubscribeWebPush(subscription.endpoint)

    return true
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return false
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isSubscribed(): Promise<boolean> {
  const subscription = await getSubscription()
  return subscription !== null
}

export default {
  isSupported,
  getPermission,
  requestPermission,
  getSubscription,
  subscribe,
  unsubscribe,
  isSubscribed,
}
