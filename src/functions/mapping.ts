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
  objectMappings: ObjectMapping[]
) => {
  const existingMappingIndex = objectMappings.findIndex(
    (objectMapping) =>
      objectMapping.developerObjectId ===
        currentObjectMapping.developerObjectId &&
      objectMapping.userObjectId === currentObjectMapping.userObjectId
  )
  if (existingMappingIndex > -1) {
    objectMappings[existingMappingIndex] = currentObjectMapping
  } else {
    objectMappings.push(currentObjectMapping)
  }
}

export const getTransformationIndex = (
  fieldSlug: string,
  transformations: Transformation[]
) => {
  return transformations.findIndex(
    (transformation) => transformation.fieldSlug === fieldSlug
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
  objectMappingEvents: ObjectMapping['events']
) => {
  if (!developerObject.events) {
    return true
  }
  for (const event of developerObject.events || []) {
    const existingEventIndex = objectMappingEvents.findIndex(
      (objectMappingEvent) => objectMappingEvent.slug === event.slug
    )
    if (!(existingEventIndex > -1)) {
      return false
    }
    if (
      objectMappingEvents[existingEventIndex].selectedActionType === 'update'
    ) {
      for (const field of event.payloadFields) {
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
      criteria.input_type.type === field.type &&
      (criteria.input_type.format === field.format ||
        (!criteria.input_type.format && !field.format)) &&
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
