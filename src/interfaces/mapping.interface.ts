export enum MappingStages {
  Loading,
  Configuration,
  Connection,
  Mappings,
  Objects,
  Read,
  Write
}

export interface CRMObjectField {
  id?: number
  slug: string
  label: string
  description: string
  simple_type: {
    type: string
    format: string | null
  }
  parent_slug?: string
}

export interface CRMObjectEvent {
  id?: number
  slug: string
  type: string
  label: string
  description: string
  fields: CRMObjectField[]
}

export interface CRMObject {
  id: number
  slug: string
  label: string
  description: string
  fields?: CRMObjectField[]
  events?: CRMObjectEvent[]
}

export interface InputType {
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
  input_types: InputType[]
  children?: Selector[]
}

export interface APIObject {
  id: number
  slug: string
  label_one: string
  label_many: string
  selector?: Selector
}

export interface Transformation {
  field?: {
    slug: string
  }
  criteria_operator?: string
  name: string
  source_pointer?: string
  static_value?: string | boolean
}

export interface ObjectMapping {
  crm_object_id: number
  api_object_id: number
  transformations: Transformation[]
  event_actions: Array<{
    event: {
      slug: string
    }
    action_type: string
    transformations: Transformation[]
  }>
}
