import { Connection } from '@xkit-co/xkit.js'
import React, { FC, useEffect, useState } from 'react'
import {
  getTransformationIndex,
  isAllEventsSelected,
  isAllFieldsSelected,
  isObjectSelected,
  mergePreviouslyMappedNestedFields,
  removeMapping,
  updateMapping
} from '../../functions/mapping'
import {
  APIObject,
  CRMObject,
  MappingStages,
  ObjectMapping,
  Transformation
} from '../../interfaces/mapping.interface'
import { xkitBrowserWindow } from '../../interfaces/window.interface'
import Button from '../Button'
import Spinner from '../icons/Spinner'
import XkitBranding from '../XkitBranding'
import MapConfiguration from './MapConfiguration'
import MapConnection from './MapConnection'
import MapEvent from './MapEvent'
import MapField from './MapField'
import MapObject from './MapObject'
import MapObjectView from './MapObjectView'

declare const window: xkitBrowserWindow

interface MappingScreenProps {
  listCRMObjects: () => Promise<void | CRMObject[]>
  listAPIObjects: (connection: Connection) => Promise<void | APIObject[]>
  getMapping: (
    connection: Connection
  ) => Promise<void | { mapping: ObjectMapping[]; objects: CRMObject[] }>
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
  const [currentDeveloperObjectIndex, setCurrentDeveloperObjectIndex] =
    useState<number>(0)
  const [currentStage, setCurrentStage] = useState<MappingStages>(
    MappingStages.Loading
  )
  const [currentUserObjectIndex, setCurrentUserObjectIndex] =
    useState<number>(0)

  useEffect(() => {
    const loadObjects = async () => {
      const CRMObjects = await listCRMObjects()
      if (CRMObjects) {
        const APIObjects = await listAPIObjects(connection)
        if (APIObjects) {
          const getMappingResponse = await getMapping(connection)
          if (getMappingResponse) {
            const updatedCRMObjects = mergePreviouslyMappedNestedFields(
              CRMObjects,
              getMappingResponse.objects
            )
            setDeveloperObjects(updatedCRMObjects)
            setUserObjects(APIObjects)
            setCurrentDeveloperObjectIndex(0)
            setCurrentUserObjectIndex(0)
            setObjectMappings(getMappingResponse.mapping)
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
        <MapConfiguration
          connection={connection}
          developerObjects={developerObjects}
          objectMappings={objectMappings}
          onSelectConnection={() => {
            setCurrentStage(MappingStages.Connection)
          }}
          onSelectDeveloperObject={(index) => {
            setCurrentDeveloperObjectIndex(index)
            if (
              objectMappings.find(
                (objectMapping) =>
                  objectMapping.crm_object_id === developerObjects[index].id
              )
            ) {
              setCurrentStage(MappingStages.Mappings)
            } else {
              setCurrentStage(MappingStages.Objects)
            }
          }}
          saveMapping={saveMapping}
          resolve={resolve}
          removeBranding={removeBranding}
        />
      ) : null
    case MappingStages.Connection:
      return connection ? (
        <MapConnection
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
        <MapObjectView
          developerObject={developerObjects[currentDeveloperObjectIndex]}
          userObjects={userObjects}
          objectMappings={objectMappings}
          onRemoveMapping={(objectMapping, displayedObjectMappings) => {
            removeMapping(objectMapping, objectMappings, setObjectMappings)
            if (displayedObjectMappings.length === 1) {
              setCurrentStage(MappingStages.Objects)
            }
          }}
          onSelectMapping={(userObjectIndex, objectMapping, stage) => {
            setCurrentUserObjectIndex(userObjectIndex)
            setCurrentObjectMapping(objectMapping)
            setCurrentStage(stage)
          }}
          onDone={() => {
            if (
              isObjectSelected(
                developerObjects[currentDeveloperObjectIndex],
                objectMappings
              )
            ) {
              setCurrentStage(MappingStages.Configuration)
            }
          }}
          removeBranding={removeBranding}
        />
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
          <MapObject
            userObjects={userObjects}
            developerObject={developerObjects[currentDeveloperObjectIndex]}
            objectMappings={objectMappings}
            onObjectSelect={(userObject) => {
              const newObjectMapping = {
                crm_object_id: developerObjects[currentDeveloperObjectIndex].id,
                api_object_id: userObject.id,
                transformations: [],
                event_actions: []
              }
              setCurrentObjectMapping(newObjectMapping)
              updateMapping(newObjectMapping, objectMappings, setObjectMappings)
              setCurrentStage(MappingStages.Mappings)
            }}
          />
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
                  const modifyFieldTransformations = (
                    modification: (transformations: Transformation[]) => void
                  ) => {
                    const clonedObjectMapping =
                      window.structuredClone<ObjectMapping>(
                        currentObjectMapping
                      )
                    modification(clonedObjectMapping.transformations)
                    setCurrentObjectMapping(clonedObjectMapping)
                  }
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
                          modifyFieldTransformations((transformations) => {
                            transformations[existingFieldIndex].name = value
                              ? 'date'
                              : 'direct'
                          })
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

                        modifyFieldTransformations((transformations) => {
                          if (existingFieldIndex > -1) {
                            transformations[existingFieldIndex] = transformation
                          } else {
                            transformations.push(transformation)
                          }
                        })
                      }}
                      onFieldRemove={(slug) => {
                        const transformationIndex = getTransformationIndex(
                          slug,
                          currentObjectMapping.transformations
                        )
                        if (transformationIndex > -1) {
                          modifyFieldTransformations((transformations) => {
                            transformations.splice(transformationIndex, 1)
                          })
                        }
                      }}
                      onAddAdditionalProperty={(slug, parent, simple_type) => {
                        const clonedDeveloperObjects =
                          window.structuredClone<CRMObject[]>(developerObjects)
                        clonedDeveloperObjects[
                          currentDeveloperObjectIndex
                        ].fields?.push({
                          slug: `${parent}.${slug}`,
                          label: slug,
                          description: slug,
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
                  const existingEventIndex =
                    currentObjectMapping.event_actions.findIndex(
                      (existingEvent) => existingEvent.event.slug === event.slug
                    )
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
