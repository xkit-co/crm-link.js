import { Connector } from '@xkit-co/xkit.js'
import React, { FC } from 'react'
import { Screen } from '../interfaces/screen.interface'
import CRMConnector from './CRMConnector'
import Spinner from './icons/Spinner'
import ModalLayout from './ModalLayout'

interface ModalScreensProps {
  screen: Screen
  closeModal: () => void
  connectors: Connector[]
  currentConnector: Connector | undefined
  connect: (connector: Connector) => Promise<void>
}

const ModalScreens: FC<ModalScreensProps> = ({
  screen,
  closeModal,
  connectors,
  currentConnector,
  connect
}) => {
  switch (screen) {
    case Screen.Loading:
      return (
        <>
          <div className='pt-12 pb-8'>
            <div className='animate-pulse h-8 w-56 mx-auto rounded-lg bg-neutral-300'></div>
          </div>
          <div className='px-6'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='box-border animate-pulse w-[93px] h-[93px] rounded bg-neutral-200'></div>
              <div className='box-border animate-pulse w-[93px] h-[93px] rounded bg-neutral-200'></div>
              <div className='box-border animate-pulse w-[93px] h-[93px] rounded bg-neutral-200'></div>
              <div className='box-border animate-pulse w-[93px] h-[93px] rounded bg-neutral-200'></div>
              <div className='box-border animate-pulse w-[93px] h-[93px] rounded bg-neutral-200'></div>
              <div className='box-border animate-pulse w-[93px] h-[93px] rounded bg-neutral-200'></div>
            </div>
          </div>
        </>
      )
    case Screen.Select:
      return (
        <ModalLayout closeModal={closeModal} title='Select your CRM'>
          <div className='grid grid-cols-3 gap-3'>
            {connectors.map((connector) => (
              <CRMConnector
                key={connector.slug}
                connector={connector}
                connect={connect}
              />
            ))}
          </div>
        </ModalLayout>
      )
    case Screen.Connecting:
      return currentConnector ? (
        <div className='flex flex-col justify-center items-center w-full h-full'>
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
    default:
      return null
  }
}

export default ModalScreens
