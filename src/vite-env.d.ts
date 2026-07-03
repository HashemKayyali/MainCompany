/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string
}

type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
  clientId?: string
}

type GoogleButtonConfiguration = {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number
  locale?: string
}

type GoogleIdentityConfiguration = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  ux_mode?: 'popup' | 'redirect'
  use_fedcm_for_prompt?: boolean
}

interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (configuration: GoogleIdentityConfiguration) => void
        renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
        disableAutoSelect?: () => void
        prompt?: () => void
      }
    }
  }
}
