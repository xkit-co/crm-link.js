import React, { FC, useState } from 'react'
import { Event, UserObject } from '../interfaces/mapping.interface'
import Accordion from './Accordion'
import ComboBox, { selectorsToOptions } from './ComboBox'

interface MapEventProps {
  event: Event
  isFirstItem: boolean
  currentUserObject: UserObject
  onPayloadFieldSelect: (value: string, payloadFieldIndex: number) => void
  onEventTypeSelect: (value: string) => void
}

const MapEvent: FC<MapEventProps> = ({
  event,
  isFirstItem,
  currentUserObject,
  onPayloadFieldSelect,
  onEventTypeSelect
}) => {
  const [eventType, setEventType] = useState<string | undefined>(undefined)

  let eventHandlingForm = <div></div>
  if (eventType === 'update') {
    eventHandlingForm = (
      <div className='pl-6'>
        {event.payloadFields.map((field, index) => (
          <div className='py-3' key={field.slug}>
            <div>{field.label}</div>
            <div className='text-xs text-neutral-500 py-2.5'>
              {field.description}
            </div>
            <ComboBox
              placeholder='Choose data'
              selected={field.selection}
              options={selectorsToOptions(currentUserObject.selectors)}
              onSelect={(value) => {
                onPayloadFieldSelect(value, index)
              }}
            />
          </div>
        ))}
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
          selected={event.selection}
          options={[
            { label: 'Update existing records', value: 'update' },
            { label: `Don't take any action`, value: 'none' }
          ]}
          onSelect={(value) => {
            setEventType(value)
            onEventTypeSelect(value)
          }}
        />
        {eventHandlingForm}
      </div>
    </Accordion>
  )
}

export default MapEvent
