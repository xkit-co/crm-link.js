import React, { FC } from 'react'
import {
  getMissingRequiredCRMFields,
  getTransformationIndex,
  isWriteSelected,
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
import Tooltip from '../Tooltip'
import XkitBranding from '../XkitBranding'
import MapEvent from './MapEvent'

declare const window: xkitBrowserWindow

interface MapEventsByTypeProps {
  types: string[]
  currentDeveloperObject: CRMObject
  currentUserObject: APIObject
  currentObjectMapping: ObjectMapping
  setCurrentObjectMapping: React.Dispatch<
    React.SetStateAction<ObjectMapping | undefined>
  >
}

export const MapEventsByType: FC<MapEventsByTypeProps> = ({
  types,
  currentDeveloperObject,
  currentUserObject,
  currentObjectMapping,
  setCurrentObjectMapping
}) => (
  <>
    {currentDeveloperObject.events
      ?.filter((event) => types.includes(event.type))
      .map((event, index) => {
        /* The first item in the accordion needs a top border.
         * The first non-search event would be the first item in the 'Write' screen.
         * When there are no fields, the first search event would be the first
         * item in the 'Read' screen.
         */
        let isFirstItem = false
        if (!types.includes('search') && index === 0) {
          isFirstItem = true
        } else if (
          types.includes('search') &&
          index === 0 &&
          !currentDeveloperObject.fields?.length
        ) {
          isFirstItem = true
        }

        const existingEventIndex = currentObjectMapping.event_actions.findIndex(
          (existingEvent) => existingEvent.event.slug === event.slug
        )
        const modifyEventTransformations = (
          modification: (transformations: Transformation[]) => void
        ) => {
          const clonedObjectMapping =
            window.structuredClone<ObjectMapping>(currentObjectMapping)
          modification(
            clonedObjectMapping.event_actions[existingEventIndex]
              .transformations
          )
          setCurrentObjectMapping(clonedObjectMapping)
        }
        return (
          <MapEvent
            event={event}
            isFirstItem={isFirstItem}
            currentUserObject={currentUserObject}
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
                window.structuredClone<ObjectMapping>(currentObjectMapping)
              if (existingEventIndex > -1) {
                clonedObjectMapping.event_actions[existingEventIndex] = newEvent
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
                  delete transformations[index].static_value
                })
              },
              onUserDefinedSelectValue: (value, index) => {
                modifyEventTransformations((transformations) => {
                  transformations[index].static_value = value
                })
              },
              onDateTransformationChange: (value, existingFieldIndex) => {
                if (existingFieldIndex > -1) {
                  modifyEventTransformations((transformations) => {
                    transformations[existingFieldIndex].name = value
                      ? 'date'
                      : 'direct'
                  })
                }
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

                if (type !== 'empty') {
                  transformation.source_pointer = value
                }

                modifyEventTransformations((transformations) => {
                  if (existingFieldIndex > -1) {
                    transformations[existingFieldIndex] = transformation
                  } else {
                    transformations.push(transformation)
                  }
                })
              },
              onPayloadFieldRemove: (slug) => {
                const transformationIndex = getTransformationIndex(
                  slug,
                  currentObjectMapping.event_actions[existingEventIndex]
                    .transformations
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
                  delete transformations[index].source_pointer
                })
              },
              onFilterSelectPayloadValue: (value, index) => {
                modifyEventTransformations((transformations) => {
                  transformations[index].field = {
                    slug: value
                  }
                  transformations[index].name = 'direct'
                  delete transformations[index].source_pointer
                  delete transformations[index].static_value
                })
              },
              onFilterSelectStaticValue: (value, index) => {
                modifyEventTransformations((transformations) => {
                  transformations[index].static_value = value
                  transformations[index].name = 'static'
                  delete transformations[index].source_pointer
                  delete transformations[index].field
                })
              },
              onFilterSelectField: (value, index) => {
                modifyEventTransformations((transformations) => {
                  transformations[index].source_pointer = value
                })
              }
            }}
            key={event.slug}
          />
        )
      })}
  </>
)

interface MapWriteProps {
  currentUserObject: APIObject
  currentDeveloperObject: CRMObject
  objectMappings: ObjectMapping[]
  currentObjectMapping: ObjectMapping
  platformName: string
  removeBranding: boolean
  setObjectMappings: React.Dispatch<React.SetStateAction<ObjectMapping[]>>
  setCurrentObjectMapping: React.Dispatch<
    React.SetStateAction<ObjectMapping | undefined>
  >
  setCurrentStage: React.Dispatch<React.SetStateAction<MappingStages>>
}

const MapWrite: FC<MapWriteProps> = ({
  currentUserObject,
  currentDeveloperObject,
  objectMappings,
  currentObjectMapping,
  platformName,
  removeBranding,
  setObjectMappings,
  setCurrentObjectMapping,
  setCurrentStage
}) => {
  const isMappingComplete = isWriteSelected(
    currentDeveloperObject,
    currentObjectMapping
  )
  const missingRequiredField = getMissingRequiredCRMFields(
    currentUserObject,
    currentObjectMapping
  )

  const doneButton = (
    <Button
      text='Done'
      type={isMappingComplete && !missingRequiredField ? 'primary' : 'disabled'}
      onClick={() => {
        if (isMappingComplete && !missingRequiredField) {
          updateMapping(currentObjectMapping, objectMappings, setObjectMappings)
          setCurrentStage(MappingStages.Mappings)
        }
      }}
    />
  )
  let doneButtonWithTooltip = doneButton
  if (!isMappingComplete) {
    doneButtonWithTooltip = (
      <Tooltip text={`Mapping needs to be completed`}>{doneButton}</Tooltip>
    )
  } else if (missingRequiredField) {
    const eventLabel = currentDeveloperObject.events?.find(
      (event) => event.slug === missingRequiredField.eventSlug
    )?.label
    if (eventLabel) {
      doneButtonWithTooltip = (
        <Tooltip
          text={`${eventLabel}: Field '${missingRequiredField.missingFieldLabel}' from ${currentDeveloperObject.label} in your CRM must be mapped`}
        >
          {doneButton}
        </Tooltip>
      )
    }
  }

  return (
    <div className='flex flex-col h-[calc(100%-40px)]'>
      <div className='text-sm pt-2.5 pb-4 px-6'>
        Configure how {currentUserObject.label_many} are created, updated or
        deleted by {platformName}
      </div>
      <div className='pb-2.5 flex flex-col grow overflow-y-auto'>
        <div className='grow'>
          <MapEventsByType
            types={['create', 'update', 'delete']}
            currentDeveloperObject={currentDeveloperObject}
            currentUserObject={currentUserObject}
            currentObjectMapping={currentObjectMapping}
            setCurrentObjectMapping={setCurrentObjectMapping}
          />
        </div>
        <div className='px-6 pt-6 pb-4'>{doneButtonWithTooltip}</div>
        {removeBranding ? null : <XkitBranding />}
      </div>
    </div>
  )
}

export default MapWrite
