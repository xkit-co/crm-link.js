import { Connection, Connector, Platform, XkitJs } from '@xkit-co/xkit.js'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { Mapping } from '..'
import { friendlyMessage } from '../functions/errors'
import { Screen } from '../interfaces/screen.interface'
import Cross from './icons/Cross'
import ModalScreens from './ModalScreens'

interface AppProps {
  visible: boolean
  token?: string
  mapping: Mapping
  xkit?: XkitJs
  resolve: (connection: Connection) => void
  reject: (message: string) => void
}

const App: FC<AppProps> = ({
  visible,
  token,
  mapping,
  xkit,
  resolve,
  reject
}) => {
  const [screen, setScreen] = useState<Screen>(Screen.Loading)
  const [platform, setPlatform] = useState<Platform | undefined>(undefined)
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [currentConnector, setCurrentConnector] = useState<
    Connector | undefined
  >(undefined)
  const [currentConnection, setCurrentConnection] = useState<
    Connection | undefined
  >(undefined)

  const connect = useCallback(
    async (connector: Connector) => {
      if (xkit && xkit.domain) {
        try {
          setCurrentConnector(connector)
          setScreen(Screen.Connecting)
          const connection = await xkit.addConnection(connector.slug)
          setCurrentConnection(connection)
          setScreen(Screen.Mapping)
        } catch (error) {
          return reject(friendlyMessage(error.message))
        }
      } else {
        return reject('Could not identify session.')
      }
    },
    [xkit, reject]
  )

  const disconnect = async (connection: Connection) => {
    if (xkit && xkit.domain) {
      try {
        await xkit.removeConnection({
          id: connection.id
        })
        return reject('User disconnected their CRM')
      } catch (error) {
        return reject(friendlyMessage(error.message))
      }
    } else {
      return reject('Could not identify session.')
    }
  }

  const reconnect = async (connection: Connection) => {
    if (xkit && xkit.domain) {
      try {
        const newConnection = await xkit.reconnect(connection)
        setCurrentConnection(newConnection)
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

      try {
        const platform = await xkit.getPlatform()
        setPlatform(platform)
      } catch (error) {
        return reject('Could not get the current platform.')
      }

      if (mapping && mapping.connectionID) {
        try {
          const connection = await xkit.getConnection({
            id: mapping.connectionID
          })
          if (connection.connector.crm) {
            setCurrentConnector(connection.connector)
            setCurrentConnection(connection)
            setScreen(Screen.Mapping)
            return
          } else {
            return reject(
              'Connection ID does not belong to a valid CRM connection'
            )
          }
        } catch (error) {
          return reject('Error while fetching existing CRM connections')
        }
      }

      let connectors: Connector[] = []
      try {
        connectors = await xkit.listConnectors()
      } catch (error) {
        return reject('Could not load available CRMs.')
      }

      const CRMs = connectors.filter((connector) => connector.crm)
      if (CRMs.length) {
        if (mapping.preselectCRMSlug) {
          const CRM = CRMs.find((CRM) => CRM.slug === mapping.preselectCRMSlug)
          if (CRM) {
            setConnectors(CRMs)
            setCurrentConnector(CRM)
            setScreen(Screen.Preselect)
            return
          }
        }
        setConnectors(CRMs)
        setScreen(Screen.Select)
      } else {
        return reject('There are no CRMs available.')
      }
    },
    [reject, mapping]
  )

  useEffect(() => {
    if (visible && token && xkit) {
      fetchCRMs(token, xkit)
    } else {
      setCurrentConnector(undefined)
      setCurrentConnection(undefined)
    }
    setScreen(Screen.Loading)
  }, [visible, token, xkit, fetchCRMs])

  return (
    <>
      <div
        className={[
          'fixed',
          'bg-black/30',
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
            'relative',
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
            xkit={xkit}
            screen={screen}
            connectors={connectors}
            currentConnector={currentConnector}
            mapping={mapping}
            connect={connect}
            reconnect={reconnect}
            disconnect={disconnect}
            currentConnection={currentConnection}
            resolve={resolve}
            reject={reject}
            removeBranding={platform ? platform.remove_branding : false}
          />
        </div>
      </div>
    </>
  )
}

export default App
