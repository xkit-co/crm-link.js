import { Connection, Connector, XkitJs } from '@xkit-co/xkit.js'
import React, { FC } from 'react'
import { Mapping } from '../interfaces/mapping.interface'
import { Screen } from '../interfaces/screen.interface'
import CRMConnector from './CRMConnector'
import Spinner from './icons/Spinner'
import MappingScreen from './mapping/MappingScreen'
import ModalLayout from './ModalLayout'
import XkitBranding from './XkitBranding'

interface ModalScreensProps {
  xkit?: XkitJs
  screen: Screen
  connectors: Connector[]
  currentConnector?: Connector
  mapping: Mapping
  connect: (connector: Connector) => Promise<void>
  reconnect: (connection: Connection) => Promise<void>
  disconnect: (connection: Connection) => Promise<void>
  currentConnection: Connection | undefined
  resolve: (connection: Connection) => void
  reject: (message: string) => void
  removeBranding: boolean
}

const ModalScreens: FC<ModalScreensProps> = ({
  xkit,
  screen,
  connectors,
  currentConnector,
  mapping,
  connect,
  reconnect,
  disconnect,
  currentConnection,
  resolve,
  reject,
  removeBranding
}) => {
  switch (screen) {
    case Screen.Loading: // Render skeleton loading layout
      return (
        <ModalLayout
          removeBranding={true}
          title={
            <div className='animate-pulse h-7 w-36 rounded-lg bg-neutral-300'></div>
          }
        >
          <div className='animate-pulse h-px w-full bg-neutral-300'></div>
          <div className='box-border px-5 py-3 w-full flex gap-4 justify-start items-center'>
            <div className='animate-pulse w-12 h-12 bg-neutral-300 rounded'></div>
            <div className='animate-pulse w-28 h-5 bg-neutral-300 rounded'></div>
          </div>
          <div className='animate-pulse h-px w-full bg-neutral-300'></div>
          <div className='box-border px-5 py-3 w-full flex gap-4 justify-start items-center'>
            <div className='animate-pulse w-12 h-12 bg-neutral-300 rounded'></div>
            <div className='animate-pulse w-28 h-5 bg-neutral-300 rounded'></div>
          </div>
          <div className='animate-pulse h-px w-full bg-neutral-300'></div>
          <div className='box-border px-5 py-3 w-full flex gap-4 justify-start items-center'>
            <div className='animate-pulse w-12 h-12 bg-neutral-300 rounded'></div>
            <div className='animate-pulse w-28 h-5 bg-neutral-300 rounded'></div>
          </div>
          <div className='animate-pulse h-px w-full bg-neutral-300'></div>
        </ModalLayout>
      )
    case Screen.Select:
      return (
        <ModalLayout
          title='Select your CRM'
          removeBranding={removeBranding}
          showBorder={true}
        >
          {connectors.map((connector, index) => (
            <CRMConnector
              key={connector.slug}
              connector={connector}
              lastItem={index === connectors.length - 1}
              connect={connect}
            />
          ))}
        </ModalLayout>
      )
    case Screen.Connecting:
      return currentConnector ? (
        <>
          <div className='flex flex-col justify-center items-center w-full h-[calc(100%-80px)]'>
            <div className='w-24 h-24'>
              <img
                className='block w-full'
                src={currentConnector.mark_url}
                alt={currentConnector.name}
              />
            </div>
            <div className='pt-2 flex items-center gap-2'>
              <Spinner className='w-6 h-6' />
              Authorizing
            </div>
          </div>
          {removeBranding ? null : (
            <div className='w-full absolute bottom-0 left-0 py-2.5'>
              <XkitBranding />
            </div>
          )}
        </>
      ) : null
    case Screen.Mapping:
      return currentConnection ? (
        <MappingScreen
          xkit={xkit}
          mapping={mapping}
          connection={currentConnection}
          resolve={resolve}
          reject={reject}
          reconnect={reconnect}
          disconnect={disconnect}
          removeBranding={removeBranding}
        />
      ) : null
    default:
      return null
  }
}

export default ModalScreens
