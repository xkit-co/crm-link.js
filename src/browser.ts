import { xkitBrowserWindow } from './interfaces/window.interface'

declare const window: xkitBrowserWindow
;(async () => {
  const { createXkit, default: linkCRM } = await import('./index')
  window.createXkit = createXkit
  window.linkCRM = linkCRM
})()
