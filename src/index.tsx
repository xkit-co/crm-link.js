import xkit, { Connection } from '@xkit-co/xkit.js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import styles from './index.inline.css'
import { xkitLibWindow } from './interfaces/window.interface'

declare const window: xkitLibWindow

const scope = document.body
  .appendChild(document.createElement('div'))
  .attachShadow({ mode: 'open' })

const appContainer = document.createElement('div')
appContainer.classList.add('xkit-root')
scope.appendChild(appContainer)

const appStyles = document.createElement('style')
appStyles.innerHTML = styles
scope.appendChild(appStyles)

const appFonts = document.createElement('link')
appFonts.setAttribute('rel', 'stylesheet')
appFonts.setAttribute(
  'href',
  'https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap'
)
document.head.appendChild(appFonts)

export const createXkit = (domain: string) => {
  window.xkit = xkit(domain)
}

const renderApp = (
  visible: boolean,
  token: string | undefined,
  resolve: (connection: Connection) => void,
  reject: (message: string) => void
): void => {
  ReactDOM.render(
    <App visible={visible} token={token} resolve={resolve} reject={reject} />,
    appContainer
  )
}

const hideModal = () => {
  renderApp(
    false,
    undefined,
    () => undefined,
    () => undefined
  )
}

const linkCRM = (token: string): Promise<Connection> => {
  return new Promise((resolve, reject) => {
    if (window.xkit && window.xkit.domain) {
      renderApp(
        true,
        token,
        (connection: Connection) => {
          hideModal()
          resolve(connection)
        },
        (message: string) => {
          hideModal()
          reject(new Error(message))
        }
      )
    } else {
      reject(
        new Error(
          'Cannot find valid Xkit object. Did you forget to use createXkit()?'
        )
      )
    }
  })
}

hideModal()

export default linkCRM
