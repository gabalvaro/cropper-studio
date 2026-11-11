<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type { GoogleUser } from '~/composables/useAuth'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const { saveUser, loadUser } = useAuth()

const buttonContainer = ref<HTMLElement | null>(null)
const errorMessage = ref('')
const isLoading = ref(true)

let googleScriptElement: HTMLScriptElement | null = null

function decodeGoogleCredential(token: string): GoogleUser {
  const payloadPart = token.split('.')[1]
  if (!payloadPart) {
    throw new Error('Google returned an invalid credential.')
  }

  const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
  const decoded = atob(
    base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
  )

  const payload = JSON.parse(
    decodeURIComponent(
      Array.from(decoded)
        .map(char => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
  )

  if (!payload.email || !payload.sub) {
    throw new Error('Google did not return the required account information.')
  }

  return {
    sub: payload.sub,
    name: payload.name || 'Google User',
    email: payload.email,
    picture: payload.picture || ''
  }
}

async function handleCredentialResponse(response: { credential?: string }) {
  try {
    if (!response.credential) {
      throw new Error('Google sign-in was cancelled or no credential was returned.')
    }

    const profile = decodeGoogleCredential(response.credential)
    saveUser(profile)
    await navigateTo('/')
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Unable to sign in with Google. Please try again.'
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingGoogle = (window as any).google?.accounts?.id
    if (existingGoogle) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Could not load Google Sign-In.')),
        { once: true }
      )
      return
    }

    googleScriptElement = document.createElement('script')
    googleScriptElement.src = 'https://accounts.google.com/gsi/client'
    googleScriptElement.async = true
    googleScriptElement.defer = true
    googleScriptElement.onload = () => resolve()
    googleScriptElement.onerror = () => {
      reject(new Error('Could not load Google Sign-In. Check your internet connection.'))
    }

    document.head.appendChild(googleScriptElement)
  })
}

onMounted(async () => {
  if (loadUser()) {
    await navigateTo('/')
    return
  }

  if (!config.public.googleClientId) {
    errorMessage.value = 'Google Client ID is missing. Add NUXT_PUBLIC_GOOGLE_CLIENT_ID to your .env file.'
    isLoading.value = false
    return
  }

  try {
    await loadGoogleScript()
    const google = (window as any).google

    google.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: handleCredentialResponse,
      auto_select: false
    })

    if (buttonContainer.value) {
      google.accounts.id.renderButton(buttonContainer.value, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'signin_with',
        width: 300,
        logo_alignment: 'left'
      })
    }
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Google Sign-In could not start.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  // The Google Identity script is shared by the page; do not remove it on unmount.
  googleScriptElement = null
})
</script>

<template>
  <v-main class="auth-shell">
    <div class="auth-topbar">
      <NuxtLink to="/login" class="brand-lockup" aria-label="Cropper Studio home">
        <span class="brand-mark">
          <v-icon icon="mdi-crop" size="22" />
        </span>
        <span>Cropper Studio</span>
      </NuxtLink>
      <span class="auth-topbar-note">Simple image editing, made easy</span>
    </div>

    <v-container class="auth-container">
      <v-row class="auth-layout" align="center" justify="center" no-gutters>
        <v-col cols="12" md="6" class="auth-intro">
          <div class="auth-eyebrow">
            <span class="eyebrow-dot" />
            YOUR IMAGE WORKSPACE
          </div>

          <h1 class="auth-headline">
            Make every image
            <span>fit just right.</span>
          </h1>

          <p class="auth-description">
            Crop, adjust, preview, and save your images in one clean,
            straightforward workspace.
          </p>

          <div class="auth-benefits">
            <div class="auth-benefit">
              <span class="benefit-icon"><v-icon icon="mdi-crop" /></span>
              <span>
                <strong>Precise cropping</strong>
                <small>Choose exactly what stays in frame.</small>
              </span>
            </div>
            <div class="auth-benefit">
              <span class="benefit-icon"><v-icon icon="mdi-tune-variant" /></span>
              <span>
                <strong>Simple adjustments</strong>
                <small>Rotate and zoom with a few clicks.</small>
              </span>
            </div>
            <div class="auth-benefit">
              <span class="benefit-icon"><v-icon icon="mdi-download-outline" /></span>
              <span>
                <strong>Ready to download</strong>
                <small>Preview your result before saving.</small>
              </span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="10" md="5" lg="4" class="auth-form-column">
          <v-card class="auth-card" elevation="0">
            <div class="auth-card-heading">
              <span class="auth-card-icon">
                <v-icon icon="mdi-account-outline" size="23" />
              </span>
              <h2>Welcome back</h2>
              <p>Sign in with your Google account to continue.</p>
            </div>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="comfortable"
              class="auth-error"
            >
              {{ errorMessage }}
            </v-alert>

            <div class="google-button-wrap">
              <div ref="buttonContainer" class="google-button-container" />
              <div v-if="isLoading" class="google-loading">
                <v-progress-circular indeterminate color="primary" size="20" width="2" />
                <span>Preparing secure sign-in…</span>
              </div>
            </div>

            <div class="auth-divider">
              <span />
              <small>GOOGLE ACCOUNT</small>
              <span />
            </div>

            <p class="auth-privacy">
              <v-icon icon="mdi-shield-check-outline" size="16" />
              Your account is used to access your personal editing workspace.
            </p>
          </v-card>

          <p class="auth-footer">
            Cropper Studio <span>·</span> Image editing workspace
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
