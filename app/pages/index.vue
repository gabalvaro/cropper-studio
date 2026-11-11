<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, loadUser, logout } = useAuth()

onMounted(() => {
  loadUser()
  if (!user.value) navigateTo('/login')
})

async function signOut() {
  logout()
  await navigateTo('/login')
}
</script>

<template>
  <v-app-bar class="studio-appbar" height="72" flat>
    <v-container class="appbar-inner d-flex align-center">
      <NuxtLink to="/" class="brand-lockup">
        <span class="brand-mark">
          <v-icon icon="mdi-crop" size="22" />
        </span>
        <span>Cropper Studio</span>
      </NuxtLink>

      <v-spacer />

      <div class="account-menu">
        <v-avatar size="34" class="account-avatar">
          <v-img v-if="user?.picture" :src="user.picture" alt="Profile photo" />
          <v-icon v-else icon="mdi-account" />
        </v-avatar>
        <span class="account-name">{{ user?.name || 'Account' }}</span>
        <v-btn
          class="signout-button"
          variant="text"
          prepend-icon="mdi-logout"
          @click="signOut"
        >
          Sign out
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>

  <v-main class="studio-page">
    <v-container class="studio-container">
      <section class="dashboard-heading">
        <div>
          <div class="section-kicker">WORKSPACE</div>
          <h1>Good to see you, {{ user?.name?.split(' ')[0] || 'there' }}.</h1>
          <p>Your image workspace is ready when you are.</p>
        </div>
        <div class="dashboard-status">
          <span class="status-dot" />
          Signed in
        </div>
      </section>

      <section class="dashboard-grid">
        <v-card class="editor-feature-card" elevation="0">
          <div class="feature-copy">
            <div class="feature-icon">
              <v-icon icon="mdi-crop" size="25" />
            </div>
            <div class="section-kicker">IMAGE TOOLS</div>
            <h2>Make your image fit.</h2>
            <p>
              Select an image, fine-tune the crop area, and download a
              polished result. Everything you need is in one place.
            </p>
            <v-btn
              class="primary-action"
              color="primary"
              size="large"
              to="/cropper"
              append-icon="mdi-arrow-right"
            >
              Open image editor
            </v-btn>
          </div>

          <div class="feature-art" aria-hidden="true">
            <div class="art-window">
              <div class="art-toolbar">
                <span />
                <span />
                <span />
              </div>
              <div class="art-photo">
                <div class="art-crop-frame">
                  <span class="crop-corner crop-corner-tl" />
                  <span class="crop-corner crop-corner-tr" />
                  <span class="crop-corner crop-corner-bl" />
                  <span class="crop-corner crop-corner-br" />
                </div>
              </div>
              <div class="art-controls">
                <i />
                <i />
                <i />
                <b />
              </div>
            </div>
          </div>
        </v-card>

        <v-card class="account-card" elevation="0">
          <div class="section-kicker">YOUR ACCOUNT</div>
          <div class="account-profile">
            <v-avatar size="54" class="profile-large">
              <v-img v-if="user?.picture" :src="user.picture" alt="Google profile photo" />
              <v-icon v-else icon="mdi-account" size="28" />
            </v-avatar>
            <div class="profile-details">
              <strong>{{ user?.name || 'Google User' }}</strong>
              <span>{{ user?.email || 'Account details unavailable' }}</span>
            </div>
          </div>
          <div class="account-divider" />
          <div class="account-confirmation">
            <span class="confirmation-icon">
              <v-icon icon="mdi-check" size="16" />
            </span>
            <div>
              <strong>Google account connected</strong>
              <small>Your session is active in this browser.</small>
            </div>
          </div>
        </v-card>
      </section>

      <section class="workflow-section">
        <div class="workflow-heading">
          <div>
            <div class="section-kicker">HOW IT WORKS</div>
            <h2>Three simple steps</h2>
          </div>
          <span class="workflow-caption">No complicated tools. Just the essentials.</span>
        </div>

        <div class="workflow-grid">
          <div class="workflow-step">
            <span class="step-number">01</span>
            <div>
              <strong>Upload</strong>
              <p>Choose an image from your device.</p>
            </div>
          </div>
          <div class="workflow-step">
            <span class="step-number">02</span>
            <div>
              <strong>Adjust</strong>
              <p>Move the crop area, rotate, or zoom.</p>
            </div>
          </div>
          <div class="workflow-step">
            <span class="step-number">03</span>
            <div>
              <strong>Download</strong>
              <p>Preview and save your cropped image.</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="studio-footer">
        <span>Cropper Studio</span>
        <span>Simple tools for better-fitting images.</span>
      </footer>
    </v-container>
  </v-main>
</template>
