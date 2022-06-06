export enum MappingStages {
  Loading,
  Objects,
  Fields,
  Events,
  RepeatDialog // Choice for the user to map another object from the CRM or finish setup
}

export interface Field {
  slug: string
  label: string
  description: string
  simple_type: {
    type: string
    format: string | null
  }
}

export interface Event {
  slug: string
  type: string
  label: string
  description: string
  fields: Field[]
}

export interface DeveloperObject {
  id: number
  slug: string
  label: string
  description: string
  fields?: Field[]
  events?: Event[]
}

export interface Criteria {
  input_type: {
    type: string
    format: string | null
  }
  transformations: string[]
}

export interface Selector {
  label: string
  pointer: string
  type_label: string
  input_types: Criteria[]
  children?: Selector[]
}

export interface UserObject {
  id: number
  slug: string
  label_one: string
  label_many: string
  selectors: Selector[]
}

export interface Transformation {
  field: {
    slug: string
  }
  name: string
  source_pointer?: string
  static_value?: string
}

export interface ObjectMapping {
  crm_object_id: number
  api_object_id: number
  transformations: Transformation[]
  event_actions: {
    event: {
      slug: string
    }
    action_type: string
    transformations: Transformation[]
  }[]
}
