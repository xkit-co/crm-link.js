import createXkit from '@xkit-co/xkit.js'
import { xkitBrowserWindow } from './interfaces/window.interface'

declare const window: xkitBrowserWindow

window.xkit = window.xkit || {}
window.xkit.init = (domain: string) => {
  const xkit = createXkit(domain)
  window.xkit = {
    ...window.xkit,
    ...xkit
  }
}

window.addEventListener('load', async () => {
  const { default: linkCRM } = await import('./index')
  window.linkCRM = linkCRM
})
