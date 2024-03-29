import { Connection, XkitJs } from '@xkit-co/xkit.js'
import { IKitAPIError } from '@xkit-co/xkit.js/lib/api/request'
import React from 'react'
import { Mapping } from '..'
import { Option } from '../components/ComboBox'
import {
  APIObject,
  CRMObject,
  CRMObjectField,
  InputType,
  ObjectMapping,
  Selector,
  SelectorOperation,
  Transformation
} from '../interfaces/mapping.interface'
import { xkitBrowserWindow } from '../interfaces/window.interface'
import { friendlyMessage } from './errors'

declare const window: xkitBrowserWindow

export const updateMapping = (
  currentObjectMapping: ObjectMapping,
  objectMappings: ObjectMapping[],
  setObjectMappings: React.Dispatch<React.SetStateAction<ObjectMapping[]>>
) => {
  const existingMappingIndex = objectMappings.findIndex(
    (objectMapping) =>
      objectMapping.crm_object_id === currentObjectMapping.crm_object_id
  )
  if (existingMappingIndex > -1) {
    const clonedObjectMappings = [...objectMappings]
    clonedObjectMappings[existingMappingIndex] = currentObjectMapping
    setObjectMappings(clonedObjectMappings)
  } else {
    setObjectMappings([...objectMappings, currentObjectMapping])
  }
}

export const removeMapping = (
  currentObjectMapping: ObjectMapping,
  objectMappings: ObjectMapping[],
  setObjectMappings: React.Dispatch<React.SetStateAction<ObjectMapping[]>>
) => {
  const existingMappingIndex = objectMappings.findIndex(
    (objectMapping) =>
      objectMapping.crm_object_id === currentObjectMapping.crm_object_id
  )
  if (existingMappingIndex > -1) {
    const clonedObjectMappings = [...objectMappings]
    clonedObjectMappings.splice(existingMappingIndex, 1)
    setObjectMappings(clonedObjectMappings)
  }
}

export const isReadAvailable = (object: CRMObject) => {
  // True if object has fields or search event
  if (object.fields && object.fields.length) {
    return true
  }
  if (
    object.events &&
    object.events.length &&
    object.events.find((event) => event.type === 'search')
  ) {
    return true
  }
  return false
}

export const isWriteAvailable = (object: CRMObject) => {
  // True if object has create or update event
  if (
    object.events &&
    object.events.length &&
    object.events.find(
      (event) =>
        event.type === 'create' ||
        event.type === 'update' ||
        event.type === 'delete'
    )
  ) {
    return true
  }
  return false
}

export const getTransformationIndex = (
  fieldSlug: string,
  transformations: Transformation[]
) => {
  return transformations.findIndex(
    (transformation) =>
      transformation.field && transformation.field.slug === fieldSlug
  )
}

export const isAllFieldsSelected = (
  developerObject: CRMObject,
  transformations: Transformation[]
) => {
  if (!developerObject.fields) {
    return true
  }
  for (const field of developerObject.fields || []) {
    if (!(getTransformationIndex(field.slug, transformations) > -1)) {
      if (
        !(
          field.simple_type.type === 'object' &&
          developerObject.fields.find(
            (individualField) => individualField.parent_slug === field.slug
          )
        )
      ) {
        return false
      }
    }
  }
  return true
}

