export interface xkitBrowserWindow extends Window {
  linkCRM: (domain: string, token: string, mapping: unknown) => void
  structuredClone: <Type>(object: Type) => Type
}
