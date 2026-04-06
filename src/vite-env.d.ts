/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_UMAMI_WEBSITE_ID?: string;
  readonly NEXT_PUBLIC_UMAMI_URL?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
