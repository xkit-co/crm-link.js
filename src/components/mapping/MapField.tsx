import React, { FC } from 'react'
import {
  findSelectedOption,
  getSelectableCriteria,
  getTransformationIndex,
  isSelectableCriteria,
  selectorsToOptions,
  supportedTransformations
} from '../../functions/mapping'
import {
  APIObject,
  CRMObjectField,
  ObjectMapping
} from '../../interfaces/mapping.interface'
import CheckBox from '../CheckBox'
import ComboBox from '../ComboBox'
import Trash from '../icons/Trash'
import Tooltip from '../Tooltip'
import AddAdditionalProperty from './AddAdditionalProperty'

interface MapFieldProps {
  field: CRMObjectField
  fields: CRMObjectField[]
  existingFieldIndex: number
  currentUserObject: APIObject
  currentObjectMapping: ObjectMapping
  onFieldSelect: (
    value: string | boolean,
    type: string,
    slug: string,
    existingFieldIndex: number
  ) => void
  onFieldRemove: (slug: string) => void
  onDateTransformationChange: (
    value: boolean,
    existingFieldIndex: number
  ) => void
  onAddAdditionalProperty: (
    slug: string,
    parent: string,
    simple_type: { type: string; format: string | null }
  ) => void
  onRemoveAdditionalProperty: (slug: string) => void
  isNestedField: boolean
}

const MapField: FC<MapFieldProps> = ({
  field,
  fields,
  existingFieldIndex,
  currentUserObject,
  currentObjectMapping,
  onFieldSelect,
  onFieldRemove,
  onDateTransformationChange,
  onAddAdditionalProperty,
  onRemoveAdditionalProperty,
  isNestedField
}) => {
  const selected: {
    value: string | undefined
    static: boolean
  } = { value: undefined, static: false }
  if (existingFieldIndex > -1) {
    switch (currentObjectMapping.transformations[existingFieldIndex].name) {
      case 'static':
        selected.value =
          currentObjectMapping.transformations[existingFieldIndex]
            .static_value == null
            ? undefined
            : `${currentObjectMapping.transformations[existingFieldIndex].static_value}`
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
    const option = currentUserObject.selector
      ? findSelectedOption(
          selectorsToOptions([currentUserObject.selector]),
          selected.value
        )
      : undefined
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
            onChange={(value) => {
              onDateTransformationChange(value, existingFieldIndex)
            }}
          />
        )
      }
    }
  }

  const nestedFields = fields.filter(
    (individualField) =>
      individualField.parent_slug && individualField.parent_slug === field.slug
  )

  return (
    <div className='py-3' key={field.slug}>
      <div className='flex items-center justify-between'>
        <div className='break-words w-[calc(100%-28px)]'>{field.label}</div>
        {field.parent_slug ? (
          <Tooltip text={`Remove field`}>
            <Trash
              className='h-4 w-4 pl-3 shrink-0 fill-red-500 cursor-pointer'
              onClick={() => {
                onFieldRemove(field.slug)
                onRemoveAdditionalProperty(field.slug)
              }}
            />
          </Tooltip>
        ) : null}
      </div>
      <div
        className={[
          'text-xs',
          'text-neutral-500',
          field.parent_slug ? 'py-1' : 'py-2.5'
        ]
          .join(' ')
          .trim()}
      >
        {field.parent_slug ? null : field.description}
      </div>
      {nestedFields.length ? (
        <div className='pl-6'>
          {nestedFields.map((nestedField) => {
            const existingFieldIndex = getTransformationIndex(
              nestedField.slug,
              currentObjectMapping.transformations
            )
            return (
              <MapField
                field={nestedField}
                fields={fields}
                existingFieldIndex={existingFieldIndex}
                currentUserObject={currentUserObject}
                currentObjectMapping={currentObjectMapping}
                onFieldSelect={onFieldSelect}
                onFieldRemove={onFieldRemove}
                onDateTransformationChange={onDateTransformationChange}
                onAddAdditionalProperty={onAddAdditionalProperty}
                onRemoveAdditionalProperty={onRemoveAdditionalProperty}
                isNestedField={true}
                key={nestedField.slug}
              />
            )
          })}
        </div>
      ) : (
        <>
          <ComboBox
            placeholder='Choose data'
            selected={selected}
            options={
              currentUserObject.selector
                ? selectorsToOptions([currentUserObject.selector], field)
                : []
            }
            allowFiltering={true}
            allowStatic={field.simple_type.type === 'string'}
            allowStaticBoolean={field.simple_type.type === 'boolean'}
            isSelectedStaticBoolean={
              selected.static &&
              typeof currentObjectMapping.transformations[existingFieldIndex]
                .static_value === 'boolean'
            }
            criteria={(option) => {
              return isSelectableCriteria(option, field)
            }}
            getSelectableCriteria={(option) => {
              return getSelectableCriteria(option, field)
            }}
            onSelect={(value, type, staticBool) => {
              if (type === 'static' && staticBool) {
                if (value === 'true') {
                  onFieldSelect(true, 'static', field.slug, existingFieldIndex)
                } else if (value === 'false') {
                  onFieldSelect(false, 'static', field.slug, existingFieldIndex)
                }
              } else {
                onFieldSelect(value, type, field.slug, existingFieldIndex)
              }
            }}
            onDeselect={() => {
              onFieldRemove(field.slug)
            }}
          />
          {dateTransformation}
        </>
      )}
      {field.simple_type.type === 'object' &&
      !isNestedField && // Without this condition, user will be able to create nested fields inside nested fields indefinitely.
      !selected.value ? (
        <div className='pl-6'>
          {nestedFields.length ? null : (
            <div className='pt-4 text-xs text-neutral-500'>
              This field is extendable. Instead of selecting a single value from
              your CRM, you may choose to create multiple custom fields.{' '}
            </div>
          )}
          <AddAdditionalProperty
            field={field}
            fields={fields}
            onAddAdditionalProperty={onAddAdditionalProperty}
          />
        </div>
      ) : null}
    </div>
  )
}

export default MapField
