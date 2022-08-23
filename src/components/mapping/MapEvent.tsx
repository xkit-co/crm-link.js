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
  CRMObjectEvent,
  CRMObjectField,
  ObjectMapping
} from '../../interfaces/mapping.interface'
import Accordion from '../Accordion'
import Button from '../Button'
import CheckBox from '../CheckBox'
import ComboBox, { Option } from '../ComboBox'
import Trash from '../icons/Trash'
import Tooltip from '../Tooltip'

interface MapEventProps {
  event: CRMObjectEvent
  isFirstItem: boolean
  currentUserObject: APIObject
  currentObjectMapping: ObjectMapping
  existingEventIndex: number
  onEventTypeSelect: (value: string) => void
  updateAction: {
    addUserDefinedField: () => void
    removeUserDefinedField: (index: number) => void
    onUserDefinedSelectField: (value: string, index: number) => void
    onUserDefinedSelectValue: (value: string | boolean, index: number) => void
    onDateTransformationChange: (
      value: boolean,
      existingFieldIndex: number
    ) => void
    onPayloadFieldSelect: (
      value: string,
      type: string,
      payloadField: CRMObjectField,
      existingFieldIndex: number
    ) => void
    onPayloadFieldRemove: (slug: string) => void
  }
  searchAction: {
    addSearchFilter: () => void
    onFilterSelectOperator: (value: string, index: number) => void
    onFilterSelectPayloadValue: (value: string, index: number) => void
    onFilterSelectStaticValue: (value: string | boolean, index: number) => void
    onFilterSelectField: (value: string, index: number) => void
  }
}

