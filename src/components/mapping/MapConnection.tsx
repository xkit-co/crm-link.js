import { Connection } from '@xkit-co/xkit.js'
import React, { FC, useState } from 'react'
import Button from '../Button'
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
    connection.authorization.status !== 'error'

  return (
    <div className='flex flex-col h-[calc(100%-40px)]'>
      <div className='text-sm pt-2.5 pb-4 px-6'>
        {connection.connector.name}{' '}
        {isActive
          ? 'connection is active'
          : 'connection is not active and a reconnection might be required'}
      </div>
      <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
        <div className='grow'>
          <div className='px-6 py-3 pb-4'>
            <Button
              text='Reconnect'
              type={disabled ? 'disabled' : 'primary'}
              onClick={async () => {
                if (!disabled) {
                  setDisabled(true)
                  await reconnect(connection)
                  setDisabled(false)
                }
              }}
            />
          </div>
          <div className='px-6 py-3 pb-4'>
            <Button
              text='Disconnect'
              type={disabled ? 'disabled' : 'primary'}
              onClick={async () => {
                if (!disabled) {
                  setDisabled(true)
                  await disconnect(connection)
                  setDisabled(false)
                }
              }}
            />
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
