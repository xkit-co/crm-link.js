import { XkitJs } from '@xkit-co/xkit.js'

export interface xkitLibWindow extends Window {
  xkit: XkitJs
}

export interface xkitBrowserWindow extends xkitLibWindow {
  linkCRM: (token: string) => void
  createXkit: (domain: string) => void
}
