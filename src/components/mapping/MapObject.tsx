import React, { FC, useState } from 'react'
import {
  APIObject,
  CRMObject,
  ObjectMapping
} from '../../interfaces/mapping.interface'
import Search from '../icons/Search'

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
        {filteredUserObjects.map((filteredUserObject) => {
          const existingMapping = objectMappings.find(
            (objectMapping) =>
              objectMapping.crm_object_id === developerObject.id &&
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
                onObjectSelect(filteredUserObject)
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
    </>
  )
}

export default MapObject
