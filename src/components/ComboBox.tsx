import React, { FC, useState } from 'react'
import { Selector } from '../interfaces/mapping.interface'
import Caret from './icons/Caret'
import Cross from './icons/Cross'

export interface Option {
  label: string
  subLabel?: string
  value: string
  children?: Option[]
}

interface ComboBoxProps {
  placeholder: string
  options: Option[]
  selected?: string
  onSelect: (value: string, type: string) => void
}

// TODO: Implement functionality: select nested options, disable options based on type and format, enter static value

const ComboBox: FC<ComboBoxProps> = ({
  placeholder,
  options,
  selected,
  onSelect
}) => {
  const [expanded, setExpanded] = useState<boolean>(false)

  const selectedOption = findSelectedOption(options, selected)

  return (
    <>
      <div
        className='text-sm px-2 py-1 flex justify-between items-center rounded border-solid border border-neutral-200 shadow-inner cursor-text focus:outline focus:outline-2 outline-offset-1 outline-sky-500'
        tabIndex={0}
        onClick={() => {
          setExpanded(true)
        }}
      >
        <div
          className={[
            'overflow-hidden',
            'whitespace-nowrap',
            'text-ellipsis pr-2',
            selectedOption ? '' : 'text-neutral-500'
          ]
            .join(' ')
            .trim()}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <Caret className='h-4 w-4 fill-neutral-400 shrink-0' />
      </div>
      <div
        className={[
          'fixed',
          'bg-black/30',
          'top-0',
          'left-0',
          'h-screen',
          'w-screen',
          'justify-center',
          'items-center',
          'z-[1001]',
          expanded ? 'flex' : 'hidden'
        ]
          .join(' ')
          .trim()}
      >
        <div
          className={[
            'bg-white',
            'rounded-md',
            'w-[300px]',
            'max-h-[510px]',
            'overflow-x-auto',
            'overflow-y-auto',
            'z-[1002]',
            expanded ? 'block' : 'hidden'
          ]
            .join(' ')
            .trim()}
        >
          <div className='flex justify-end items-center box-border p-2 w-full'>
            <Cross
              className='w-4 h-4 block cursor-pointer'
              onClick={() => {
                setExpanded(false)
              }}
            />
          </div>
          <div className='min-w-fit'>
            {options.map((option) => (
              <OptionItem
                option={option}
                selected={selected}
                onSelect={onSelect}
                close={() => {
                  setExpanded(false)
                }}
                key={option.value}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

interface OptionItemProps {
  option: Option
  selected: string | undefined
  onSelect: (value: string, type: string) => void
  close: () => void
}

const OptionItem: FC<OptionItemProps> = ({
  option,
  selected,
  onSelect,
  close
}) => (
  <>
    <div
      className={[
        'p-2',
        'text-sm',
        'border-t',
        'border-b-0',
        'border-l-0',
        'border-r-0',
        'border-solid',
        'border-neutral-200',
        'hover:bg-black/5',
        'cursor-pointer',
        option.value === selected ? 'bg-black/10' : ''
      ]
        .join(' ')
        .trim()}
      onClick={() => {
        onSelect(option.value, 'direct')
        close()
      }}
    >
      {option.label}
      {option.subLabel ? (
        <span className='text-xs text-neutral-500 pl-2'>{option.subLabel}</span>
      ) : (
        ''
      )}
    </div>
    {option.children && option.children.length ? (
      <div className='pl-4'>
        {option.children.map((childOption) => (
          <OptionItem
            option={childOption}
            selected={selected}
            onSelect={onSelect}
            close={close}
            key={childOption.value}
          />
        ))}
      </div>
    ) : null}
  </>
)

const findSelectedOption = (
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

export const selectorsToOptions = (selectors: Selector[]): Option[] => {
  return selectors.map((selector) => {
    const option: Option = {
      label: selector.label,
      subLabel: selector.type_label,
      value: selector.pointer
    }
    if (selector.children && selector.children.length) {
      option.children = selectorsToOptions(selector.children)
    }
    return option
  })
}

export default ComboBox
