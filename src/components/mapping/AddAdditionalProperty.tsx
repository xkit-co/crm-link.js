import React, { FC, useState } from 'react'
import { CRMObjectField } from '../../interfaces/mapping.interface'
import Button from '../Button'
import ComboBox from '../ComboBox'

interface AddAdditionalPropertyProps {
  field: CRMObjectField
  fields: CRMObjectField[]
  onAddAdditionalProperty: (
    slug: string,
    parent: string,
    simple_type: { type: string; format: string | null }
  ) => void
}

const AddAdditionalProperty: FC<AddAdditionalPropertyProps> = ({
  field,
  fields,
  onAddAdditionalProperty
}) => {
  const [slug, setSlug] = useState<string>('')
  const [type, setType] = useState<string | undefined>(undefined)

  const isDuplicateSlug =
    fields.findIndex(
      (individualField) => individualField.slug === `${field.slug}.${slug}`
    ) > -1

  return (
    <div className='pt-4'>
      <div className='flex justify-between items-center'>
        <div className='w-[130px]'>
          <input
            className='box-border px-2 py-1 block w-full rounded border-solid border border-neutral-200 shadow-inner text-sm bg-white placeholder:text-neutral-500 focus:outline focus:outline-2 outline-offset-1 outline-sky-500'
            placeholder='Field label'
            type='text'
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value.trim())
            }}
          />
        </div>
        <div className='w-[130px]'>
          <ComboBox
            placeholder='Select type'
            options={[
              { label: 'String', value: 'string' },
              { label: 'Number', value: 'number' },
              { label: 'Boolean', value: 'boolean' },
              { label: 'Object', value: 'object' },
              { label: 'Date & Time (ISO 8601)', value: 'date' }
            ]}
            selected={{ value: type, static: false }}
            onSelect={(value) => {
              setType(value)
            }}
          />
        </div>
      </div>
      {slug && isDuplicateSlug ? (
        <div className='pt-2.5 text-xs text-red-500'>
          A field with this label already exists
        </div>
      ) : null}
      <div className='pt-2'>
        <Button
          type={slug && !isDuplicateSlug && type ? 'secondary' : 'disabled'}
          text='Add a custom field'
          onClick={() => {
            if (slug && !isDuplicateSlug && type) {
              const simple_type: { type: string; format: string | null } = {
                type,
                format: null
              }
              if (type === 'date') {
                simple_type.type = 'string'
                simple_type.format = 'datetime'
              }
              setSlug('')
              setType(undefined)
              onAddAdditionalProperty(slug, field.slug, simple_type)
            }
          }}
        />
      </div>
    </div>
  )
}

export default AddAdditionalProperty
