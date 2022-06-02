import { Connection } from '@xkit-co/xkit.js'
import React, { FC, useEffect, useState } from 'react'
import { dummyDeveloperObjects, dummyUserObjects } from '../dummyData'
import {
  getTransformationIndex,
  isAllEventsSelected,
  isAllFieldsSelected,
  updateMapping
} from '../functions/mapping'
import {
  DeveloperObject,
  MappingStages,
  ObjectMapping,
  Transformation,
  UserObject
} from '../interfaces/mapping.interface'
import { xkitBrowserWindow } from '../interfaces/window.interface'
import Button from './Button'
import ComboBox, { selectorsToOptions } from './ComboBox'
import Search from './icons/Search'
import Tick from './icons/Tick'
import MapEvent from './MapEvent'
import StepIndicator from './StepIndicator'

declare const window: xkitBrowserWindow

const objectMappings: ObjectMapping[] = []

interface MappingScreenProps {
  mapping: unknown | undefined
  connection: Connection
  resolve: (connection: Connection) => void
}

const MappingScreen: FC<MappingScreenProps> = ({
  mapping,
  connection,
  resolve
}) => {
  const [currentObjectMapping, setCurrentObjectMapping] = useState<
    ObjectMapping | undefined
  >(undefined)
  const [developerObjects, setDeveloperObjects] = useState<
    DeveloperObject[] | undefined
  >(undefined)
  const [userObjects, setUserObjects] = useState<UserObject[] | undefined>(
    undefined
  )
  const [filteredUserObjects, setFilteredUserObjects] = useState<UserObject[]>(
    []
  )
  const [currentDeveloperObjectIndex, setCurrentDeveloperObjectIndex] =
    useState<number>(0)
  const [currentStage, setCurrentStage] = useState<MappingStages>(
    MappingStages.Loading
  )
  const [currentUserObjectIndex, setCurrentUserObjectIndex] =
    useState<number>(0)
  const [maxSteps, setMaxSteps] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<number>(0)

  useEffect(() => {
    setDeveloperObjects(dummyDeveloperObjects)
    setUserObjects(dummyUserObjects)
    setFilteredUserObjects(dummyUserObjects)
    setCurrentDeveloperObjectIndex(0)
    setCurrentUserObjectIndex(0)
    setCurrentStage(MappingStages.Objects)

    let countSteps = 0
    for (const object of dummyDeveloperObjects) {
      countSteps = countSteps + 2
      if (object.fields) {
        countSteps = countSteps + 1
      }
      if (object.events) {
        countSteps = countSteps + 1
      }
    }
    setMaxSteps(countSteps)
    setCurrentStep(1)
  }, [mapping, connection])

  switch (currentStage) {
    case MappingStages.Objects:
      return developerObjects && userObjects ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='flex flex-col h-[calc(100%-40px)]'>
            <div className='text-sm py-2.5 px-6'>
              Choose an object from your CRM that you would like to map to{' '}
              {developerObjects[currentDeveloperObjectIndex].label}
            </div>
            <div className='text-xs text-neutral-500 py-1 px-6'>
              {developerObjects[currentDeveloperObjectIndex].description}
            </div>
            <div className='mt-3 border-b border-t border-l-0 border-r-0 border-solid border-neutral-200'>
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
            <div className='overflow-y-auto'>
              {filteredUserObjects.map((userObject, index) => {
                const existingMapping = objectMappings.find(
                  (objectMapping) =>
                    objectMapping.developerObjectId ===
                      developerObjects[currentDeveloperObjectIndex].id &&
                    objectMapping.userObjectId === userObject.id
                )

                return (
                  <div
                    key={userObject.id}
                    className='border-b border-t-0 border-l-0 border-r-0 border-solid border-neutral-200 hover:bg-black/5 cursor-pointer'
                    onClick={() => {
                      if (existingMapping) {
                        setCurrentObjectMapping(existingMapping)
                      } else {
                        setCurrentObjectMapping({
                          developerObjectId:
                            developerObjects[currentDeveloperObjectIndex].id,
                          userObjectId: userObject.id,
                          transformations: [],
                          events: []
                        })
                      }
                      setCurrentStep(currentStep + 1)
                      setCurrentUserObjectIndex(index)
                      if (
                        developerObjects[currentDeveloperObjectIndex].fields
                      ) {
                        setCurrentStage(MappingStages.Fields)
                      } else if (
                        developerObjects[currentDeveloperObjectIndex].events
                      ) {
                        setCurrentStage(MappingStages.Events)
                      } else {
                        setCurrentStage(MappingStages.RepeatDialog)
                      }
                    }}
                  >
                    <div className='px-6 py-2.5 flex items-center justify-between'>
                      <div className='break-words'>{userObject.label_one}</div>
                      {existingMapping ? (
                        <Tick className='h-4 w-4 shrink-0 pl-3' />
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : null
    case MappingStages.Fields:
      return developerObjects && userObjects && currentObjectMapping ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='flex flex-col h-[calc(100%-40px)]'>
            <div className='text-sm pt-2.5 pb-4 px-6'>
              Choose fields from {userObjects[currentUserObjectIndex].label_one}{' '}
              that correspond to the given fields for{' '}
              {developerObjects[currentDeveloperObjectIndex].label}
            </div>
            <div className='pb-2.5 px-6 overflow-y-auto'>
              {developerObjects[currentDeveloperObjectIndex].fields?.map(
                (field) => {
                  const existingFieldIndex = getTransformationIndex(
                    field.slug,
                    currentObjectMapping.transformations
                  )
                  const selected: {
                    value: string | undefined
                    static: boolean
                  } = { value: undefined, static: false }
                  if (existingFieldIndex > -1) {
                    switch (
                      currentObjectMapping.transformations[existingFieldIndex]
                        .name
                    ) {
                      case 'static':
                        selected.value =
                          currentObjectMapping.transformations[
                            existingFieldIndex
                          ].static_value
                        selected.static = true
                        break
                      case 'direct':
                      default:
                        selected.value =
                          currentObjectMapping.transformations[
                            existingFieldIndex
                          ].source_pointer
                        break
                    }
                  }

                  return (
                    <div className='py-3' key={field.slug}>
                      <div>{field.label}</div>
                      <div className='text-xs text-neutral-500 py-2.5'>
                        {field.description}
                      </div>
                      <ComboBox
                        placeholder='Choose data'
                        selected={selected}
                        options={selectorsToOptions(
                          userObjects[currentUserObjectIndex].selectors
                        )}
                        allowFiltering={true}
                        allowStatic={true}
                        onSelect={(value, type) => {
                          const transformation: Transformation = {
                            fieldSlug: field.slug,
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
                      />
                    </div>
                  )
                }
              )}
              <div className='py-6'>
                <Button
                  text='Continue'
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
                      setCurrentStep(currentStep + 1)
                      if (
                        developerObjects[currentDeveloperObjectIndex].events
                      ) {
                        setCurrentStage(MappingStages.Events)
                      } else {
                        setCurrentStage(MappingStages.RepeatDialog)
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null
    case MappingStages.Events:
      return developerObjects && userObjects && currentObjectMapping ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='flex flex-col h-[calc(100%-40px)]'>
            <div className='text-sm pt-2.5 pb-4 px-6'>
              Choose how you want to handle changes when{' '}
              {developerObjects[currentDeveloperObjectIndex].label} is updated
            </div>
            <div className='pb-2.5 overflow-y-auto'>
              {developerObjects[currentDeveloperObjectIndex].events?.map(
                (event, index) => {
                  const existingEventIndex =
                    currentObjectMapping.events.findIndex(
                      (existingEvent) => existingEvent.slug === event.slug
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
                          slug: event.slug,
                          type: event.type,
                          label: event.label,
                          description: event.description,
                          selectedActionType: value,
                          transformations: []
                        }
                        const clonedObjectMapping =
                          window.structuredClone<ObjectMapping>(
                            currentObjectMapping
                          )
                        if (existingEventIndex > -1) {
                          clonedObjectMapping.events[existingEventIndex] = {
                            ...newEvent,
                            transformations:
                              clonedObjectMapping.events[existingEventIndex]
                                .transformations
                          }
                        } else {
                          clonedObjectMapping.events.push(newEvent)
                        }
                        setCurrentObjectMapping(clonedObjectMapping)
                      }}
                      onPayloadFieldSelect={(
                        value,
                        type,
                        payloadField,
                        existingFieldIndex
                      ) => {
                        const transformation: Transformation = {
                          fieldSlug: payloadField.slug,
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

                        const clonedObjectMapping =
                          window.structuredClone<ObjectMapping>(
                            currentObjectMapping
                          )
                        if (existingFieldIndex > -1) {
                          clonedObjectMapping.events[
                            existingEventIndex
                          ].transformations[existingFieldIndex] = transformation
                        } else {
                          clonedObjectMapping.events[
                            existingEventIndex
                          ].transformations.push(transformation)
                        }
                        setCurrentObjectMapping(clonedObjectMapping)
                      }}
                      key={event.slug}
                    />
                  )
                }
              )}
              <div className='px-6 py-6'>
                <Button
                  text='Continue'
                  type={
                    isAllEventsSelected(
                      developerObjects[currentDeveloperObjectIndex],
                      currentObjectMapping.events
                    )
                      ? 'primary'
                      : 'disabled'
                  }
                  onClick={() => {
                    if (
                      isAllEventsSelected(
                        developerObjects[currentDeveloperObjectIndex],
                        currentObjectMapping.events
                      )
                    ) {
                      setCurrentStep(currentStep + 1)
                      setCurrentStage(MappingStages.RepeatDialog)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null
    case MappingStages.RepeatDialog:
      return developerObjects && userObjects && currentObjectMapping ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='text-sm pt-2.5 pb-4 px-6'>
            Would you like to map another object from your CRM to{' '}
            {developerObjects[currentDeveloperObjectIndex].label}?
          </div>
          <div className='py-4 px-6'>
            <Button
              text='Map another object'
              type='primary'
              onClick={() => {
                let extraSteps = 2
                if (developerObjects[currentDeveloperObjectIndex].fields) {
                  extraSteps = extraSteps + 1
                }
                if (developerObjects[currentDeveloperObjectIndex].events) {
                  extraSteps = extraSteps + 1
                }
                setMaxSteps(maxSteps + extraSteps)
                setCurrentStep(currentStep + 1)
                updateMapping(currentObjectMapping, objectMappings)
                setCurrentStage(MappingStages.Objects)
              }}
            />
          </div>
          <div className='py-4 px-6'>
            {currentDeveloperObjectIndex === developerObjects.length - 1 ? (
              <Button
                text='Finish setup'
                type='success'
                onClick={() => {
                  setCurrentStep(0)
                  updateMapping(currentObjectMapping, objectMappings)
                  resolve(connection)
                }}
              />
            ) : (
              <Button
                text='Continue setup'
                type='success'
                onClick={() => {
                  setCurrentStep(currentStep + 1)
                  updateMapping(currentObjectMapping, objectMappings)
                  setCurrentDeveloperObjectIndex(
                    currentDeveloperObjectIndex + 1
                  )
                  setCurrentStage(MappingStages.Objects)
                }}
              />
            )}
          </div>
        </>
      ) : null
    default:
      return null
  }
}

export default MappingScreen
