export interface GoogleUser {
  sub: string
  name: string
  email: string
  picture: string
}

const STORAGE_KEY = 'cropper-google-user'

export const useAuth = () => {
  const user = useState<GoogleUser | null>('cropper-auth-user', () => null)

  function saveUser(profile: GoogleUser) {
    user.value = profile
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    }
  }

  function loadUser(): GoogleUser | null {
    if (!import.meta.client) return user.value

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      user.value = saved ? JSON.parse(saved) as GoogleUser : null
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      user.value = null
    }

    return user.value
  }

  function logout() {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)

      // Prevent Google from immediately selecting the same account next time.
      const google = (window as any).google
      google?.accounts?.id?.disableAutoSelect?.()
    }
  }

  return { user, saveUser, loadUser, logout }
}
