export default defineNuxtRouteMiddleware(() => {
  // This is the classroom project's client-side route check.
  // It is not secure server-side authentication.
  if (import.meta.server) return

  const savedUser = localStorage.getItem('cropper-google-user')
  if (!savedUser) {
    return navigateTo('/login')
  }
})
