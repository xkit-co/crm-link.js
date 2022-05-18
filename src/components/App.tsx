import { Connection, Connector } from '@xkit-co/xkit.js'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { friendlyMessage } from '../errors'
import { Screen } from '../interfaces/screen.interface'
import { xkitLibWindow } from '../interfaces/window.interface'
import ModalScreens from './ModalScreens'

declare const window: xkitLibWindow

interface AppProps {
  visible: boolean
  token: string | undefined
  resolve: (connection: Connection) => void
  reject: (message: string) => void
}

const CRMList = ['salesforce']

const App: FC<AppProps> = ({ visible, token, resolve, reject }) => {
  const [screen, setScreen] = useState<Screen>(Screen.Loading)
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [currentConnector, setCurrentConnector] = useState<
    Connector | undefined
  >(undefined)

  const connect = async (connector: Connector) => {
    if (window.xkit && window.xkit.domain) {
      try {
        setCurrentConnector(connector)
        setScreen(Screen.Connecting)
        const connection = await window.xkit.addConnection(connector.slug)
        return resolve(connection)
      } catch (error) {
        return reject(friendlyMessage(error.message))
      }
    } else {
      return reject('Could not identify session.')
    }
  }

  const fetchCRMs = useCallback(
    async (token: string) => {
      try {
        await window.xkit.login(token)
      } catch (error) {
        return reject('Could not login with token provided.')
      }

      let connectors: Connector[] = []
      try {
        connectors = await window.xkit.listConnectors()
      } catch (error) {
        return reject('Could not load available CRMs.')
      }

      const CRMs = connectors.filter((connector) =>
        CRMList.includes(connector.slug)
      )
      if (CRMs.length) {
        setConnectors(CRMs)
        setScreen(Screen.Select)
      } else {
        return reject('There are no CRMs available.')
      }
    },
    [reject]
  )

  useEffect(() => {
    if (visible && token) {
      fetchCRMs(token)
    } else {
      setCurrentConnector(undefined)
    }
    setScreen(Screen.Loading)
  }, [visible, token, fetchCRMs])

  return (
    <>
      <div
        className={[
          'fixed',
          'bg-black/50',
          'top-0',
          'left-0',
          'h-screen',
          'w-screen',
          'flex',
          'justify-center',
          'items-center',
          'z-[999]',
          visible ? '' : 'hidden'
        ]
          .join(' ')
          .trim()}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            reject('Modal was closed without adding a connection.')
          }
        }}
      >
        <div
          className={[
            'w-full',
            'h-full',
            'md:w-[360px]',
            'md:h-[610px]',
            'md:rounded-md',
            'overflow-hidden',
            'box-border',
            'bg-white',
            'z-[1000]',
            visible ? '' : 'hidden'
          ]
            .join(' ')
            .trim()}
        >
          <ModalScreens
            screen={screen}
            closeModal={() => {
              reject('Modal was closed without adding a connection.')
            }}
            connectors={connectors}
            currentConnector={currentConnector}
            connect={connect}
          />
        </div>
      </div>
    </>
  )
}

export default App
