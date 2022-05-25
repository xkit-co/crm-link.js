import createXkit, { Connection, XkitJs } from '@xkit-co/xkit.js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import styles from './index.inline.css'

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

const renderApp = (
  visible: boolean,
  token: string | undefined,
  xkit: XkitJs | undefined,
  resolve: (connection: Connection) => void,
  reject: (message: string) => void
): void => {
  ReactDOM.render(
    <App
      visible={visible}
      token={token}
      xkit={xkit}
      resolve={resolve}
      reject={reject}
    />,
    appContainer
  )
}

const hideModal = () => {
  renderApp(
    false,
    undefined,
    undefined,
    () => undefined,
    () => undefined
  )
}

const linkCRM = (domain: string, token: string): Promise<Connection> => {
  const xkit = createXkit(domain)
  return new Promise((resolve, reject) => {
    if (token) {
      renderApp(
        true,
        token,
        xkit,
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
      reject(new Error('Xkit context token not provided.'))
    }
  })
}

hideModal()

export default linkCRM
