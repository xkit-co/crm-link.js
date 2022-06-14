import {
  APIObject,
  CRMObjectEvent,
  CRMObjectField,
  ObjectMapping
} from '../interfaces/mapping.interface'
import React, { FC } from 'react'
import {
  getTransformationIndex,
  isSelectableCriteria,
  selectorsToOptions
} from '../functions/mapping'
import Accordion from './Accordion'
import ComboBox from './ComboBox'

interface MapEventProps {
  event: CRMObjectEvent
  isFirstItem: boolean
  currentUserObject: APIObject
  currentObjectMapping: ObjectMapping
  existingEventIndex: number
  onPayloadFieldSelect: (
    value: string,
    type: string,
    payloadField: CRMObjectField,
    existingFieldIndex: number
  ) => void
  onEventTypeSelect: (value: string) => void
}

const MapEvent: FC<MapEventProps> = ({
  event,
  isFirstItem,
  currentUserObject,
  currentObjectMapping,
  existingEventIndex,
  onPayloadFieldSelect,
  onEventTypeSelect
}) => {
  const selectedActionType =
    existingEventIndex > -1
      ? currentObjectMapping.event_actions[existingEventIndex].action_type
      : undefined

  let eventHandlingForm = <div></div>
  if (selectedActionType === 'update') {
    eventHandlingForm = (
      <div className='pl-6'>
        {event.fields.map((field) => {
          const existingFieldIndex = getTransformationIndex(
            field.slug,
            currentObjectMapping.event_actions[existingEventIndex]
              .transformations
          )
          let selectedValue = undefined
          if (existingFieldIndex > -1) {
            switch (
              currentObjectMapping.event_actions[existingEventIndex]
                .transformations[existingFieldIndex].name
            ) {
              case 'static':
                selectedValue =
                  currentObjectMapping.event_actions[existingEventIndex]
                    .transformations[existingFieldIndex].static_value
                break
              case 'date':
              case 'direct':
              default:
                selectedValue =
                  currentObjectMapping.event_actions[existingEventIndex]
                    .transformations[existingFieldIndex].source_pointer
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
                selected={{ value: selectedValue, static: false }}
                allowFiltering={true}
                options={selectorsToOptions([currentUserObject.selector])}
                criteria={(option) => {
                  return isSelectableCriteria(option, field)
                }}
                onSelect={(value, type) => {
                  onPayloadFieldSelect(value, type, field, existingFieldIndex)
                }}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Accordion label={event.label} isFirstItem={isFirstItem}>
      <div className='px-6 pb-3'>
        <div className='text-xs text-neutral-500 py-2.5'>
          {event.description}
        </div>
        <ComboBox
          placeholder='Select action'
          selected={{ value: selectedActionType, static: false }}
          options={[{ label: 'Update existing records', value: 'update' }]}
          onSelect={(value) => {
            onEventTypeSelect(value)
          }}
        />
        {eventHandlingForm}
      </div>
    </Accordion>
  )
}

export default MapEvent
