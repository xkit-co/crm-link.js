import { Connection } from '@xkit-co/xkit.js'
import React, { FC, useEffect, useState } from 'react'
import {
  getTransformationIndex,
  isAllEventsSelected,
  isAllFieldsSelected,
  isAllObjectsSelected,
  isObjectSelected,
  removeMapping,
  updateMapping
} from '../functions/mapping'
import {
  APIObject,
  CRMObject,
  ObjectMapping,
  Transformation
} from '../interfaces/mapping.interface'
import { xkitBrowserWindow } from '../interfaces/window.interface'
import Button from './Button'
import ConnectionStage from './ConnectionStage'
import Search from './icons/Search'
import Spinner from './icons/Spinner'
import Tick from './icons/Tick'
import Trash from './icons/Trash'
import Warn from './icons/Warn'
import MapEvent from './MapEvent'
import MapField from './MapField'
import XkitBranding from './XkitBranding'

declare const window: xkitBrowserWindow

enum MappingStages {
  Loading,
  Configuration,
  Connection,
  Mappings,
  Objects,
  Fields,
  Events
}

interface MappingScreenProps {
  listCRMObjects: () => Promise<void | CRMObject[]>
  listAPIObjects: (connection: Connection) => Promise<void | APIObject[]>
  getMapping: (connection: Connection) => Promise<void | ObjectMapping[]>
  saveMapping: (
    connection: Connection,
    CRMObjects: CRMObject[],
    objectMappings: ObjectMapping[]
  ) => Promise<void>
  connection: Connection
  resolve: (connection: Connection) => void
  reconnect: (connection: Connection) => Promise<void>
  disconnect: (connection: Connection) => Promise<void>
  removeBranding: boolean
}

