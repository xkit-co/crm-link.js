import { xkitBrowserWindow } from './interfaces/window.interface'

declare const window: xkitBrowserWindow
;(async () => {
  const { default: linkCRM } = await import('./index')
  window.linkCRM = linkCRM
})()
