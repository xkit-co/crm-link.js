import { Connection } from '@xkit-co/xkit.js'
import React, { FC, useEffect, useState } from 'react'
import { dummyDeveloperObjects, dummyUserObjects } from '../dummyData'
import {
  DeveloperObject,
  MappingStages,
  UserObject
} from '../interfaces/mapping.interface'
import { xkitBrowserWindow } from '../interfaces/window.interface'
import Button from './Button'
import ComboBox, { selectorsToOptions } from './ComboBox'
import Search from './icons/Search'
import MapEvent from './MapEvent'
import StepIndicator from './StepIndicator'

declare const window: xkitBrowserWindow

interface ObjectMapping {
  [userObjectKey: string]: DeveloperObject
}

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
  const [
    userObjectToDeveloperObjectMapping,
    setUserObjectToDeveloperObjectMapping
  ] = useState<ObjectMapping[]>([])
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
  const [currentDeveloperObject, setCurrentDeveloperObject] = useState<
    DeveloperObject | undefined
  >(undefined)
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
    setCurrentDeveloperObject(
      window.structuredClone<DeveloperObject>(dummyDeveloperObjects[0])
    )
    setCurrentUserObjectIndex(0)
    setCurrentStage(MappingStages.Objects)

    let countSteps = 0
    for (const object of dummyDeveloperObjects) {
      countSteps = object.events ? countSteps + 4 : countSteps + 3
    }
    setMaxSteps(countSteps)
    setCurrentStep(1)
  }, [mapping, connection])

  switch (currentStage) {
    case MappingStages.Objects:
      return currentDeveloperObject && userObjects ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='flex flex-col h-[calc(100%-40px)]'>
            <div className='text-sm py-2.5 px-6'>
              Choose an object from your CRM that you would like to map to{' '}
              {currentDeveloperObject.name}
            </div>
            <div className='text-xs text-neutral-500 py-1 px-6'>
              {currentDeveloperObject.description}
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
              {filteredUserObjects
                .filter((userObject) => {
                  for (const objectMapping of userObjectToDeveloperObjectMapping) {
                    if (
                      objectMapping[userObject.slug] &&
                      objectMapping[userObject.slug].slug ===
                        currentDeveloperObject.slug
                    ) {
                      return false
                    }
                  }
                  return true
                })
                .map((filteredUserObject) => (
                  <div
                    key={filteredUserObject.id}
                    className='border-b border-t-0 border-l-0 border-r-0 border-solid border-neutral-200 hover:bg-black/5 cursor-pointer'
                    onClick={() => {
                      setCurrentStep(currentStep + 1)
                      setCurrentUserObjectIndex(
                        userObjects.findIndex(
                          (userObject) =>
                            userObject.id === filteredUserObject.id
                        )
                      )
                      setCurrentStage(MappingStages.Fields)
                    }}
                  >
                    <div className='px-6 py-2.5'>
                      {filteredUserObject.label_one}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : null
    case MappingStages.Fields:
      return currentDeveloperObject && userObjects ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='flex flex-col h-[calc(100%-40px)]'>
            <div className='text-sm pt-2.5 pb-4 px-6'>
              Choose fields from {userObjects[currentUserObjectIndex].label_one}{' '}
              that correspond to the given fields for{' '}
              {currentDeveloperObject.name}
            </div>
            <div className='pb-2.5 px-6 overflow-y-auto'>
              {currentDeveloperObject.fields.map((field, index) => (
                <div className='py-3' key={field.slug}>
                  <div>{field.label}</div>
                  <div className='text-xs text-neutral-500 py-2.5'>
                    {field.description}
                  </div>
                  <ComboBox
                    placeholder='Choose data'
                    selected={field.selection}
                    options={selectorsToOptions(
                      userObjects[currentUserObjectIndex].selectors
                    )}
                    onSelect={(value) => {
                      const clonedDeveloperObject =
                        window.structuredClone<DeveloperObject>(
                          currentDeveloperObject
                        )
                      clonedDeveloperObject.fields[index].selection = value
                      setCurrentDeveloperObject(clonedDeveloperObject)
                    }}
                  />
                </div>
              ))}
              <div className='py-6'>
                <Button
                  text='Continue'
                  type={
                    isAllFieldsSelected(currentDeveloperObject)
                      ? 'primary'
                      : 'disabled'
                  }
                  onClick={() => {
                    if (isAllFieldsSelected(currentDeveloperObject)) {
                      setCurrentStep(currentStep + 1)
                      if (currentDeveloperObject.events) {
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
      return currentDeveloperObject && userObjects ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='flex flex-col h-[calc(100%-40px)]'>
            <div className='text-sm pt-2.5 pb-4 px-6'>
              Choose how you want to handle changes when{' '}
              {currentDeveloperObject.name} is updated
            </div>
            <div className='pb-2.5 overflow-y-auto'>
              {currentDeveloperObject.events?.map((event, index) => (
                <MapEvent
                  event={event}
                  isFirstItem={index === 0}
                  currentUserObject={userObjects[currentUserObjectIndex]}
                  onEventTypeSelect={(value) => {
                    const clonedDeveloperObject =
                      window.structuredClone<DeveloperObject>(
                        currentDeveloperObject
                      )
                    clonedDeveloperObject.events![index].selection = value
                    setCurrentDeveloperObject(clonedDeveloperObject)
                  }}
                  onPayloadFieldSelect={(value, payloadFieldIndex) => {
                    const clonedDeveloperObject =
                      window.structuredClone<DeveloperObject>(
                        currentDeveloperObject
                      )
                    clonedDeveloperObject.events![index].payloadFields[
                      payloadFieldIndex
                    ].selection = value
                    setCurrentDeveloperObject(clonedDeveloperObject)
                  }}
                  key={event.slug}
                />
              ))}
              <div className='px-6 py-6'>
                <Button
                  text='Continue'
                  type={
                    isAllEventsSelected(currentDeveloperObject)
                      ? 'primary'
                      : 'disabled'
                  }
                  onClick={() => {
                    if (isAllEventsSelected(currentDeveloperObject)) {
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
      return developerObjects && userObjects && currentDeveloperObject ? (
        <>
          <StepIndicator currentStep={currentStep} maxSteps={maxSteps} />
          <div className='text-sm pt-2.5 pb-4 px-6'>
            Would you like to map another object from your CRM to{' '}
            {currentDeveloperObject.name}?
          </div>
          <div className='py-4 px-6'>
            <Button
              text='Map another object'
              type='primary'
              onClick={() => {
                setMaxSteps(maxSteps + (currentDeveloperObject.events ? 4 : 3))
                setCurrentStep(currentStep + 1)

                updateMapping(
                  userObjects,
                  currentUserObjectIndex,
                  currentDeveloperObject,
                  userObjectToDeveloperObjectMapping,
                  setUserObjectToDeveloperObjectMapping
                )

                setCurrentDeveloperObject(
                  window.structuredClone<DeveloperObject>(
                    developerObjects[currentDeveloperObjectIndex]
                  )
                )
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

                  updateMapping(
                    userObjects,
                    currentUserObjectIndex,
                    currentDeveloperObject,
                    userObjectToDeveloperObjectMapping,
                    setUserObjectToDeveloperObjectMapping
                  )

                  resolve(connection)
                }}
              />
            ) : (
              <Button
                text='Continue setup'
                type='success'
                onClick={() => {
                  setCurrentStep(currentStep + 1)

                  updateMapping(
                    userObjects,
                    currentUserObjectIndex,
                    currentDeveloperObject,
                    userObjectToDeveloperObjectMapping,
                    setUserObjectToDeveloperObjectMapping
                  )

                  setCurrentDeveloperObject(
                    window.structuredClone<DeveloperObject>(
                      developerObjects[currentDeveloperObjectIndex + 1]
                    )
                  )
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

const updateMapping = (
  userObjects: UserObject[],
  currentUserObjectIndex: number,
  currentDeveloperObject: DeveloperObject,
  userObjectToDeveloperObjectMapping: ObjectMapping[],
  setUserObjectToDeveloperObjectMapping: React.Dispatch<
    React.SetStateAction<ObjectMapping[]>
  >
) => {
  const currentUserObject = userObjects[currentUserObjectIndex]
  setUserObjectToDeveloperObjectMapping([
    ...userObjectToDeveloperObjectMapping,
    {
      [currentUserObject.slug]: window.structuredClone<DeveloperObject>(
        currentDeveloperObject
      )
    }
  ])
}

const isAllFieldsSelected = (currentDeveloperObject: DeveloperObject) => {
  for (const field of currentDeveloperObject.fields) {
    if (!field.selection) {
      return false
    }
  }
  return true
}

const isAllEventsSelected = (currentDeveloperObject: DeveloperObject) => {
  if (!currentDeveloperObject.events) {
    return true
  }
  for (const event of currentDeveloperObject.events) {
    if (!event.selection) {
      return false
    }
    if (event.selection === 'update') {
      for (const field of event.payloadFields) {
        if (!field.selection) {
          return false
        }
      }
    }
  }
  return true
}

export default MappingScreen
