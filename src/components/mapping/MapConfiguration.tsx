import { Connection, XkitJs } from '@xkit-co/xkit.js'
import React, { FC, useState } from 'react'
import {
  isAllObjectsSelected,
  isObjectSelected,
  saveMapping
} from '../../functions/mapping'
import { CRMObject, ObjectMapping } from '../../interfaces/mapping.interface'
import Button from '../Button'
import Spinner from '../icons/Spinner'
import Tick from '../icons/Tick'
import Warn from '../icons/Warn'
import Tooltip from '../Tooltip'
import XkitBranding from '../XkitBranding'

interface MapConfigurationProps {
  xkit?: XkitJs
  connection: Connection
  developerObjects: CRMObject[]
  objectMappings: ObjectMapping[]
  onSelectConnection: () => void
  onSelectDeveloperObject: (index: number) => void
  resolve: (connection: Connection) => void
  reject: (message: string) => void
  removeBranding: boolean
}

const MapConfiguration: FC<MapConfigurationProps> = ({
  xkit,
  connection,
  developerObjects,
  objectMappings,
  onSelectConnection,
  onSelectDeveloperObject,
  resolve,
  reject,
  removeBranding
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  return (
    <div className='flex flex-col h-[calc(100%-40px)]'>
      <div className='text-sm pt-2.5 pb-4 px-6'>Your CRM connection</div>
      <div
        className='mb-6 border-b border-t border-l-0 border-r-0 border-solid border-neutral-200 hover:bg-black/5 cursor-pointer'
        onClick={onSelectConnection}
      >
        <div className='px-6 py-2.5 flex items-center justify-between'>
          <div className='break-words'>{connection.connector.name}</div>
          {connection.enabled &&
          connection.authorization &&
          connection.authorization.status !== 'error' ? (
            <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
          ) : (
            <Tooltip text={`Requires attention`}>
              <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
            </Tooltip>
          )}
        </div>
      </div>
      <div className='text-sm pt-2.5 pb-4 px-6'>
        {developerObjects.length
          ? 'These objects require mapping to your CRM'
          : 'No objects have been specified for mapping'}
      </div>
      <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
        <div className='grow'>
          {developerObjects.map((developerObject, index) => (
            <div
              key={developerObject.id}
              className={[
                index === 0 ? 'border-t' : 'border-t-0',
                'border-b',
                'border-l-0',
                'border-r-0',
                'border-solid',
                'border-neutral-200',
                'hover:bg-black/5',
                'cursor-pointer'
              ]
                .join(' ')
                .trim()}
              onClick={() => {
                onSelectDeveloperObject(index)
              }}
            >
              <div className='px-6 py-2.5 flex items-center justify-between'>
                <div className='break-words'>{developerObject.label}</div>
                {isObjectSelected(developerObject, objectMappings) ? (
                  <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
                ) : (
                  <Tooltip text={`Mapping needs to be completed`}>
                    <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className='px-6 pt-6 pb-4'>
          <Button
            text={
              submitting ? <Spinner className='h-4 w-4 shrink-0' /> : 'Finish'
            }
            type={
              !submitting &&
              connection.enabled &&
              connection.authorization &&
              connection.authorization.status !== 'error' &&
              isAllObjectsSelected(developerObjects, objectMappings)
                ? 'primary'
                : 'disabled'
            }
            onClick={async () => {
              if (
                !submitting &&
                isAllObjectsSelected(developerObjects, objectMappings)
              ) {
                setSubmitting(true)
                await saveMapping(
                  xkit,
                  connection,
                  developerObjects,
                  objectMappings,
                  reject
                )
                setSubmitting(false)
                resolve(connection)
              }
            }}
          />
        </div>
        {removeBranding ? null : <XkitBranding />}
      </div>
    </div>
  )
}

export default MapConfiguration