export const isEventsByTypeSelected = (
  type: string,
  developerObject: CRMObject,
  objectMappingEvents: ObjectMapping['event_actions']
) => {
  if (!developerObject.events) {
    return true
  }
  for (const event of developerObject.events || []) {
    if (type === 'all' || event.type === type) {
      const existingEventIndex = objectMappingEvents.findIndex(
        (objectMappingEvent) => objectMappingEvent.event.slug === event.slug
      )
      if (!(existingEventIndex > -1)) {
        return false
      } else if (
        existingEventIndex > -1 &&
        (objectMappingEvents[existingEventIndex].action_type === 'update' ||
          objectMappingEvents[existingEventIndex].action_type === 'create')
      ) {
        for (const transformation of objectMappingEvents[existingEventIndex]
          .transformations) {
          if (
            !transformation.field &&
            (!transformation.source_pointer ||
              transformation.static_value == null)
          ) {
            return false
          }
        }
        for (const field of event.fields || []) {
          if (
            !(
              getTransformationIndex(
                field.slug,
                objectMappingEvents[existingEventIndex].transformations
              ) > -1
            )
          ) {
            return false
          }
        }
      } else if (
        existingEventIndex > -1 &&
        objectMappingEvents[existingEventIndex].action_type === 'search'
      ) {
        for (const transformation of objectMappingEvents[existingEventIndex]
          .transformations) {
          if (
            !transformation.source_pointer ||
            !transformation.criteria_operator ||
            !(
              (transformation.field && transformation.field.slug) ||
              transformation.static_value != null
            )
          ) {
            return false
          }
        }
      }
    }
  }
  return true
}

export const isReadSelected = (
  developerObject: CRMObject,
  objectMapping: ObjectMapping
) => {
  if (!isAllFieldsSelected(developerObject, objectMapping.transformations)) {
    return false
  }
  if (
    !isEventsByTypeSelected(
      'search',
      developerObject,
      objectMapping.event_actions
    )
  ) {
    return false
  }
  return true
}

export const isWriteSelected = (
  developerObject: CRMObject,
  objectMapping: ObjectMapping
) => {
  if (
    !isEventsByTypeSelected(
      'update',
      developerObject,
      objectMapping.event_actions
    )
  ) {
    return false
  }
  if (
    !isEventsByTypeSelected(
      'create',
      developerObject,
      objectMapping.event_actions
    )
  ) {
    return false
  }
  if (
    !isEventsByTypeSelected(
      'delete',
      developerObject,
      objectMapping.event_actions
    )
  ) {
    return false
  }
  return true
}

export const isObjectSelected = (
  developerObject: CRMObject,
  objectMappings: ObjectMapping[]
) => {
  let mappingExistsForDeveloperObject = false
  for (const objectMapping of objectMappings) {
    if (objectMapping.crm_object_id === developerObject.id) {
      mappingExistsForDeveloperObject = true
      // Check if user has opted out, in which case it's a valid selection
      if (objectMapping.api_object_id == null) {
        return true
      }
      // Otherwise, make sure all fields and events are adequately filled out
      if (
        !(
          isAllFieldsSelected(developerObject, objectMapping.transformations) &&
          isEventsByTypeSelected(
            'all',
            developerObject,
            objectMapping.event_actions
          )
        )
      ) {
        return false
      }
    }
  }
  if (!mappingExistsForDeveloperObject) {
    return false
  }
  return true
}

export const isAllObjectsSelected = (
  developerObjects: CRMObject[],
  objectMappings: ObjectMapping[]
) => {
  for (const developerObject of developerObjects) {
    if (!isObjectSelected(developerObject, objectMappings)) {
      return false
    }
  }
  return true
}

const doesOptionHaveMatch = (option: Option): boolean => {
  if (option.match) {
    return true
  } else if (option.children) {
    for (const childOption of option.children) {
      if (doesOptionHaveMatch(childOption)) {
        return true
      }
    }
  }
  return false
}

export const selectorsToOptions = (
  selectors: Selector[],
  operation: SelectorOperation,
  field?: CRMObjectField
): Option[] => {
  return selectors
    .map((selector) => {
      const option: Option = {
        label: selector.label ?? '',
        subLabel: selector.type_label,
        value: selector.pointer,
        selector: selector
      }
      if (selector.api_name && selector.api_name !== selector.label) {
        option.description = selector.api_name
      }
      if (selector.children && selector.children.length) {
        option.children = selectorsToOptions(
          selector.children,
          operation,
          field
        )
      }
      if (field) {
        option.match =
          (isMatch(field.label, selector.label ?? '') ||
            isMatch(field.label, selector.api_name ?? '')) &&
          isSelectableCriteria(option, field, operation)
      }
      return option
    })
    .sort((optionA, optionB) => {
      if (field) {
        const optionAHasMatch = doesOptionHaveMatch(optionA)
        const optionBHasMatch = doesOptionHaveMatch(optionB)
        if (optionAHasMatch === optionBHasMatch) {
          return optionA.label.localeCompare(optionB.label)
        }
        if (optionAHasMatch) {
          return -1
        }
        return 1
      }
      return optionA.label.localeCompare(optionB.label)
    })
}

