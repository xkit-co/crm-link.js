import React, { FC } from 'react'
import {
  isAllEventsSelected,
  isAllFieldsSelected,
  isObjectSelected
} from '../../functions/mapping'
import {
  APIObject,
  CRMObject,
  MappingStages,
  ObjectMapping
} from '../../interfaces/mapping.interface'
import Button from '../Button'
import Tick from '../icons/Tick'
import Trash from '../icons/Trash'
import Warn from '../icons/Warn'
import XkitBranding from '../XkitBranding'

interface MapObjectViewProps {
  developerObject: CRMObject
  userObjects: APIObject[]
  objectMappings: ObjectMapping[]
  onRemoveMapping: (
    objectMapping: ObjectMapping,
    displayedObjectMappings: ObjectMapping[]
  ) => void
  onSelectMapping: (
    userObjectIndex: number,
    objectMapping: ObjectMapping,
    stage: MappingStages
  ) => void
  onDone: () => void
  removeBranding: boolean
}

const MapObjectView: FC<MapObjectViewProps> = ({
  developerObject,
  userObjects,
  objectMappings,
  onRemoveMapping,
  onSelectMapping,
  onDone,
  removeBranding
}) => (
  <div className='flex flex-col h-[calc(100%-40px)]'>
    <div className='text-sm pt-2.5 pb-4 px-6'>
      The following object from your CRM is mapped to {developerObject.label}
    </div>
    <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
      <div className='grow'>
        {objectMappings
          .filter(
            (objectMapping) =>
              objectMapping.crm_object_id === developerObject.id
          )
          .map((objectMapping, index, displayedObjectMappings) => {
            const userObjectIndex = userObjects.findIndex(
              (userObject) => userObject.id === objectMapping.api_object_id
            )
            if (userObjectIndex > -1) {
              return (
                <div
                  key={userObjects[userObjectIndex].id}
                  className={[
                    displayedObjectMappings.length > 1 &&
                    index !== displayedObjectMappings.length - 1
                      ? 'border-b-0'
                      : 'border-b',
                    'border-t',
                    'border-l-0',
                    'border-r-0',
                    'border-solid',
                    'border-neutral-200'
                  ]
                    .join(' ')
                    .trim()}
                >
                  <div
                    className={[
                      'px-6',
                      'py-2.5',
                      'flex',
                      'items-center',
                      'justify-between',
                      'border-t-0',
                      'border-l-0',
                      'border-r-0',
                      'border-solid',
                      'border-neutral-100',
                      developerObject.fields ? 'border-b' : 'border-b-0'
                    ]
                      .join(' ')
                      .trim()}
                  >
                    <div className='break-words'>
                      {userObjects[userObjectIndex].label_one}
                    </div>
                    <Trash
                      className='h-4 w-4 shrink-0 pl-3 fill-red-500 cursor-pointer'
                      onClick={() => {
                        onRemoveMapping(objectMapping, displayedObjectMappings)
                      }}
                    />
                  </div>
                  {developerObject.fields ? (
                    <div
                      className={[
                        'pl-9',
                        'pr-6',
                        'py-2.5',
                        'flex',
                        'items-center',
                        'justify-between',
                        'hover:bg-black/5',
                        'cursor-pointer',
                        'border-t-0',
                        'border-l-0',
                        'border-r-0',
                        'border-solid',
                        'border-neutral-100',
                        developerObject.events ? 'border-b' : 'border-b-0'
                      ]
                        .join(' ')
                        .trim()}
                      onClick={() => {
                        onSelectMapping(
                          userObjectIndex,
                          objectMapping,
                          MappingStages.Fields
                        )
                      }}
                    >
                      <div className='text-sm break-words'>Read</div>
                      {isAllFieldsSelected(
                        developerObject,
                        objectMapping.transformations
                      ) ? (
                        <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
                      ) : (
                        <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
                      )}
                    </div>
                  ) : null}
                  {developerObject.events ? (
                    <div
                      className='pl-9 pr-6 py-2.5 flex items-center justify-between hover:bg-black/5 cursor-pointer'
                      onClick={() => {
                        onSelectMapping(
                          userObjectIndex,
                          objectMapping,
                          MappingStages.Events
                        )
                      }}
                    >
                      <div className='text-sm break-words'>Write</div>
                      {isAllEventsSelected(
                        developerObject,
                        objectMapping.event_actions
                      ) ? (
                        <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
                      ) : (
                        <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
                      )}
                    </div>
                  ) : null}
                </div>
              )
            } else {
              return null
            }
          })}
      </div>
      <div className='px-6 pt-6 pb-4'>
        <Button
          text='Done'
          type={
            isObjectSelected(developerObject, objectMappings)
              ? 'primary'
              : 'disabled'
          }
          onClick={onDone}
        />
      </div>
      {removeBranding ? null : <XkitBranding />}
    </div>
  </div>
)

export default MapObjectView
