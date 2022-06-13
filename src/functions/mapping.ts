import React from 'react'
import { Option } from '../components/ComboBox'
import {
  Criteria,
  DeveloperObject,
  Field,
  ObjectMapping,
  Selector,
  Transformation
} from '../interfaces/mapping.interface'

export const updateMapping = (
  currentObjectMapping: ObjectMapping,
  objectMappings: ObjectMapping[],
  setObjectMappings: React.Dispatch<React.SetStateAction<ObjectMapping[]>>
) => {
  const existingMappingIndex = objectMappings.findIndex(
    (objectMapping) =>
      objectMapping.crm_object_id === currentObjectMapping.crm_object_id &&
      objectMapping.api_object_id === currentObjectMapping.api_object_id
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
      objectMapping.crm_object_id === currentObjectMapping.crm_object_id &&
      objectMapping.api_object_id === currentObjectMapping.api_object_id
  )
  if (existingMappingIndex > -1) {
    const clonedObjectMappings = [...objectMappings]
    clonedObjectMappings.splice(existingMappingIndex, 1)
    setObjectMappings(clonedObjectMappings)
  }
}

export const getTransformationIndex = (
  fieldSlug: string,
  transformations: Transformation[]
) => {
  return transformations.findIndex(
    (transformation) => transformation.field.slug === fieldSlug
  )
}

export const isAllFieldsSelected = (
  developerObject: DeveloperObject,
  transformations: Transformation[]
) => {
  if (!developerObject.fields) {
    return true
  }
  for (const field of developerObject.fields || []) {
    if (!(getTransformationIndex(field.slug, transformations) > -1)) {
      return false
    }
  }
  return true
}

export const isAllEventsSelected = (
  developerObject: DeveloperObject,
  objectMappingEvents: ObjectMapping['event_actions']
) => {
  if (!developerObject.events) {
    return true
  }
  for (const event of developerObject.events || []) {
    const existingEventIndex = objectMappingEvents.findIndex(
      (objectMappingEvent) => objectMappingEvent.event.slug === event.slug
    )
    if (!(existingEventIndex > -1)) {
      return false
    }
    if (objectMappingEvents[existingEventIndex].action_type === 'update') {
      for (const field of event.fields) {
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
    }
  }
  return true
}

export const isObjectSelected = (
  developerObject: DeveloperObject,
  objectMappings: ObjectMapping[]
) => {
  let mappingExistsForDeveloperObject = false
  for (const objectMapping of objectMappings) {
    if (objectMapping.crm_object_id === developerObject.id) {
      mappingExistsForDeveloperObject = true
      if (
        !(
          isAllFieldsSelected(developerObject, objectMapping.transformations) &&
          isAllEventsSelected(developerObject, objectMapping.event_actions)
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
  developerObjects: DeveloperObject[],
  objectMappings: ObjectMapping[]
) => {
  for (const developerObject of developerObjects) {
    if (!isObjectSelected(developerObject, objectMappings)) {
      return false
    }
  }
  return true
}

export const selectorsToOptions = (selectors: Selector[]): Option[] => {
  return selectors.map((selector) => {
    const option: Option = {
      label: selector.label,
      subLabel: selector.type_label,
      value: selector.pointer,
      selector: selector
    }
    if (selector.children && selector.children.length) {
      option.children = selectorsToOptions(selector.children)
    }
    return option
  })
}

export const supportedTransformations = ['direct', 'date']

export const getSelectableCriteria = (
  option: Option,
  field: Field
): Criteria | undefined => {
  if (!option.selector) {
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

export const isSelectableCriteria = (option: Option, field: Field): boolean => {
  if (getSelectableCriteria(option, field)) {
    return true
  }
  return false
}

export const findSelectedOption = (
  options: Option[],
  selected: string | undefined
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
