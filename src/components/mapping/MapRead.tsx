import React, { FC } from 'react'
import {
  applyRepeatedMapping,
  getTransformationIndex,
  isReadSelected,
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
import Accordion from '../Accordion'
import Button from '../Button'
import Tooltip from '../Tooltip'
import XkitBranding from '../XkitBranding'
import MapField from './MapField'
import { MapEventsByType } from './MapWrite'

declare const window: xkitBrowserWindow

interface MapReadProps {
  currentUserObject: APIObject
  developerObjects: CRMObject[]
  currentDeveloperObjectIndex: number
  objectMappings: ObjectMapping[]
  currentObjectMapping: ObjectMapping
  platformName: string
  removeBranding: boolean
  setObjectMappings: React.Dispatch<React.SetStateAction<ObjectMapping[]>>
  setCurrentObjectMapping: React.Dispatch<
    React.SetStateAction<ObjectMapping | undefined>
  >
  setDeveloperObjects: React.Dispatch<
    React.SetStateAction<CRMObject[] | undefined>
  >
  setCurrentStage: React.Dispatch<React.SetStateAction<MappingStages>>
}

const MapRead: FC<MapReadProps> = ({
  currentUserObject,
  developerObjects,
  currentDeveloperObjectIndex,
  objectMappings,
  currentObjectMapping,
  platformName,
  removeBranding,
  setObjectMappings,
  setCurrentObjectMapping,
  setDeveloperObjects,
  setCurrentStage
}) => {
  const isMappingComplete = isReadSelected(
    developerObjects[currentDeveloperObjectIndex],
    currentObjectMapping
  )
  const doneButton = (
    <Button
      text='Done'
      type={isMappingComplete ? 'primary' : 'disabled'}
      onClick={() => {
        if (isMappingComplete) {
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
  }

  return (
    <div className='flex flex-col h-[calc(100%-40px)]'>
      <div className='text-sm pt-2.5 pb-4 px-6'>
        Configure how {currentUserObject.label_many} are accessed by{' '}
        {platformName}
      </div>
      <div className='pb-2.5 grow flex flex-col overflow-y-auto'>
        <div className='grow'>
          {developerObjects[currentDeveloperObjectIndex].fields?.length ? (
            <Accordion label='Data Mapping' isFirstItem={true}>
              <div className='px-6 pb-3'>
                <div className='text-xs text-neutral-500 py-2.5'>
                  Choose fields from your CRM that correspond to the fields
                  given below by {platformName}
                </div>
                {developerObjects[currentDeveloperObjectIndex].fields
                  ?.filter((field) => !field.parent_slug)
                  .map((field) => {
                    const existingFieldIndex = getTransformationIndex(
                      field.slug,
                      currentObjectMapping.transformations
                    )
                    const modifyFieldTransformations = (
                      modification: (transformations: Transformation[]) => void,
                      callback?: (objectMapping: ObjectMapping) => void
                    ) => {
                      const clonedObjectMapping =
                        window.structuredClone<ObjectMapping>(
                          currentObjectMapping
                        )
                      modification(clonedObjectMapping.transformations)
                      if (callback) {
                        callback(clonedObjectMapping)
                      }
                      setCurrentObjectMapping(clonedObjectMapping)
                    }
                    return (
                      <MapField
                        field={field}
                        fields={
                          developerObjects[currentDeveloperObjectIndex].fields!
                        }
                        existingFieldIndex={existingFieldIndex}
                        currentUserObject={currentUserObject}
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
                            case 'empty':
                              break
                            case 'date':
                            case 'direct':
                            default:
                              transformation.source_pointer = `${value}`
                              break
                          }

                          modifyFieldTransformations(
                            (transformations) => {
                              if (existingFieldIndex > -1) {
                                transformations[existingFieldIndex] =
                                  transformation
                              } else {
                                transformations.push(transformation)
                              }
                            },
                            (currentObjectMapping) => {
                              if (type !== 'static') {
                                applyRepeatedMapping(
                                  field,
                                  developerObjects[currentDeveloperObjectIndex],
                                  currentUserObject.selector
                                    ? [currentUserObject.selector]
                                    : [],
                                  value as string,
                                  type,
                                  objectMappings,
                                  currentObjectMapping
                                )
                              }
                            }
                          )
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
                        onAddAdditionalProperty={(
                          slug,
                          parent,
                          simple_type
                        ) => {
                          const clonedDeveloperObjects =
                            window.structuredClone<CRMObject[]>(
                              developerObjects
                            )
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
                            window.structuredClone<CRMObject[]>(
                              developerObjects
                            )
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
                        isNestedField={false}
                        key={field.slug}
                      />
                    )
                  })}
              </div>
            </Accordion>
          ) : null}
          <MapEventsByType
            types={['search']}
            currentDeveloperObject={
              developerObjects[currentDeveloperObjectIndex]
            }
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

export default MapRead
