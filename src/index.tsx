import createXkit, { Connection, XkitJs } from '@xkit-co/xkit.js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import styles from './index.inline.css'

export interface Mapping {
  objects?: unknown
  connectionID?: string
  preselectCRMSlug?: string
}

const scopeID = 'xkit-crm-link-scope' // Should be hopefully unique enough

const scopeDiv = document.createElement('div')
scopeDiv.setAttribute('id', scopeID)
const scope = scopeDiv
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

const mountScope = () => {
  if (!document.querySelector(`#${scopeID}`)) {
    document.body.appendChild(scopeDiv)
    document.head.appendChild(appFonts)
  }
}

const renderApp = (
  visible: boolean,
  token: string | undefined,
  mapping: Mapping,
  xkit: XkitJs | undefined,
  resolve: (connection: Connection) => void,
  reject: (message: string) => void
): void => {
  ReactDOM.render(
    <App
      visible={visible}
      token={token}
      mapping={mapping}
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
    {},
    undefined,
    () => undefined,
    () => undefined
  )
}

const linkCRM = (
  domain: string,
  token: string,
  mapping: Mapping
): Promise<string> => {
  mountScope()
  const xkit = createXkit(domain)
  return new Promise((resolve, reject) => {
    if (token) {
      renderApp(
        true,
        token,
        mapping,
        xkit,
        (connection: Connection) => {
          hideModal()
          resolve(connection.id)
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
