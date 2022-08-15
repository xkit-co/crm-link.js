import { Connection } from '@xkit-co/xkit.js'
import React, { FC, useState } from 'react'
import Button from '../Button'
import Rotate from '../icons/Rotate'
import Trash from '../icons/Trash'
import Pill from '../Pill'
import XkitBranding from '../XkitBranding'

interface MapConnectionProps {
  connection: Connection
  reconnect: (connection: Connection) => Promise<void>
  disconnect: (connection: Connection) => Promise<void>
  onDone: () => void
  removeBranding: boolean
}

const MapConnection: FC<MapConnectionProps> = ({
  connection,
  reconnect,
  disconnect,
  onDone,
  removeBranding
}) => {
  const [disabled, setDisabled] = useState<boolean>(false)
  const isActive =
    connection.enabled &&
    connection.authorization &&
    connection.authorization.status === 'active'

  return (
    <div className='flex flex-col h-[calc(100%-40px)]'>
      <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
        <div className='grow'>
          <div className='w-24 h-24 py-2.5 mx-auto'>
            <img
              className='block w-full'
              src={connection.connector.mark_url}
              alt={connection.connector.name}
            />
          </div>
          <div className='px-6 py-2.5 flex items-center justify-between'>
            <div className='break-words'>{connection.connector.name}</div>
            {isActive ? (
              <Pill color='green' text='active' className='ml-3' />
            ) : (
              <Pill color='orange' text='error' className='ml-3' />
            )}
          </div>
          <div className='text-xs py-2.5 px-6 text-neutral-500'>
            {connection.connector.short_description}
          </div>
          <div className='px-6 py-3 pb-4'>
            {isActive ? (
              <Button
                text={
                  <div className='flex items-center justify-center w-full'>
                    <Trash className='h-4 w-4 pr-3 shrink-0' />
                    Disconnect
                  </div>
                }
                type='secondary'
                onClick={async () => {
                  if (!disabled) {
                    setDisabled(true)
                    await disconnect(connection)
                    setDisabled(false)
                  }
                }}
              />
            ) : (
              <Button
                text={
                  <div className='flex items-center justify-center w-full'>
                    <Rotate className='h-4 w-4 pr-3 shrink-0' />
                    Reconnect
                  </div>
                }
                type='secondary'
                onClick={async () => {
                  if (!disabled) {
                    setDisabled(true)
                    await reconnect(connection)
                    setDisabled(false)
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className='px-6 pt-6 pb-4'>
          <Button
            text='Done'
            type={isActive ? 'primary' : 'disabled'}
            onClick={() => {
              if (isActive) {
                onDone()
              }
            }}
          />
        </div>
        {removeBranding ? null : <XkitBranding />}
      </div>
    </div>
  )
}

export default MapConnection