export const supportedTransformations = ['direct', 'date']

export const getSelectableCriteria = (
  option: Option,
  field: CRMObjectField,
  operation: SelectorOperation
): InputType | undefined => {
  if (!option.selector) {
    return undefined
  }
  if (!option.selector.pointer) {
    return undefined
  }
  if (!isOperationAllowed(option.selector, operation)) {
    return undefined
  }
  for (const criteria of option.selector.input_types) {
    if (
      criteria.input_type.type === field.simple_type.type &&
      (criteria.input_type.format === field.simple_type.format ||
        (!criteria.input_type.format && !field.simple_type.format)) &&
      criteria.transformations.some((transformation) =>
        supportedTransformations.includes(transformation)
      )
    ) {
      return criteria
    }
  }
  return undefined
}

export const isSelectableCriteria = (
  option: Option,
  field: CRMObjectField,
  operation: SelectorOperation
): boolean => {
  if (getSelectableCriteria(option, field, operation)) {
    return true
  }
  return false
}

const isOperationAllowed = (
  selector: Selector,
  operation: SelectorOperation
): boolean => {
  switch (operation) {
    case SelectorOperation.None:
      return true
    case SelectorOperation.Read:
      if (selector.readable) {
        return true
      }
      break
    case SelectorOperation.Create:
      if (selector.createable) {
        return true
      }
      break
    case SelectorOperation.Update:
      if (selector.updateable) {
        return true
      }
      break
    case SelectorOperation.Filter:
      if (selector.searchable) {
        return true
      }
      break
    default:
      return false
  }
  return false
}

export const findSelectedOption = (
  options: Option[],
  selected?: string
): Option | undefined => {
  if (!selected) {
    return undefined
  }
  for (const option of options) {
    if (option.value === selected) {
      return option
    }
    if (option.children) {
      const result = findSelectedOption(option.children, selected)
      if (result) {
        return result
      }
    }
  }
  return undefined
}

export const mergePreviouslyMappedNestedFields = (
  objects: CRMObject[],
  objectsWithNestedFields: CRMObject[]
) => {
  const mergedObjects: CRMObject[] =
    window.structuredClone<CRMObject[]>(objects)
  for (const objectIndex in objects) {
    for (const objectWithNestedFields of objectsWithNestedFields) {
      if (
        objects[objectIndex].id === objectWithNestedFields.id &&
        objects[objectIndex].fields &&
        objectWithNestedFields.fields
      ) {
        for (const possibleNestedfield of objectWithNestedFields.fields) {
          if (
            possibleNestedfield.parent_slug &&
            objects[objectIndex].fields!.find(
              (field) => field.slug === possibleNestedfield.parent_slug
            )
          ) {
            mergedObjects[objectIndex].fields = [
              ...mergedObjects[objectIndex].fields!,
              possibleNestedfield
            ]
          }
        }
      }
    }
  }
  return mergedObjects
}

export const listCRMObjects = async (
  xkit: XkitJs | undefined,
  connection: Connection,
  mapping: Mapping,
  reject: (message: string) => void
) => {
  if (xkit && xkit.domain) {
    if (!mapping || !mapping.objects) {
      return []
    }
    try {
      const response = (await xkit.listCRMObjects(connection, {
        objects: mapping.objects
      })) as {
        objects: CRMObject[]
      }
      return response.objects
    } catch (error) {
      if (error instanceof IKitAPIError && error.body) {
        const errorBody = error.body as {
          errors?: { error: string; path: string }[]
        }
        if (errorBody.errors) {
          const errors = errorBody.errors
            .map(
              (individualError) =>
                `${individualError.path} ${individualError.error}`
            )
            .join('; ')
          return reject(
            `Error in property 'objects'${errors ? `: ${errors}` : '.'}`
          )
        } else {
          return reject(friendlyMessage(error.message))
        }
      } else {
        return reject(friendlyMessage(error.message))
      }
    }
  } else {
    return reject('Could not identify session.')
  }
}