const MappingScreen: FC<MappingScreenProps> = ({
  listCRMObjects,
  listAPIObjects,
  getMapping,
  saveMapping,
  connection,
  resolve,
  reconnect,
  disconnect,
  removeBranding
}) => {
  const [objectMappings, setObjectMappings] = useState<ObjectMapping[]>([])
  const [currentObjectMapping, setCurrentObjectMapping] = useState<
    ObjectMapping | undefined
  >(undefined)
  const [developerObjects, setDeveloperObjects] = useState<
    CRMObject[] | undefined
  >(undefined)
  const [userObjects, setUserObjects] = useState<APIObject[] | undefined>(
    undefined
  )
  const [filteredUserObjects, setFilteredUserObjects] = useState<APIObject[]>(
    []
  )
  const [currentDeveloperObjectIndex, setCurrentDeveloperObjectIndex] =
    useState<number>(0)
  const [currentStage, setCurrentStage] = useState<MappingStages>(
    MappingStages.Loading
  )
  const [currentUserObjectIndex, setCurrentUserObjectIndex] =
    useState<number>(0)
  const [submitting, setSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const loadObjects = async () => {
      const CRMObjects = await listCRMObjects()
      if (CRMObjects) {
        const APIObjects = await listAPIObjects(connection)
        if (APIObjects) {
          const mappings = await getMapping(connection)
          if (mappings) {
            setDeveloperObjects(CRMObjects)
            setUserObjects(APIObjects)
            setFilteredUserObjects(APIObjects)
            setCurrentDeveloperObjectIndex(0)
            setCurrentUserObjectIndex(0)
            setObjectMappings(mappings)
            setCurrentStage(MappingStages.Configuration)
          }
        }
      }
    }
    setCurrentStage(MappingStages.Loading)
    loadObjects()
  }, [listCRMObjects, listAPIObjects, getMapping, connection])

  switch (currentStage) {
    case MappingStages.Loading:
      return connection ? (
        <>
          <div className='flex flex-col justify-center items-center w-full h-[calc(100%-80px)]'>
            <div className='w-24 h-24'>
              <img
                className='block w-full'
                src={connection.connector.mark_url}
                alt={connection.connector.name}
              />
            </div>
            <div className='pt-2 flex items-center gap-2'>
              <Spinner className='w-6 h-6' />
              Fetching data
            </div>
            <div className='pt-4 text-sm'>This could take a few seconds</div>
          </div>
          {removeBranding ? null : (
            <div className='w-full absolute bottom-0 left-0 py-2.5'>
              <XkitBranding />
            </div>
          )}
        </>
      ) : null
    case MappingStages.Configuration:
      return developerObjects && connection ? (
        <div className='flex flex-col h-[calc(100%-40px)]'>
          <div className='text-sm pt-2.5 pb-4 px-6'>Your CRM connection</div>
          <div
            className='mb-6 border-b border-t border-l-0 border-r-0 border-solid border-neutral-200 hover:bg-black/5 cursor-pointer'
            onClick={() => {
              setCurrentStage(MappingStages.Connection)
            }}
          >
            <div className='px-6 py-2.5 flex items-center justify-between'>
              <div className='break-words'>{connection.connector.name}</div>
              {connection.enabled &&
              connection.authorization &&
              connection.authorization.status !== 'error' ? (
                <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
              ) : (
                <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
              )}
            </div>
          </div>
          <div className='text-sm pt-2.5 pb-4 px-6'>
            These objects require mapping to your CRM
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
                    setCurrentDeveloperObjectIndex(index)
                    if (
                      objectMappings.find(
                        (objectMapping) =>
                          objectMapping.crm_object_id === developerObject.id
                      )
                    ) {
                      setCurrentStage(MappingStages.Mappings)
                    } else {
                      setCurrentStage(MappingStages.Objects)
                    }
                  }}
                >
                  <div className='px-6 py-2.5 flex items-center justify-between'>
                    <div className='break-words'>{developerObject.label}</div>
                    {isObjectSelected(developerObject, objectMappings) ? (
                      <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
                    ) : (
                      <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className='px-6 pt-6 pb-4'>
              <Button
                text={
                  submitting ? (
                    <Spinner className='h-4 w-4 shrink-0' />
                  ) : (
                    'Finish'
                  )
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
                      connection,
                      developerObjects,
                      objectMappings
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
      ) : null
    case MappingStages.Connection:
      return connection ? (
        <ConnectionStage
          connection={connection}
          reconnect={reconnect}
          disconnect={disconnect}
          onDone={() => {
            setCurrentStage(MappingStages.Configuration)
          }}
          removeBranding={removeBranding}
        />
      ) : null
    case MappingStages.Mappings:
      return developerObjects && userObjects ? (
        <div className='flex flex-col h-[calc(100%-40px)]'>
          <div className='text-sm pt-2.5 pb-4 px-6'>
            The following object from your CRM is mapped to{' '}
            {developerObjects[currentDeveloperObjectIndex].label}
          </div>
          <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
            <div className='grow'>
              {objectMappings
                .filter(
                  (objectMapping) =>
                    objectMapping.crm_object_id ===
                    developerObjects[currentDeveloperObjectIndex].id
                )
                .map((objectMapping, index, displayedObjectMappings) => {
                  const userObjectIndex = userObjects.findIndex(
                    (userObject) =>
                      userObject.id === objectMapping.api_object_id
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
                            developerObjects[currentDeveloperObjectIndex].fields
                              ? 'border-b'
                              : 'border-b-0'
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
                              removeMapping(
                                objectMapping,
                                objectMappings,
                                setObjectMappings
                              )
                              if (displayedObjectMappings.length === 1) {
                                setCurrentStage(MappingStages.Objects)
                              }
                            }}
                          />
                        </div>
                        {developerObjects[currentDeveloperObjectIndex]
                          .fields ? (
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
                              developerObjects[currentDeveloperObjectIndex]
                                .events
                                ? 'border-b'
                                : 'border-b-0'
                            ]
                              .join(' ')
                              .trim()}
                            onClick={() => {
                              setCurrentUserObjectIndex(userObjectIndex)
                              setCurrentObjectMapping(objectMapping)
                              setCurrentStage(MappingStages.Fields)
                            }}
                          >
                            <div className='text-sm break-words'>Read</div>
                            {isAllFieldsSelected(
                              developerObjects[currentDeveloperObjectIndex],
                              objectMapping.transformations
                            ) ? (
                              <Tick className='h-4 w-4 shrink-0 pl-3 fill-emerald-500' />
                            ) : (
                              <Warn className='h-4 w-4 shrink-0 pl-3 fill-yellow-500' />
                            )}
                          </div>
                        ) : null}
                        {developerObjects[currentDeveloperObjectIndex]
                          .events ? (
                          <div
                            className='pl-9 pr-6 py-2.5 flex items-center justify-between hover:bg-black/5 cursor-pointer'
                            onClick={() => {
                              setCurrentUserObjectIndex(userObjectIndex)
                              setCurrentObjectMapping(objectMapping)
                              setCurrentStage(MappingStages.Events)
                            }}
                          >
                            <div className='text-sm break-words'>Write</div>
                            {isAllEventsSelected(
                              developerObjects[currentDeveloperObjectIndex],
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
                  isObjectSelected(
                    developerObjects[currentDeveloperObjectIndex],
                    objectMappings
                  )
                    ? 'primary'
                    : 'disabled'
                }
                onClick={() => {
                  if (
                    isObjectSelected(
                      developerObjects[currentDeveloperObjectIndex],
                      objectMappings
                    )
                  ) {
                    setCurrentStage(MappingStages.Configuration)
                  }
                }}
              />
            </div>
            {removeBranding ? null : <XkitBranding />}
          </div>
        </div>
      ) : null
    case MappingStages.Objects:
      return developerObjects && userObjects ? (
        <div className='flex flex-col h-[calc(100%-40px)]'>
          <div className='text-sm py-2.5 px-6'>
            Choose an object from your CRM that you would like to map to{' '}
            {developerObjects[currentDeveloperObjectIndex].label}
          </div>
          <div className='text-xs text-neutral-500 py-1 px-6'>
            {developerObjects[currentDeveloperObjectIndex].description}
          </div>
          <div className='mt-3 border-b-0 border-t border-l-0 border-r-0 border-solid border-neutral-200'>
            <div className='px-6 flex items-center'>
              <Search className='w-5 h-5 shrink-0 fill-neutral-400' />
              <input
                className='px-3 py-2 block w-full outline-none border-none text-base placeholder:text-neutral-500'
                placeholder='Filter'
                type='text'
                onChange={(event) => {
                  setFilteredUserObjects(
                    userObjects.filter((userObject) =>
                      userObject.label_one
                        .toLowerCase()
                        .includes(event.target.value.toLowerCase())
                    )
                  )
                }}
              />
            </div>
          </div>
          <div className='grow border-b border-t border-l-0 border-r-0 border-solid border-neutral-200 overflow-y-auto'>
            {filteredUserObjects.map((filteredUserObject) => {
              const existingMapping = objectMappings.find(
                (objectMapping) =>
                  objectMapping.crm_object_id ===
                    developerObjects[currentDeveloperObjectIndex].id &&
                  objectMapping.api_object_id === filteredUserObject.id
              )

              return existingMapping ? null : (
                <div
                  key={filteredUserObject.id}
                  className={[
                    'border-b',
                    'border-t-0',
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
                    const newObjectMapping = {
                      crm_object_id:
                        developerObjects[currentDeveloperObjectIndex].id,
                      api_object_id: filteredUserObject.id,
                      transformations: [],
                      event_actions: []
                    }
                    setCurrentObjectMapping(newObjectMapping)
                    updateMapping(
                      newObjectMapping,
                      objectMappings,
                      setObjectMappings
                    )
                    setCurrentStage(MappingStages.Mappings)
                  }}
                >
                  <div className='px-6 py-2.5 flex items-center justify-between'>
                    <div className='break-words'>
                      {filteredUserObject.label_one}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {removeBranding ? null : (
            <div className='py-2.5'>
              <XkitBranding />
            </div>
          )}
        </div>
      ) : null
    case MappingStages.Fields:
      return developerObjects && userObjects && currentObjectMapping ? (
        <div className='flex flex-col h-[calc(100%-40px)]'>
          <div className='text-sm pt-2.5 pb-4 px-6'>
            Choose fields from {userObjects[currentUserObjectIndex].label_one}{' '}
            that correspond to the given fields for{' '}
            {developerObjects[currentDeveloperObjectIndex].label}
          </div>
          <div className='pb-2.5 px-6 grow flex flex-col overflow-y-auto'>
            <div className='grow'>
              {developerObjects[currentDeveloperObjectIndex].fields
                ?.filter((field) => !field.parent_slug)
                .map((field) => {
                  const existingFieldIndex = getTransformationIndex(
                    field.slug,
                    currentObjectMapping.transformations
                  )
                  return (
                    <MapField
                      field={field}
                      fields={
                        developerObjects[currentDeveloperObjectIndex].fields!
                      }
                      existingFieldIndex={existingFieldIndex}
                      currentUserObject={userObjects[currentUserObjectIndex]}
                      currentObjectMapping={currentObjectMapping}
                      onDateTransformationChange={(
                        value,
                        existingFieldIndex
                      ) => {
                        if (existingFieldIndex > -1) {
                          const clonedObjectMapping =
                            window.structuredClone<ObjectMapping>(
                              currentObjectMapping
                            )
                          clonedObjectMapping.transformations[
                            existingFieldIndex
                          ].name = value ? 'date' : 'direct'
                          setCurrentObjectMapping(clonedObjectMapping)
                        }
                      }}
                      onFieldSelect={(
                        value,
                        type,
                        slug,
                        existingFieldIndex
                      ) => {
                        const transformation: Transformation = {
                          field: {
                            slug
                          },
                          name: type
                        }
                        switch (type) {
                          case 'static':
                            transformation.static_value = value
                            break
                          case 'date':
                          case 'direct':
                          default:
                            transformation.source_pointer = value
                            break
                        }

                        const clonedObjectMapping =
                          window.structuredClone<ObjectMapping>(
                            currentObjectMapping
                          )
                        if (existingFieldIndex > -1) {
                          clonedObjectMapping.transformations[
                            existingFieldIndex
                          ] = transformation
                        } else {
                          clonedObjectMapping.transformations.push(
                            transformation
                          )
                        }
                        setCurrentObjectMapping(clonedObjectMapping)
                      }}
                      onFieldRemove={(slug) => {
                        const transformationIndex = getTransformationIndex(
                          slug,
                          currentObjectMapping.transformations
                        )
                        if (transformationIndex > -1) {
                          const clonedObjectMapping =
                            window.structuredClone<ObjectMapping>(
                              currentObjectMapping
                            )
                          clonedObjectMapping.transformations.splice(
                            transformationIndex,
                            1
                          )
                          setCurrentObjectMapping(clonedObjectMapping)
                        }
                      }}
                      onAddAdditionalProperty={(slug, parent, simple_type) => {
                        const clonedDeveloperObjects =
                          window.structuredClone<CRMObject[]>(developerObjects)
                        clonedDeveloperObjects[
                          currentDeveloperObjectIndex
                        ].fields?.push({
                          slug,
                          label: slug,
                          description: '',
                          simple_type,
                          parent_slug: parent
                        })
                        setDeveloperObjects(clonedDeveloperObjects)
                      }}
                      onRemoveAdditionalProperty={(slug) => {
                        const clonedDeveloperObjects =
                          window.structuredClone<CRMObject[]>(developerObjects)
                        const fieldIndex = clonedDeveloperObjects[
                          currentDeveloperObjectIndex
                        ].fields?.findIndex((field) => field.slug === slug)
                        if (fieldIndex && fieldIndex > -1) {
                          clonedDeveloperObjects[
                            currentDeveloperObjectIndex
                          ].fields?.splice(fieldIndex, 1)
                        }
                        setDeveloperObjects(clonedDeveloperObjects)
                      }}
                      key={field.slug}
                    />
                  )
                })}
            </div>
            <div className='pt-6 pb-4'>
              <Button
                text='Done'
                type={
                  isAllFieldsSelected(
                    developerObjects[currentDeveloperObjectIndex],
                    currentObjectMapping.transformations
                  )
                    ? 'primary'
                    : 'disabled'
                }
                onClick={() => {
                  if (
                    isAllFieldsSelected(
                      developerObjects[currentDeveloperObjectIndex],
                      currentObjectMapping.transformations
                    )
                  ) {
                    updateMapping(
                      currentObjectMapping,
                      objectMappings,
                      setObjectMappings
                    )
                    setCurrentStage(MappingStages.Mappings)
                  }
                }}
              />
            </div>
            {removeBranding ? null : <XkitBranding />}
          </div>
        </div>
      ) : null
    case MappingStages.Events:
      return developerObjects && userObjects && currentObjectMapping ? (
        <div className='flex flex-col h-[calc(100%-40px)]'>
          <div className='text-sm pt-2.5 pb-4 px-6'>
            Choose how you want to handle events for{' '}
            {developerObjects[currentDeveloperObjectIndex].label}
          </div>
          <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
            <div className='grow'>
              {developerObjects[currentDeveloperObjectIndex].events?.map(
                (event, index) => {
                  const modifyEventTransformations = (
                    modification: (transformations: Transformation[]) => void
                  ) => {
                    const clonedObjectMapping =
                      window.structuredClone<ObjectMapping>(
                        currentObjectMapping
                      )
                    modification(
                      clonedObjectMapping.event_actions[existingEventIndex]
                        .transformations
                    )
                    setCurrentObjectMapping(clonedObjectMapping)
                  }
                  const existingEventIndex =
                    currentObjectMapping.event_actions.findIndex(
                      (existingEvent) => existingEvent.event.slug === event.slug
                    )
                  return (
                    <MapEvent
                      event={event}
                      isFirstItem={index === 0}
                      currentUserObject={userObjects[currentUserObjectIndex]}
                      currentObjectMapping={currentObjectMapping}
                      existingEventIndex={existingEventIndex}
                      onEventTypeSelect={(value) => {
                        const newEvent = {
                          event: {
                            slug: event.slug
                          },
                          action_type: value,
                          transformations: []
                        }
                        const clonedObjectMapping =
                          window.structuredClone<ObjectMapping>(
                            currentObjectMapping
                          )
                        if (existingEventIndex > -1) {
                          clonedObjectMapping.event_actions[
                            existingEventIndex
                          ] = newEvent
                        } else {
                          clonedObjectMapping.event_actions.push(newEvent)
                        }
                        setCurrentObjectMapping(clonedObjectMapping)
                      }}
                      updateAction={{
                        addUserDefinedField: () => {
                          modifyEventTransformations((transformations) => {
                            transformations.push({
                              name: 'static'
                            })
                          })
                        },
                        removeUserDefinedField: (index) => {
                          modifyEventTransformations((transformations) => {
                            transformations.splice(index, 1)
                          })
                        },
                        onUserDefinedSelectField: (value, index) => {
                          modifyEventTransformations((transformations) => {
                            transformations[index].source_pointer = value
                          })
                        },
                        onUserDefinedSelectValue: (value, index) => {
                          modifyEventTransformations((transformations) => {
                            transformations[index].static_value = value
                          })
                        },
                        onPayloadFieldSelect: (
                          value,
                          type,
                          payloadField,
                          existingFieldIndex
                        ) => {
                          const transformation: Transformation = {
                            field: { slug: payloadField.slug },
                            name: type
                          }
                          switch (type) {
                            case 'static':
                              transformation.static_value = value
                              break
                            case 'direct':
                            default:
                              transformation.source_pointer = value
                              break
                          }

                          modifyEventTransformations((transformations) => {
                            if (existingFieldIndex > -1) {
                              transformations[existingFieldIndex] =
                                transformation
                            } else {
                              transformations.push(transformation)
                            }
                          })
                        },
                        onPayloadFieldRemove: (slug) => {
                          const transformationIndex = getTransformationIndex(
                            slug,
                            currentObjectMapping.event_actions[
                              existingEventIndex
                            ].transformations
                          )
                          if (transformationIndex > -1) {
                            modifyEventTransformations((transformations) => {
                              transformations.splice(transformationIndex, 1)
                            })
                          }
                        }
                      }}
                      searchAction={{
                        addSearchFilter: () => {
                          modifyEventTransformations((transformations) => {
                            transformations.push({
                              name: 'direct'
                            })
                          })
                        },
                        onFilterSelectOperator: (value, index) => {
                          modifyEventTransformations((transformations) => {
                            transformations[index].criteria_operator = value
                          })
                        },
                        onFilterSelectPayloadValue: (value, index) => {
                          modifyEventTransformations((transformations) => {
                            transformations[index].field = {
                              slug: value
                            }
                            transformations[index].name = 'direct'
                            delete transformations[index].static_value
                          })
                        },
                        onFilterSelectStaticValue: (value, index) => {
                          modifyEventTransformations((transformations) => {
                            transformations[index].static_value = value
                            transformations[index].name = 'static'
                            delete transformations[index].field
                          })
                        }
                      }}
                      key={event.slug}
                    />
                  )
                }
              )}
            </div>
            <div className='px-6 pt-6 pb-4'>
              <Button
                text='Done'
                type={
                  isAllEventsSelected(
                    developerObjects[currentDeveloperObjectIndex],
                    currentObjectMapping.event_actions
                  )
                    ? 'primary'
                    : 'disabled'
                }
                onClick={() => {
                  if (
                    isAllEventsSelected(
                      developerObjects[currentDeveloperObjectIndex],
                      currentObjectMapping.event_actions
                    )
                  ) {
                    updateMapping(
                      currentObjectMapping,
                      objectMappings,
                      setObjectMappings
                    )
                    setCurrentStage(MappingStages.Mappings)
                  }
                }}
              />
            </div>
            {removeBranding ? null : <XkitBranding />}
          </div>
        </div>
      ) : null
    default:
      return null
  }
}

export default MappingScreen
