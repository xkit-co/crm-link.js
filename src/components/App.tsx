import { Connection, Connector, XkitJs } from '@xkit-co/xkit.js'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { friendlyMessage } from '../errors'
import { Screen } from '../interfaces/screen.interface'
import Cross from './icons/Cross'
import ModalScreens from './ModalScreens'

interface AppProps {
  visible: boolean
  token: string | undefined
  xkit: XkitJs | undefined
  resolve: (connection: Connection) => void
  reject: (message: string) => void
}

const CRMList = ['salesforce']

const App: FC<AppProps> = ({ visible, token, xkit, resolve, reject }) => {
  const [screen, setScreen] = useState<Screen>(Screen.Loading)
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [currentConnector, setCurrentConnector] = useState<
    Connector | undefined
  >(undefined)

  const connect = async (connector: Connector) => {
    if (xkit && xkit.domain) {
      try {
        setCurrentConnector(connector)
        setScreen(Screen.Connecting)
        const connection = await xkit.addConnection(connector.slug)
        return resolve(connection)
      } catch (error) {
        return reject(friendlyMessage(error.message))
      }
    } else {
      return reject('Could not identify session.')
    }
  }

  const fetchCRMs = useCallback(
    async (token: string, xkit: XkitJs) => {
      try {
        await xkit.login(token)
      } catch (error) {
        return reject('Could not login with token provided.')
      }

      let connectors: Connector[] = []
      try {
        connectors = await xkit.listConnectors()
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
    if (visible && token && xkit) {
      fetchCRMs(token, xkit)
    } else {
      setCurrentConnector(undefined)
    }
    setScreen(Screen.Loading)
  }, [visible, token, xkit, fetchCRMs])

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
          <div className='flex justify-end items-center box-border p-2.5 w-full'>
            {screen === Screen.Connecting ? ( // We don't want to show the exit button when the authorization popup is open
              <div className='w-5 h-5 block'></div>
            ) : (
              <Cross
                className='w-5 h-5 block cursor-pointer'
                onClick={() => {
                  reject('Modal was closed without adding a connection.')
                }}
              />
            )}
          </div>
          <ModalScreens
            screen={screen}
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