export const listAPIObjects = async (
  xkit: XkitJs | undefined,
  connection: Connection,
  reject: (message: string) => void
): Promise<void | APIObject[]> => {
  if (xkit && xkit.domain) {
    try {
      const objects = await xkit.listAPIObjects(connection)
      return objects as APIObject[]
    } catch (error) {
      if (error instanceof IKitAPIError && error.statusCode === 424) {
        // API objects are not ready yet. Keep polling and resolve only when we get the API objects
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return await listAPIObjects(xkit, connection, reject)
      } else {
        return reject(friendlyMessage(error.message))
      }
    }
  } else {
    return reject('Could not identify session.')
  }
}

export const getAPIObject = async (
  xkit: XkitJs | undefined,
  connection: Connection,
  apiObjectSlug: string,
  reject: (message: string) => void
): Promise<void | APIObject> => {
  if (xkit && xkit.domain) {
    try {
      const object = await xkit.getAPIObject(connection, apiObjectSlug)
      return object as APIObject
    } catch (error) {
      return reject(friendlyMessage(error.message))
    }
  } else {
    return reject('Could not identify session.')
  }
}

export const getMapping = async (
  xkit: XkitJs | undefined,
  connection: Connection,
  reject: (message: string) => void
) => {
  if (xkit && xkit.domain) {
    try {
      const response = await xkit.getMapping(connection)
      return response as { mapping: ObjectMapping[]; objects: CRMObject[] }
    } catch (error) {
      return { mapping: [], objects: [] }
    }
  } else {
    return reject('Could not identify session.')
  }
}

export const saveMapping = async (
  xkit: XkitJs | undefined,
  connection: Connection,
  CRMObjects: CRMObject[],
  objectMappings: ObjectMapping[],
  reject: (message: string) => void
) => {
  if (xkit && xkit.domain) {
    try {
      return await xkit.saveMapping(connection, CRMObjects, objectMappings)
    } catch (error) {
      return reject(friendlyMessage(error.message))
    }
  } else {
    return reject('Could not identify session.')
  }
}

export const stripUnneededMappings = (
  objects: CRMObject[],
  mapping: ObjectMapping[]
) => {
  const essentialMapping: ObjectMapping[] = []
  // Go through all mappings and include only those that belong to a CRM Object passed to CRM Link
  for (const individualMapping of mapping) {
    const CRMObject = objects.find(
      (object) => object.id === individualMapping.crm_object_id
    )
    if (CRMObject) {
      const transformations: Transformation[] = []
      if (CRMObject.fields) {
        // Go through all fields passed to CRM Link and include only their transformations if they exist
        for (const field of CRMObject.fields) {
          const index = getTransformationIndex(
            field.slug,
            individualMapping.transformations
          )
          if (field.id && index > -1) {
            transformations.push(individualMapping.transformations[index])
          }
        }
      }

      const eventActions: ObjectMapping['event_actions'] = []
      if (CRMObject.events) {
        // Go through all events passed to CRM Link and include only their actions if they exist
        for (const event of CRMObject.events) {
          const index = individualMapping.event_actions.findIndex(
            (eventAction) => eventAction.event.slug === event.slug
          )
          if (event.id && index > -1) {
            const eventTransformations: Transformation[] = []
            // Go through all event payload fields and include only their transformations if they exist
            for (const payloadField of event.fields) {
              const payloadMappingindex = getTransformationIndex(
                payloadField.slug,
                individualMapping.event_actions[index].transformations
              )
              if (payloadField.id && payloadMappingindex > -1) {
                eventTransformations.push(
                  individualMapping.event_actions[index].transformations[
                    payloadMappingindex
                  ]
                )
              }
            }
            // Go through all event transformations and include those that are static
            for (const eventTransformation of individualMapping.event_actions[
              index
            ].transformations) {
              if (eventTransformation.name === 'static') {
                eventTransformations.push(eventTransformation)
              }
            }
            eventActions.push({
              ...individualMapping.event_actions[index],
              transformations: eventTransformations
            })
          }
        }
      }
      essentialMapping.push({
        ...individualMapping,
        transformations,
        event_actions: eventActions
      })
    }
  }

  return essentialMapping
}

