import { InputType, Selector } from '../interfaces/mapping.interface'
import React, { FC, useEffect, useRef, useState } from 'react'
import {
  findSelectedOption,
  supportedTransformations
} from '../functions/mapping'
import Caret from './icons/Caret'
import Minus from './icons/Minus'
import Plus from './icons/Plus'

export interface Option {
  label: string
  subLabel?: string
  value: string
  selector?: Selector
  children?: Option[]
}

interface ComboBoxProps {
  placeholder: string
  options: Option[]
  allowFiltering?: boolean
  allowStatic?: boolean
  selected: {
    value?: string
    static: boolean
  }
  criteria?: (option: Option) => boolean
  getSelectableCriteria?: (option: Option) => InputType | undefined
  onSelect: (value: string, type: string) => void
}

const ComboBox: FC<ComboBoxProps> = ({
  placeholder,
  options,
  allowFiltering,
  allowStatic,
  selected,
  criteria,
  getSelectableCriteria,
  onSelect
}) => {
  const [visible, setVisible] = useState<boolean>(false)
  const [searchFieldText, setSearchFieldText] = useState<string>('')
  const inputRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const positionDropdown = () => {
      if (dropdownRef.current && inputRef.current) {
        dropdownRef.current.style.left = `${
          inputRef.current.getBoundingClientRect().left
        }px`
        // We want to ideally show the dropdown just below the input field that is clicked
        const desiredTopOffset =
          inputRef.current.getBoundingClientRect().top + 40
        /* But if there's not enough space to do so, show it such that there is at least a
         * 10px gap between the bottom of the dropdown and the browser window limit
         */
        if (
          desiredTopOffset + dropdownRef.current.offsetHeight >
          document.body.clientHeight - 10
        ) {
          dropdownRef.current.style.top = `${
            document.body.clientHeight - 10 - dropdownRef.current.offsetHeight
          }px`
        } else {
          dropdownRef.current.style.top = `${desiredTopOffset}px`
        }
      }
    }

    if (allowFiltering && visible && searchFieldRef.current) {
      searchFieldRef.current.focus()
    }

    positionDropdown()
    window.addEventListener('resize', positionDropdown)

    return () => {
      window.removeEventListener('resize', positionDropdown)
    }
  }, [visible, allowFiltering, inputRef, dropdownRef, searchFieldRef])

  const selectedOption: Option | undefined = selected.static
    ? {
        label: `"${selected.value || ''}"`,
        subLabel: 'static',
        value: selected.value || ''
      }
    : findSelectedOption(options, selected.value)

  return (
    <>
      <div
        className='text-sm px-2 py-1 flex justify-between items-center rounded border-solid border border-neutral-200 shadow-inner cursor-text focus:outline focus:outline-2 outline-offset-1 outline-sky-500'
        tabIndex={0}
        onClick={() => {
          setSearchFieldText('')
          setVisible(true)
        }}
        ref={inputRef}
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
          'top-0',
          'left-0',
          'h-screen',
          'w-screen',
          'z-[1001]',
          visible ? 'block' : 'hidden'
        ]
          .join(' ')
          .trim()}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setVisible(false)
          }
        }}
      >
        <div
          className={[
            'bg-white',
            'rounded',
            'shadow-md',
            allowFiltering ? 'min-w-[360px]' : 'min-w-[312px]',
            'max-w-[600px]',
            'max-h-[500px]',
            'overflow-x-auto',
            'overflow-y-auto',
            'absolute',
            'z-[1002]',
            visible ? 'block' : 'hidden'
          ]
            .join(' ')
            .trim()}
          ref={dropdownRef}
        >
          <div className='min-w-fit'>
            {allowFiltering ? (
              <input
                className='box-border p-2 block w-full outline-none border-none text-sm bg-white placeholder:text-neutral-500'
                placeholder='Type to filter or enter static data'
                type='text'
                value={searchFieldText}
                onChange={(event) => {
                  setSearchFieldText(event.target.value.trim())
                }}
                ref={searchFieldRef}
              />
            ) : null}
            {allowStatic && (selected.static || searchFieldText) ? (
              <OptionItem
                option={
                  searchFieldText
                    ? {
                        label: `"${searchFieldText}"`,
                        subLabel: 'static',
                        value: searchFieldText
                      }
                    : selectedOption!
                }
                selected={selected.static ? selected.value : undefined}
                onSelect={(value) => {
                  onSelect(value, 'static')
                }}
                close={() => {
                  setVisible(false)
                }}
                searchFieldText={searchFieldText}
              />
            ) : null}
            {options
              .filter((option) => filterOption(option, searchFieldText))
              .map((option) => (
                <OptionItem
                  option={option}
                  selected={selected.static ? undefined : selected.value}
                  onSelect={onSelect}
                  close={() => {
                    setVisible(false)
                  }}
                  searchFieldText={searchFieldText}
                  disabled={criteria ? !criteria(option) : false}
                  criteria={criteria}
                  getSelectableCriteria={getSelectableCriteria}
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
  searchFieldText: string
  disabled?: boolean
  criteria?: (option: Option) => boolean
  getSelectableCriteria?: (option: Option) => InputType | undefined
}

const OptionItem: FC<OptionItemProps> = ({
  option,
  selected,
  onSelect,
  close,
  searchFieldText,
  disabled,
  criteria,
  getSelectableCriteria
}) => {
  const [expanded, setExpanded] = useState<boolean>(true)
  let expandButton = null
  if (option.children && option.children.length) {
    if (expanded) {
      expandButton = (
        <Minus
          className='mr-2 h-3 w-3 p-1 cursor-pointer rounded hover:bg-black/20'
          onClick={(event) => {
            event.stopPropagation()
            setExpanded(!expanded)
          }}
        />
      )
    } else {
      expandButton = (
        <Plus
          className='mr-2 h-3 w-3 p-1 cursor-pointer rounded hover:bg-black/20'
          onClick={(event) => {
            event.stopPropagation()
            setExpanded(!expanded)
          }}
        />
      )
    }
  }

  return (
    <>
      <div
        className={[
          'p-2',
          'text-sm',
          'flex',
          'items-center',
          disabled ? '' : 'hover:bg-black/5 cursor-pointer',
          option.value === selected ? 'bg-black/10' : ''
        ]
          .join(' ')
          .trim()}
        onClick={() => {
          if (!disabled) {
            if (getSelectableCriteria) {
              const criteria = getSelectableCriteria(option)
              if (criteria && criteria.transformations) {
                const intersectionTransformations =
                  supportedTransformations.filter((transformation) =>
                    criteria.transformations.includes(transformation)
                  )
                if (
                  intersectionTransformations.length === 1 &&
                  intersectionTransformations[0] === 'date'
                ) {
                  onSelect(option.value, 'date')
                  close()
                  return
                }
              }
            }
            onSelect(option.value, 'direct')
            close()
          }
        }}
      >
        {expandButton}
        <div
          className={['whitespace-nowrap', disabled ? 'text-neutral-400' : '']
            .join(' ')
            .trim()}
        >
          {option.label}
        </div>
        {option.subLabel ? (
          <span
            className={[
              'text-xs',
              'pl-2',
              disabled ? 'text-neutral-400' : 'text-neutral-500'
            ]
              .join(' ')
              .trim()}
          >
            {option.subLabel}
          </span>
        ) : (
          ''
        )}
      </div>
      {option.children && option.children.length && expanded ? (
        <div className='pl-4'>
          {option.children
            .filter((childOption) => filterOption(childOption, searchFieldText))
            .map((childOption) => (
              <OptionItem
                option={childOption}
                selected={selected}
                onSelect={onSelect}
                close={close}
                searchFieldText={searchFieldText}
                disabled={criteria ? !criteria(childOption) : false}
                criteria={criteria}
                getSelectableCriteria={getSelectableCriteria}
                key={childOption.value}
              />
            ))}
        </div>
      ) : null}
    </>
  )
}

const filterOption = (option: Option, filter: string): boolean => {
  if (option.label.toLowerCase().includes(filter.toLowerCase())) {
    return true
  }
  if (option.children && option.children.length) {
    for (const childOption of option.children) {
      if (filterOption(childOption, filter)) {
        return true
      }
    }
  }
  return false
}

export default ComboBox
