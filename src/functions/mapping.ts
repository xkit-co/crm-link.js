import {
  DeveloperObject,
  ObjectMapping,
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
