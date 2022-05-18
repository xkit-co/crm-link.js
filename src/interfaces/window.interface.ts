import { XkitJs } from '@xkit-co/xkit.js'

export interface xkitLibWindow extends Window {
  xkit: XkitJs
}

export interface xkitBrowserWindow extends Window {
  linkCRM: (token: string) => void
  xkit: {
    init: (domain: string) => void
  }
}
