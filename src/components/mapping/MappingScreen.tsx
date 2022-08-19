import { Connection, XkitJs } from '@xkit-co/xkit.js'
import React, { FC, useEffect, useState } from 'react'
import { Mapping } from '../..'
import {
  defaultEventActions,
  getAPIObject,
  getMapping,
  listAPIObjects,
  listCRMObjects,
  mergePreviouslyMappedNestedFields,
  removeMapping,
  stripUnneededMappings,
  updateMapping
} from '../../functions/mapping'
import {
  APIObject,
  CRMObject,
  MappingStages,
  ObjectMapping
} from '../../interfaces/mapping.interface'
import { xkitBrowserWindow } from '../../interfaces/window.interface'
import Arrow from '../icons/Arrow'
import Spinner from '../icons/Spinner'
import XkitBranding from '../XkitBranding'
import MapConfiguration from './MapConfiguration'
import MapConnection from './MapConnection'
import MapObject from './MapObject'
import MapObjectView from './MapObjectView'
import MapRead from './MapRead'
import MapWrite from './MapWrite'

declare const window: xkitBrowserWindow

interface MappingScreenProps {
  xkit?: XkitJs
  mapping: Mapping
  connection: Connection
  resolve: (connection: Connection) => void
  reject: (message: string) => void
  reconnect: (connection: Connection) => Promise<void>
  disconnect: (connection: Connection) => Promise<void>
  platformName: string
  removeBranding: boolean
}

const MappingScreen: FC<MappingScreenProps> = ({
  xkit,
  mapping,
  connection,
  resolve,
  reject,
  reconnect,
  disconnect,
  platformName,
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
      const CRMObjects = await listCRMObjects(xkit, connection, mapping, reject)
      if (CRMObjects) {
        const APIObjects = await listAPIObjects(xkit, connection, reject)
        if (APIObjects) {
          const getMappingResponse = await getMapping(xkit, connection, reject)
          if (getMappingResponse) {
            const updatedCRMObjects = mergePreviouslyMappedNestedFields(
              CRMObjects,
              getMappingResponse.objects
            )
            setDeveloperObjects(updatedCRMObjects)
            setUserObjects(APIObjects)
            setCurrentDeveloperObjectIndex(0)
            setCurrentUserObjectIndex(0)
            setObjectMappings(
              stripUnneededMappings(
                updatedCRMObjects,
                getMappingResponse.mapping
              )
            )
            setCurrentStage(MappingStages.Configuration)
          }
        }
      }
    }
    setCurrentStage(MappingStages.Loading)
    loadObjects()
  }, [xkit, mapping, connection, reject])

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
          xkit={xkit}
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
          resolve={resolve}
          reject={reject}
          removeBranding={removeBranding}
        />
      ) : null
    case MappingStages.Connection:
      return connection ? (
        <>
          <Arrow
            className='absolute top-3 left-3 w-4 h-4 block cursor-pointer rotate-180 fill-neutral-600'
            onClick={() => {
              setCurrentStage(MappingStages.Configuration)
            }}
          />
          <MapConnection
            connection={connection}
            reconnect={reconnect}
            disconnect={disconnect}
            onDone={() => {
              setCurrentStage(MappingStages.Configuration)
            }}
            removeBranding={removeBranding}
          />
        </>
      ) : null
    case MappingStages.Objects:
      return developerObjects && userObjects ? (
        <>
          <Arrow
            className='absolute top-3 left-3 w-4 h-4 block cursor-pointer rotate-180 fill-neutral-600'
            onClick={() => {
              setCurrentStage(MappingStages.Configuration)
            }}
          />
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
                  crm_object_id:
                    developerObjects[currentDeveloperObjectIndex].id,
                  api_object_id: userObject.id,
                  transformations: [],
                  event_actions: defaultEventActions(
                    developerObjects[currentDeveloperObjectIndex]
                  )
                }
                setCurrentObjectMapping(newObjectMapping)
                updateMapping(
                  newObjectMapping,
                  objectMappings,
                  setObjectMappings
                )
                setCurrentStage(MappingStages.Mappings)
              }}
            />
            {removeBranding ? null : (
              <div className='py-2.5'>
                <XkitBranding />
              </div>
            )}
          </div>
        </>
      ) : null
    case MappingStages.Mappings:
      return developerObjects && userObjects && connection ? (
        <>
          <Arrow
            className='absolute top-3 left-3 w-4 h-4 block cursor-pointer rotate-180 fill-neutral-600'
            onClick={() => {
              setCurrentStage(MappingStages.Configuration)
            }}
          />
          <MapObjectView
            developerObject={developerObjects[currentDeveloperObjectIndex]}
            userObjects={userObjects}
            objectMappings={objectMappings}
            platformName={platformName}
            connector={connection.connector}
            onRemoveMapping={(objectMapping, displayedObjectMappings) => {
              removeMapping(objectMapping, objectMappings, setObjectMappings)
              if (displayedObjectMappings.length === 1) {
                setCurrentStage(MappingStages.Objects)
              }
            }}
            onSelectMapping={async (userObjectIndex, objectMapping, stage) => {
              if (!userObjects[userObjectIndex].selector) {
                const object = await getAPIObject(
                  xkit,
                  connection,
                  userObjects[userObjectIndex].slug,
                  reject
                )
                if (object) {
                  const clonedUserObjects =
                    window.structuredClone<APIObject[]>(userObjects)
                  clonedUserObjects[userObjectIndex].selector = object.selector
                  setUserObjects(clonedUserObjects)
                }
              }
              setCurrentUserObjectIndex(userObjectIndex)
              setCurrentObjectMapping(objectMapping)
              setCurrentStage(stage)
            }}
            onDone={() => {
              setCurrentStage(MappingStages.Configuration)
            }}
            removeBranding={removeBranding}
          />
        </>
      ) : null
    case MappingStages.Read:
      return developerObjects && userObjects && currentObjectMapping ? (
        <>
          <Arrow
            className='absolute top-3 left-3 w-4 h-4 block cursor-pointer rotate-180 fill-neutral-600'
            onClick={() => {
              setCurrentStage(MappingStages.Mappings)
            }}
          />
          <MapRead
            currentUserObject={userObjects[currentUserObjectIndex]}
            developerObjects={developerObjects}
            currentDeveloperObjectIndex={currentDeveloperObjectIndex}
            objectMappings={objectMappings}
            currentObjectMapping={currentObjectMapping}
            platformName={platformName}
            removeBranding={removeBranding}
            setObjectMappings={setObjectMappings}
            setCurrentObjectMapping={setCurrentObjectMapping}
            setDeveloperObjects={setDeveloperObjects}
            setCurrentStage={setCurrentStage}
          />
        </>
      ) : null
    case MappingStages.Write:
      return developerObjects && userObjects && currentObjectMapping ? (
        <>
          <Arrow
            className='absolute top-3 left-3 w-4 h-4 block cursor-pointer rotate-180 fill-neutral-600'
            onClick={() => {
              setCurrentStage(MappingStages.Mappings)
            }}
          />
          <MapWrite
            currentUserObject={userObjects[currentUserObjectIndex]}
            currentDeveloperObject={
              developerObjects[currentDeveloperObjectIndex]
            }
            objectMappings={objectMappings}
            currentObjectMapping={currentObjectMapping}
            platformName={platformName}
            removeBranding={removeBranding}
            setObjectMappings={setObjectMappings}
            setCurrentObjectMapping={setCurrentObjectMapping}
            setCurrentStage={setCurrentStage}
          />
        </>
      ) : null
    default:
      return null
  }
}

export default MappingScreen
