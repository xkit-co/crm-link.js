import { Mapping } from '..'

export interface xkitBrowserWindow extends Window {
  linkCRM: (domain: string, token: string, mapping: Mapping) => Promise<string>
  structuredClone: <Type>(object: Type) => Type
}
