export enum MappingStages {
  Loading,
  Objects,
  Fields,
  Events,
  RepeatDialog // Choice for the user to map another object from the CRM or finish setup
}

interface Field {
  slug: string
  type: string
  format?: string
  label: string
  description: string
  selection?: string
}

export interface Event {
  slug: string
  type: string
  label: string
  description: string
  payloadFields: Field[]
  selection?: string
}

export interface DeveloperObject {
  slug: string
  name: string
  description: string
  fields: Field[]
  events?: Event[]
}

export interface Selector {
  label: string
  pointer: string
  type_label: string
  children?: Selector[]
}

export interface UserObject {
  id: number
  slug: string
  label_one: string
  label_many: string
  selectors: Selector[]
}
