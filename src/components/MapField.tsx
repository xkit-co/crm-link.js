import React, { FC } from 'react'
import {
  findSelectedOption,
  getSelectableCriteria,
  isSelectableCriteria,
  selectorsToOptions,
  supportedTransformations
} from '../functions/mapping'
import {
  APIObject,
  CRMObjectField,
  ObjectMapping
} from '../interfaces/mapping.interface'
import CheckBox from './CheckBox'
import ComboBox from './ComboBox'

interface MapFieldProps {
  field: CRMObjectField
  existingFieldIndex: number
  currentUserObject: APIObject
  currentObjectMapping: ObjectMapping
  onFieldSelect: (value: string, type: string) => void
  onDateTransformationChange: (value: boolean) => void
}

const MapField: FC<MapFieldProps> = ({
  field,
  existingFieldIndex,
  currentUserObject,
  currentObjectMapping,
  onFieldSelect,
  onDateTransformationChange
}) => {
  const selected: {
    value: string | undefined
    static: boolean
  } = { value: undefined, static: false }
  if (existingFieldIndex > -1) {
    switch (currentObjectMapping.transformations[existingFieldIndex].name) {
      case 'static':
        selected.value =
          currentObjectMapping.transformations[existingFieldIndex].static_value
        selected.static = true
        break
      case 'date':
      case 'direct':
      default:
        selected.value =
          currentObjectMapping.transformations[
            existingFieldIndex
          ].source_pointer
        break
    }
  }

  let dateTransformation = null
  if (selected.value && !selected.static) {
    const option = findSelectedOption(
      selectorsToOptions([currentUserObject.selector]),
      selected.value
    )
    if (option) {
      const selectableCriteria = getSelectableCriteria(option, field)
      if (
        selectableCriteria &&
        selectableCriteria.transformations.includes('date')
      ) {
        let disabled = false
        const intersectionTransformations = supportedTransformations.filter(
          (transformation) =>
            selectableCriteria.transformations.includes(transformation)
        )
        if (
          intersectionTransformations.length === 1 &&
          intersectionTransformations[0] === 'date'
        ) {
          disabled = true
        }

        dateTransformation = (
          <CheckBox
            label='Convert to ISO 8601 date format'
            checked={
              currentObjectMapping.transformations[existingFieldIndex].name ===
              'date'
            }
            disabled={disabled}
            onChange={onDateTransformationChange}
          />
        )
      }
    }
  }

  return (
    <div className='py-3' key={field.slug}>
      <div>{field.label}</div>
      <div className='text-xs text-neutral-500 py-2.5'>{field.description}</div>
      <ComboBox
        placeholder='Choose data'
        selected={selected}
        options={selectorsToOptions([currentUserObject.selector])}
        allowFiltering={true}
        allowStatic={true}
        criteria={(option) => {
          return isSelectableCriteria(option, field)
        }}
        getSelectableCriteria={(option) => {
          return getSelectableCriteria(option, field)
        }}
        onSelect={onFieldSelect}
      />
      {dateTransformation}
    </div>
  )
}

export default MapField
