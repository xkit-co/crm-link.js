import { Connection, Connector } from '@xkit-co/xkit.js'
import React, { FC } from 'react'
import { Screen } from '../interfaces/screen.interface'
import CRMConnector from './CRMConnector'
import Spinner from './icons/Spinner'
import MappingScreen from './MappingScreen'
import ModalLayout from './ModalLayout'

interface ModalScreensProps {
  screen: Screen
  connectors: Connector[]
  currentConnector: Connector | undefined
  connect: (connector: Connector) => Promise<void>
  mapping: unknown | undefined
  currentConnection: Connection | undefined
  resolve: (connection: Connection) => void
}

const ModalScreens: FC<ModalScreensProps> = ({
  screen,
  connectors,
  currentConnector,
  connect,
  mapping,
  currentConnection,
  resolve
}) => {
  switch (screen) {
    case Screen.Loading: // Render skeleton loading layout
      return (
        <ModalLayout
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
        <ModalLayout title='Select your CRM'>
          {connectors.map((connector, index, connectors) => (
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
      ) : null
    case Screen.Mapping:
      return currentConnection ? (
        <MappingScreen
          mapping={mapping}
          connection={currentConnection}
          resolve={resolve}
        />
      ) : null
    default:
      return null
  }
}

export default ModalScreens