const MapEvent: FC<MapEventProps> = ({
  event,
  isFirstItem,
  currentUserObject,
  currentObjectMapping,
  existingEventIndex,
  onEventTypeSelect,
  updateAction,
  searchAction
}) => {
  const selectedActionType =
    existingEventIndex > -1
      ? currentObjectMapping.event_actions[existingEventIndex].action_type
      : undefined

  let eventHandlingForm = null
  switch (selectedActionType) {
    case 'create':
    case 'update': {
      const userDefinedTransformations =
        existingEventIndex > -1
          ? currentObjectMapping.event_actions[
              existingEventIndex
            ].transformations
              .map((transformation, index) => ({
                transformation,
                index
              }))
              .filter(
                (transformation) =>
                  transformation.transformation.name === 'static'
              )
          : []
      eventHandlingForm = (
        <div className='pl-6'>
          <div className='text-xs text-neutral-500 py-2.5'>
            Select fields to {selectedActionType} in your CRM that correspond to
            these payload values
          </div>
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
                case 'date':
                case 'direct':
                default:
                  selectedValue =
                    currentObjectMapping.event_actions[existingEventIndex]
                      .transformations[existingFieldIndex].source_pointer
                  break
              }
            }

            let dateTransformation = null
            if (selectedValue) {
              const option = currentUserObject.selector
                ? findSelectedOption(
                    selectorsToOptions([currentUserObject.selector]),
                    selectedValue
                  )
                : undefined
              if (option) {
                const selectableCriteria = getSelectableCriteria(option, field)
                if (
                  selectableCriteria &&
                  selectableCriteria.transformations.includes('date')
                ) {
                  let disabled = false
                  const intersectionTransformations =
                    supportedTransformations.filter((transformation) =>
                      selectableCriteria.transformations.includes(
                        transformation
                      )
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
                        currentObjectMapping.event_actions[existingEventIndex]
                          .transformations[existingFieldIndex].name === 'date'
                      }
                      disabled={disabled}
                      onChange={(value) => {
                        updateAction.onDateTransformationChange(
                          value,
                          existingFieldIndex
                        )
                      }}
                    />
                  )
                }
              }
            }

            return (
              <div className='py-3' key={field.slug}>
                <div>{field.label}</div>
                <div className='text-xs text-neutral-500 py-2.5'>
                  {field.description}
                </div>
                <ComboBox
                  placeholder='Select field'
                  selected={{ value: selectedValue, static: false }}
                  allowFiltering={true}
                  options={
                    currentUserObject.selector
                      ? selectorsToOptions([currentUserObject.selector], field)
                      : []
                  }
                  criteria={(option) => {
                    return isSelectableCriteria(option, field)
                  }}
                  getSelectableCriteria={(option) => {
                    return getSelectableCriteria(option, field)
                  }}
                  onSelect={(value, type) => {
                    updateAction.onPayloadFieldSelect(
                      value,
                      type,
                      field,
                      existingFieldIndex
                    )
                  }}
                  onDeselect={() => {
                    updateAction.onPayloadFieldRemove(field.slug)
                  }}
                />
                {dateTransformation}
              </div>
            )
          })}
          <div className='text-xs text-neutral-500 py-2.5 mt-3 border-t border-b-0 border-l-0 border-r-0 border-solid border-neutral-200'>
            Configure fields in your CRM to {selectedActionType} with static
            values when this event is triggered
          </div>
          {userDefinedTransformations.map(({ transformation, index }) => {
            const options = currentUserObject.selector
              ? selectorsToOptions([currentUserObject.selector])
              : []
            const selectedOption = findSelectedOption(
              options,
              transformation.source_pointer
            )
            const needsBooleanValue = selectedOption
              ? isSelectableCriteria(selectedOption, {
                  simple_type: {
                    type: 'boolean',
                    format: null
                  },
                  slug: '',
                  label: '',
                  description: ''
                })
              : false
            return (
              <div
                className='py-3 flex items-center justify-between'
                key={index}
              >
                <div className='w-[120px]'>
                  <ComboBox
                    placeholder='Select field'
                    selected={{
                      value: transformation.source_pointer,
                      static: false
                    }}
                    allowFiltering={true}
                    options={options}
                    criteria={(option) => {
                      // We are okay with any field that can transform to a plain string or boolean
                      return (
                        isSelectableCriteria(option, {
                          simple_type: {
                            type: 'string',
                            format: null
                          },
                          slug: '',
                          label: '',
                          description: ''
                        }) ||
                        isSelectableCriteria(option, {
                          simple_type: {
                            type: 'boolean',
                            format: null
                          },
                          slug: '',
                          label: '',
                          description: ''
                        })
                      )
                    }}
                    onSelect={(value) => {
                      updateAction.onUserDefinedSelectField(value, index)
                    }}
                  />
                </div>
                <div className='w-[120px]'>
                  <ComboBox
                    placeholder='Static data'
                    selected={
                      transformation.static_value == null
                        ? { value: undefined, static: false }
                        : {
                            value: `${transformation.static_value}`,
                            static: true
                          }
                    }
                    allowFiltering={true}
                    allowStatic={!needsBooleanValue}
                    allowStaticBoolean={needsBooleanValue}
                    isSelectedStaticBoolean={
                      typeof transformation.static_value === 'boolean'
                    }
                    options={[]}
                    onSelect={(value, type, staticBool) => {
                      if (staticBool) {
                        if (value === 'true') {
                          updateAction.onUserDefinedSelectValue(true, index)
                        } else if (value === 'false') {
                          updateAction.onUserDefinedSelectValue(false, index)
                        }
                      } else {
                        updateAction.onUserDefinedSelectValue(value, index)
                      }
                    }}
                  />
                </div>
                <Tooltip text={`Remove field`}>
                  <Trash
                    className='h-4 w-4 shrink-0 fill-red-500 cursor-pointer'
                    onClick={() => {
                      updateAction.removeUserDefinedField(index)
                    }}
                  />
                </Tooltip>
              </div>
            )
          })}
          <div className='py-2'>
            <Button
              type='secondary'
              text='Update a field with static data'
              onClick={updateAction.addUserDefinedField}
            />
          </div>
        </div>
      )
      break
    }
    case 'search': {
      const filters =
        existingEventIndex > -1
          ? currentObjectMapping.event_actions[
              existingEventIndex
            ].transformations.map((transformation, index) => ({
              transformation,
              index
            }))
          : []
      eventHandlingForm = (
        <div className='pl-6'>
          <div className='py-2'>
            <div className='text-xs text-neutral-500 py-2.5'>
              Use filters to find records by matching fields in your CRM to
              payload or static values
            </div>
            {filters.map(({ transformation, index }) => {
              let matchField: CRMObjectField | undefined = undefined
              if (
                transformation.name !== 'static' &&
                transformation.field?.slug
              ) {
                for (const field of event.fields) {
                  if (field.slug === transformation.field.slug) {
                    matchField = field
                  }
                }
              }
              return (
                <div
                  className='px-3 py-2 my-3 rounded flex items-center justify-between border border-solid border-neutral-200'
                  key={index}
                >
                  <div>
                    <div className='py-1 flex items-center justify-between'>
                      <div className='text-sm w-[70px]'>Value</div>
                      <div className='w-[150px]'>
                        <ComboBox
                          placeholder='Choose value'
                          selected={
                            transformation.name === 'static'
                              ? {
                                  value: `${transformation.static_value}`,
                                  static: true
                                }
                              : {
                                  value: transformation.field?.slug,
                                  static: false
                                }
                          }
                          allowFiltering={true}
                          allowStatic={true}
                          allowStaticBoolean={true}
                          isSelectedStaticBoolean={
                            transformation.name === 'static' &&
                            typeof transformation.static_value === 'boolean'
                          }
                          options={event.fields.map((field) => ({
                            value: field.slug,
                            label: field.label,
                            subLabel: field.simple_type.type
                          }))}
                          onSelect={(value, type, staticBool) => {
                            if (type === 'static') {
                              if (staticBool) {
                                if (value === 'true') {
                                  searchAction.onFilterSelectStaticValue(
                                    true,
                                    index
                                  )
                                } else if (value === 'false') {
                                  searchAction.onFilterSelectStaticValue(
                                    false,
                                    index
                                  )
                                }
                              } else {
                                searchAction.onFilterSelectStaticValue(
                                  value,
                                  index
                                )
                              }
                            } else {
                              searchAction.onFilterSelectPayloadValue(
                                value,
                                index
                              )
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className='py-1 flex items-center justify-between'>
                      <div className='text-sm w-[70px]'>Operator</div>
                      <div className='w-[150px]'>
                        <ComboBox
                          placeholder='Select operator'
                          selected={{
                            value: transformation.criteria_operator,
                            static: false
                          }}
                          options={[
                            { label: 'Equals', value: 'eq' },
                            { label: 'Is part of', value: 'contains' }
                          ]}
                          onSelect={(value) => {
                            searchAction.onFilterSelectOperator(value, index)
                          }}
                        />
                      </div>
                    </div>
                    {transformation.criteria_operator &&
                    (transformation.static_value != null ||
                      transformation.field?.slug) ? (
                      <div className='py-1 flex items-center justify-between'>
                        <div className='text-sm w-[70px]'>Field</div>
                        <div className='w-[150px]'>
                          <ComboBox
                            placeholder='Select field'
                            selected={{
                              value: transformation.source_pointer,
                              static: false
                            }}
                            allowFiltering={true}
                            options={
                              currentUserObject.selector
                                ? selectorsToOptions(
                                    [currentUserObject.selector],
                                    matchField
                                  )
                                : []
                            }
                            criteria={(option) => {
                              if (matchField) {
                                return isSelectableCriteria(option, matchField)
                              } else if (
                                transformation.name === 'static' &&
                                transformation.static_value != null &&
                                typeof transformation.static_value === 'boolean'
                              ) {
                                return isSelectableCriteria(option, {
                                  simple_type: {
                                    type: 'boolean',
                                    format: null
                                  },
                                  slug: '',
                                  label: '',
                                  description: ''
                                })
                              } else if (
                                transformation.name === 'static' &&
                                transformation.static_value != null
                              ) {
                                return isSelectableCriteria(option, {
                                  simple_type: {
                                    type: 'string',
                                    format: null
                                  },
                                  slug: '',
                                  label: '',
                                  description: ''
                                })
                              }
                              return false
                            }}
                            getSelectableCriteria={(option) => {
                              if (matchField) {
                                return getSelectableCriteria(option, matchField)
                              } else if (
                                transformation.name === 'static' &&
                                transformation.static_value != null &&
                                typeof transformation.static_value === 'boolean'
                              ) {
                                return getSelectableCriteria(option, {
                                  simple_type: {
                                    type: 'boolean',
                                    format: null
                                  },
                                  slug: '',
                                  label: '',
                                  description: ''
                                })
                              } else if (
                                transformation.name === 'static' &&
                                transformation.static_value != null
                              ) {
                                return getSelectableCriteria(option, {
                                  simple_type: {
                                    type: 'string',
                                    format: null
                                  },
                                  slug: '',
                                  label: '',
                                  description: ''
                                })
                              }
                              return undefined
                            }}
                            onSelect={(value) => {
                              searchAction.onFilterSelectField(value, index)
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <Tooltip text={`Remove filter`}>
                    <Trash
                      className='h-4 w-4 shrink-0 fill-red-500 cursor-pointer'
                      onClick={() => {
                        updateAction.removeUserDefinedField(index)
                      }}
                    />
                  </Tooltip>
                </div>
              )
            })}
            <Button
              type='secondary'
              text='Add a search filter'
              onClick={searchAction.addSearchFilter}
            />
          </div>
        </div>
      )
      break
    }
    default:
      break
  }

  let availableActions: Option[] = []
  switch (event.type) {
    case 'update':
      availableActions = [
        {
          label: `Update an existing ${currentUserObject.label_one}`,
          value: 'update'
        }
      ]
      break
    case 'create':
      availableActions = [
        {
          label: `Create a new ${currentUserObject.label_one}`,
          value: 'create'
        }
      ]
      break
    case 'delete':
      availableActions = [
        {
          label: `Update a linked ${currentUserObject.label_one}`,
          value: 'update'
        },
        {
          label: `Delete a linked ${currentUserObject.label_one}`,
          value: 'delete'
        }
      ]
      break
    case 'search':
      availableActions = [{ label: 'Build search query', value: 'search' }]
      break
    default:
      break
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
          options={availableActions}
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