// These are aliases for suggested mappings. Each entry contains interchangeable aliases.
const matchAssociations = [
  ['account', 'company'],
  ['contact', 'customer'],
  ['lead', 'prospect'],
  ['deal', 'opportunity'],
  ['meeting', 'event']
]

export const isMatch = (search: string, text: string): boolean => {
  // The logic here decides if an entry is a match for showing as a suggested mapping
  const term = search.split(' ').join('').toLowerCase()
  const option = text.split(' ').join('').toLowerCase()
  // If either argument's label is empty, bail out as not a match
  if (!term || !option) {
    return false
  }
  // Check for a direct match
  if (term === option) {
    return true
  }
  // Check for associations
  const associationsIndex = matchAssociations.findIndex((associations) =>
    associations.includes(term)
  )
  if (associationsIndex > -1) {
    for (const alias of matchAssociations[associationsIndex]) {
      if (alias !== term && alias === option) {
        return true
      }
    }
  }
  return false
}

export const defaultEventActions = (
  object: CRMObject
): ObjectMapping['event_actions'] => {
  const actions: ObjectMapping['event_actions'] = []
  if (object.events) {
    for (const event of object.events) {
      if (event.type === 'search' && event.fields && event.fields.length) {
        actions.push({
          event: {
            slug: event.slug
          },
          action_type: 'search',
          transformations: event.fields.map((field) => ({
            name: 'direct',
            criteria_operator: 'eq',
            field: {
              slug: field.slug
            }
          }))
        })
      } else if (event.type === 'create') {
        actions.push({
          event: {
            slug: event.slug
          },
          action_type: 'create',
          transformations: []
        })
      } else if (event.type === 'update') {
        actions.push({
          event: {
            slug: event.slug
          },
          action_type: 'update',
          transformations: []
        })
      } else if (event.type === 'delete') {
        actions.push({
          event: {
            slug: event.slug
          },
          action_type: 'delete',
          transformations: []
        })
      }
    }
  }
  return actions
}

export const getMissingRequiredCRMFields = (
  userObject: APIObject,
  objectMapping: ObjectMapping
): { eventSlug: string; missingFieldLabels: string[] } | undefined => {
  const requiredCRMFields: Selector[] = []
  if (userObject.selector) {
    getRequiredCRMFields([userObject.selector], requiredCRMFields)
  }
  for (const eventAction of objectMapping.event_actions) {
    if (eventAction.action_type === 'create') {
      const missingFieldLabels = []
      for (const CRMField of requiredCRMFields) {
        if (
          !eventAction.transformations.find(
            (transformation) =>
              transformation.source_pointer === CRMField.pointer
          )
        ) {
          missingFieldLabels.push(CRMField.label || CRMField.api_name || '')
        }
      }
      if (missingFieldLabels.length) {
        return {
          eventSlug: eventAction.event.slug,
          missingFieldLabels
        }
      }
    }
  }
  return undefined
}

const getRequiredCRMFields = (
  selectors: Selector[],
  requiredCRMFields: Selector[]
) => {
  for (const selector of selectors) {
    if (selector.required) {
      requiredCRMFields.push(selector)
    }
    if (selector.children) {
      getRequiredCRMFields(selector.children, requiredCRMFields)
    }
  }
}

