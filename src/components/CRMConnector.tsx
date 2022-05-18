import { Connector } from '@xkit-co/xkit.js'
import React, { FC } from 'react'

interface CRMConnectorProps {
  connector: Connector
  connect: (connector: Connector) => Promise<void>
}

const CRMConnectorGridItem: FC<{ connector: Connector }> = ({ connector }) => (
  <>
    <div className='w-12 h-12'>
      <img
        className='block w-full'
        src={connector.mark_url}
        alt={connector.name}
      />
    </div>
    <div className='text-xs text-center overflow-hidden whitespace-nowrap text-ellipsis'>
      {connector.name}
    </div>
  </>
)

const CRMConnector: FC<CRMConnectorProps> = ({ connector, connect }) => {
  return (
    <div
      className='box-border border border-solid border-neutral-200 p-1.5 w-24 h-24 hover:bg-black/5 rounded cursor-pointer flex flex-col justify-center items-center'
      onClick={() => {
        connect(connector)
      }}
    >
      <CRMConnectorGridItem connector={connector} />
    </div>
  )
}

export default CRMConnector
