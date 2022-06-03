import { Connector } from '@xkit-co/xkit.js'
import React, { FC } from 'react'

interface CRMConnectorProps {
  connector: Connector
  lastItem: boolean
  connect: (connector: Connector) => Promise<void>
}

const CRMConnector: FC<CRMConnectorProps> = ({
  connector,
  lastItem,
  connect
}) => {
  return (
    <div
      className={[
        'box-border',
        'border-t-0',
        'border-r-0',
        'border-l-0',
        'border-solid',
        'border-neutral-200',
        'px-5',
        'py-3',
        'hover:bg-black/5',
        'cursor-pointer',
        'flex',
        'gap-4',
        'justify-start',
        'items-center',
        lastItem ? 'border-b-0' : 'border-b'
      ]
        .join(' ')
        .trim()}
      onClick={() => {
        connect(connector)
      }}
    >
      <div className='w-12 h-12 shrink-0'>
        <img
          className='block w-full'
          src={connector.mark_url}
          alt={connector.name}
        />
      </div>
      <div className='text-sm text-center overflow-hidden whitespace-nowrap text-ellipsis'>
        {connector.name}
      </div>
    </div>
  )
}

export default CRMConnector
