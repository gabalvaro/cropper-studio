<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const imageElement = ref<HTMLImageElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedImageUrl = ref('')
const selectedFileName = ref('')
const croppedImageUrl = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isCropping = ref(false)
const isCropperReady = ref(false)

let cropper: any = null
let currentObjectUrl = ''

function destroyCropper() {
  isCropperReady.value = false
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
}

async function initializeCropper() {
  await nextTick()

  if (!imageElement.value || !selectedImageUrl.value) return

  destroyCropper()

  try {
    const cropperModule = await import('cropperjs')
    const Cropper = cropperModule.default

    cropper = new Cropper(imageElement.value, {
      viewMode: 1,
      dragMode: 'crop',
      autoCropArea: 0.82,
      responsive: true,
      background: false,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      guides: true,
      center: true,
      highlight: true,
      checkOrientation: true
    })
    isCropperReady.value = true
  } catch (error) {
    console.error('Cropper initialization error:', error)
    errorMessage.value = 'The image editor could not be initialized. Please refresh and try again.'
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function useSelectedFile(file?: File) {
  if (!file) return

  errorMessage.value = ''
  successMessage.value = ''
  croppedImageUrl.value = ''

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please choose a valid image file.'
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'This image is larger than 10 MB. Please choose a smaller file.'
    return
  }

  destroyCropper()

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
  }

  currentObjectUrl = URL.createObjectURL(file)
  selectedImageUrl.value = currentObjectUrl
  selectedFileName.value = file.name
}

function handleFileSelection(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  useSelectedFile(file)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  useSelectedFile(file)
}

function rotateLeft() {
  cropper?.rotate(-90)
  croppedImageUrl.value = ''
  successMessage.value = ''
}

function rotateRight() {
  cropper?.rotate(90)
  croppedImageUrl.value = ''
  successMessage.value = ''
}

function zoomIn() {
  cropper?.zoom(0.1)
  croppedImageUrl.value = ''
  successMessage.value = ''
}

function zoomOut() {
  cropper?.zoom(-0.1)
  croppedImageUrl.value = ''
  successMessage.value = ''
}

function resetCrop() {
  cropper?.reset()
  croppedImageUrl.value = ''
  successMessage.value = ''
  errorMessage.value = ''
}

function cropImage() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!cropper) {
    errorMessage.value = 'Upload an image before cropping.'
    return
  }

  isCropping.value = true

  try {
    const canvas: HTMLCanvasElement | null = cropper.getCroppedCanvas({
      maxWidth: 2400,
      maxHeight: 2400,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })

    if (!canvas) {
      throw new Error('The cropped image could not be created.')
    }

    croppedImageUrl.value = canvas.toDataURL('image/png')
    successMessage.value = 'Your image has been cropped successfully.'
  } catch (error) {
    console.error('Cropping error:', error)
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Something went wrong while cropping the image.'
  } finally {
    isCropping.value = false
  }
}

function downloadCroppedImage() {
  if (!croppedImageUrl.value) return

  const link = document.createElement('a')
  link.href = croppedImageUrl.value
  link.download = 'cropped-image.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function clearImage() {
  destroyCropper()

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = ''
  }

  selectedImageUrl.value = ''
  selectedFileName.value = ''
  croppedImageUrl.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