const findSelectorByPointer = (
  selectors: Selector[],
  pointer: string
): Selector | undefined => {
  for (const selector of selectors) {
    if (selector.pointer === pointer) {
      return selector
    } else if (selector.children) {
      const foundSelector = findSelectorByPointer(selector.children, pointer)
      if (foundSelector) {
        return foundSelector
      }
    }
  }
  return undefined
}

export const applyRepeatedMapping = (
  field: CRMObjectField,
  developerObject: CRMObject,
  selectors: Selector[],
  value: string,
  type: string,
  objectMappings: ObjectMapping[],
  currentObjectMapping: ObjectMapping
) => {
  // We're going to modify the currentObjectMapping, so let's keep an empirical object mapping we can use to check the actual state
  const objectMappingToCheck = objectMappings.find(
    (objectMapping) =>
      objectMapping.api_object_id === currentObjectMapping.api_object_id &&
      objectMapping.crm_object_id === currentObjectMapping.crm_object_id
  )
  if (!objectMappingToCheck) {
    return currentObjectMapping
  }
  /* For actions that exist, if there's a payload field with the same slug and type:
   * - For search actions, if there's an existing transformation created by default (associated to a field, 'direct' transformation,
   * 'eq' operator, no source_pointer), we will pass the same source_pointer value for a repeated mapping
   * - For create and update actions, if there's no transformation associated with that field, we will pre-fill it with the same
   * transformation value for a repeated mapping
   */
  for (const eventAction of objectMappingToCheck.event_actions) {
    const event = developerObject.events?.find(
      (event) => event.slug === eventAction.event.slug
    )
    if (event) {
      const repeatedField = event.fields.find(
        (payloadField) =>
          payloadField.slug === field.slug &&
          payloadField.simple_type.type === field.simple_type.type &&
          payloadField.simple_type.format === field.simple_type.format
      )
      if (repeatedField) {
        const transformationIndex = getTransformationIndex(
          repeatedField.slug,
          eventAction.transformations
        )
        if (
          transformationIndex > -1 &&
          eventAction.action_type === 'search' &&
          type !== 'empty'
        ) {
          const transformation =
            eventAction.transformations[transformationIndex]
          if (
            transformation.name === 'direct' &&
            transformation.criteria_operator === 'eq' &&
            transformation.field &&
            transformation.field.slug === repeatedField.slug &&
            !transformation.source_pointer
          ) {
            const selector = findSelectorByPointer(selectors, value)
            if (
              selector &&
              isOperationAllowed(selector, SelectorOperation.Filter)
            ) {
              const eventActionToModify =
                currentObjectMapping.event_actions.find(
                  (action) => action.event.slug === eventAction.event.slug
                )
              if (eventActionToModify) {
                const transformationToModify =
                  eventActionToModify.transformations.find(
                    (transformation) =>
                      transformation.field &&
                      transformation.field.slug === repeatedField.slug
                  )
                if (transformationToModify) {
                  transformationToModify.name = 'direct'
                  transformationToModify.criteria_operator = 'eq'
                  transformationToModify.source_pointer = value
                }
              }
            }
          }
        } else if (
          !(transformationIndex > -1) &&
          (eventAction.action_type === 'create' ||
            eventAction.action_type === 'update')
        ) {
          let operation: SelectorOperation = SelectorOperation.None
          if (eventAction.action_type === 'create') {
            operation = SelectorOperation.Create
          } else if (eventAction.action_type === 'update') {
            operation = SelectorOperation.Update
          }
          const selector = findSelectorByPointer(selectors, value)
          if (
            (selector && isOperationAllowed(selector, operation)) ||
            type === 'empty'
          ) {
            const transformation: Transformation = {
              field: { slug: repeatedField.slug },
              name: type
            }
            if (type !== 'empty') {
              transformation.source_pointer = value
            }
            const eventActionToModify = currentObjectMapping.event_actions.find(
              (action) => action.event.slug === eventAction.event.slug
            )
            if (eventActionToModify) {
              eventActionToModify.transformations.push(transformation)
            }
          }
        }
      }
    }
  }
}
