import React, { FC, useState } from 'react'
import { isMatch } from '../../functions/mapping'
import {
  APIObject,
  CRMObject,
  ObjectMapping
} from '../../interfaces/mapping.interface'
import Search from '../icons/Search'
import Star from '../icons/Star'
import Tooltip from '../Tooltip'

interface MapObjectProps {
  userObjects: APIObject[]
  developerObject: CRMObject
  objectMappings: ObjectMapping[]
  onObjectSelect: (userObject: APIObject) => void
}

const MapObject: FC<MapObjectProps> = ({
  userObjects,
  developerObject,
  objectMappings,
  onObjectSelect
}) => {
  const [filteredUserObjects, setFilteredUserObjects] =
    useState<APIObject[]>(userObjects)
  return (
    <>
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
        {filteredUserObjects
          .sort((objectA, objectB) => {
            const objectAHasMatch =
              isMatch(developerObject.label, objectA.label_one) ||
              isMatch(developerObject.label, objectA.label_many)
            const objectBHasMatch =
              isMatch(developerObject.label, objectB.label_one) ||
              isMatch(developerObject.label, objectB.label_many)
            if (objectAHasMatch === objectBHasMatch) {
              return objectA.label_one.localeCompare(objectB.label_one)
            }
            if (objectAHasMatch) {
              return -1
            }
            return 1
          })
          .map((filteredUserObject) => {
            const existingMapping = objectMappings.find(
              (objectMapping) =>
                objectMapping.crm_object_id === developerObject.id &&
                objectMapping.api_object_id === filteredUserObject.id
            )

            const isSuggestedMapping =
              isMatch(developerObject.label, filteredUserObject.label_one) ||
              isMatch(developerObject.label, filteredUserObject.label_many)

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
                  'cursor-pointer',
                  isSuggestedMapping ? 'bg-yellow-50' : 'bg-white'
                ]
                  .join(' ')
                  .trim()}
                onClick={() => {
                  onObjectSelect(filteredUserObject)
                }}
              >
                <div className='px-6 py-2.5 flex items-center justify-between'>
                  <div className='break-words'>
                    {filteredUserObject.label_one}
                  </div>
                  {isSuggestedMapping ? (
                    <Tooltip
                      text={`Suggested object from your CRM`}
                      className='h-4'
                    >
                      <Star className='h-4 w-4 shrink-0 pl-3 fill-neutral-500' />
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            )
          })}
      </div>
    </>
  )
}

export default MapObject