onBeforeUnmount(() => {
  destroyCropper()

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
  }
})
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

      <div class="editor-breadcrumb">
        <v-icon icon="mdi-chevron-right" size="18" />
        <span>Image editor</span>
      </div>

      <v-spacer />

      <v-btn
        class="back-button"
        variant="text"
        prepend-icon="mdi-arrow-left"
        to="/"
      >
        Dashboard
      </v-btn>
    </v-container>
  </v-app-bar>

  <v-main class="studio-page">
    <v-container class="studio-container editor-container">
      <header class="editor-heading">
        <div>
          <div class="section-kicker">IMAGE WORKSPACE</div>
          <h1>Crop your image</h1>
          <p>Make precise adjustments, preview your result, and download when you're ready.</p>
        </div>
        <div class="editor-library-tag">
          <v-icon icon="mdi-image-edit-outline" size="17" />
          Powered by Cropper.js
        </div>
      </header>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="comfortable"
        class="editor-alert"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        density="comfortable"
        class="editor-alert"
        closable
        @click:close="successMessage = ''"
      >
        {{ successMessage }}
      </v-alert>

      <div class="editor-layout">
        <v-card class="editor-panel" elevation="0">
          <div class="panel-heading">
            <div>
              <span class="panel-step">01</span>
              <div>
                <h2>Image canvas</h2>
                <p>Upload an image to start editing.</p>
              </div>
            </div>
            <v-btn
              v-if="selectedImageUrl"
              class="clear-image-button"
              variant="text"
              size="small"
              prepend-icon="mdi-close"
              @click="clearImage"
            >
              Remove
            </v-btn>
          </div>

          <input
            ref="fileInput"
            class="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            @change="handleFileSelection"
          />

          <button
            v-if="!selectedImageUrl"
            type="button"
            class="upload-dropzone"
            @click="openFilePicker"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <span class="upload-icon">
              <v-icon icon="mdi-cloud-upload-outline" size="28" />
            </span>
            <strong>Choose an image to upload</strong>
            <span>or drag and drop it here</span>
            <small>PNG, JPG, or WEBP · Maximum file size 10 MB</small>
            <span class="upload-browse">Browse files</span>
          </button>

          <template v-else>
            <div class="selected-file-row">
              <span class="selected-file-icon">
                <v-icon icon="mdi-image-outline" size="18" />
              </span>
              <span class="selected-file-name">{{ selectedFileName }}</span>
              <v-btn
                icon="mdi-swap-horizontal"
                variant="text"
                size="small"
                aria-label="Choose another image"
                @click="openFilePicker"
              />
            </div>

            <div class="cropper-frame">
              <img
                ref="imageElement"
                :src="selectedImageUrl"
                alt="Image selected for cropping"
                @load="initializeCropper"
                @error="errorMessage = 'This image could not be opened. Please choose another file.'"
              />
            </div>

            <div class="editor-toolbar">
              <div class="toolbar-label">ADJUST IMAGE</div>
              <div class="toolbar-actions">
                <v-tooltip text="Rotate left">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-rotate-left" variant="tonal" :disabled="!isCropperReady" aria-label="Rotate left" @click="rotateLeft" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Rotate right">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-rotate-right" variant="tonal" :disabled="!isCropperReady" aria-label="Rotate right" @click="rotateRight" />
                  </template>
                </v-tooltip>
                <span class="toolbar-separator" />
                <v-tooltip text="Zoom in">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-magnify-plus-outline" variant="tonal" :disabled="!isCropperReady" aria-label="Zoom in" @click="zoomIn" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Zoom out">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-magnify-minus-outline" variant="tonal" :disabled="!isCropperReady" aria-label="Zoom out" @click="zoomOut" />
                  </template>
                </v-tooltip>
                <span class="toolbar-separator" />
                <v-btn
                  class="reset-button"
                  variant="text"
                  prepend-icon="mdi-refresh"
                  :disabled="!isCropperReady"
                  @click="resetCrop"
                >
                  Reset
                </v-btn>
              </div>
            </div>
          </template>

          <div class="crop-action-row">
            <div class="crop-hint">
              <v-icon icon="mdi-crop" size="17" />
              <span>Drag the handles to select your crop area.</span>
            </div>
            <v-btn
              class="primary-action crop-action"
              color="primary"
              size="large"
              prepend-icon="mdi-crop"
              :disabled="!selectedImageUrl || !isCropperReady || isCropping"
              :loading="isCropping"
              @click="cropImage"
            >
              Crop image
            </v-btn>
          </div>
        </v-card>

        <aside class="result-column">
          <v-card class="result-panel" elevation="0">
            <div class="panel-heading">
              <div>
                <span class="panel-step">02</span>
                <div>
                  <h2>Preview result</h2>
                  <p>Your cropped image will appear here.</p>
                </div>
              </div>
              <span v-if="croppedImageUrl" class="ready-label">
                <span class="status-dot" />
                Ready
              </span>
            </div>

            <div v-if="croppedImageUrl" class="result-frame">
              <img :src="croppedImageUrl" alt="Cropped image preview" />
            </div>

            <div v-else class="result-placeholder">
              <span class="placeholder-icon">
                <v-icon icon="mdi-image-outline" size="30" />
              </span>
              <strong>No preview yet</strong>
              <p>Crop your image to see the finished result here.</p>
            </div>

            <v-btn
              block
              class="download-action"
              color="primary"
              size="large"
              prepend-icon="mdi-download"
              :disabled="!croppedImageUrl"
              @click="downloadCroppedImage"
            >
              Download image
            </v-btn>
          </v-card>

          <v-card class="help-panel" elevation="0">
            <div class="help-heading">
              <v-icon icon="mdi-lightbulb-outline" size="19" />
              <strong>Quick guide</strong>
            </div>
            <ol class="help-list">
              <li><span>1</span> Upload an image from your device.</li>
              <li><span>2</span> Adjust the crop area and image position.</li>
              <li><span>3</span> Crop, preview, and download your result.</li>
            </ol>
          </v-card>

          <div class="editor-footnote">
            <v-icon icon="mdi-lock-outline" size="15" />
            Images are processed in your browser and are not uploaded to a server.
          </div>
        </aside>
      </div>
    </v-container>
  </v-main>
</template>
