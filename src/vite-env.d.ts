/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMOB_MODE?: 'test' | 'live'
  readonly VITE_ADMOB_ANDROID_BANNER_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
