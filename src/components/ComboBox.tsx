import React, { FC, useEffect, useRef, useState } from 'react'
import { scopeID } from '..'
import {
  findSelectedOption,
  supportedTransformations
} from '../functions/mapping'
import { InputType, Selector } from '../interfaces/mapping.interface'
import Caret from './icons/Caret'
import Cross from './icons/Cross'
import Minus from './icons/Minus'
import Plus from './icons/Plus'
import Star from './icons/Star'
import Tooltip from './Tooltip'

const focusableClass = 'xkit-combobox-focusable'

const focusNext = (element: HTMLInputElement | HTMLDivElement, up: boolean) => {
  const XkitDocument = document.getElementById(scopeID)?.children[0].shadowRoot
  if (XkitDocument) {
    const focusableElements: HTMLElement[] = Array.from(
      XkitDocument.querySelectorAll(`.${focusableClass}`)
    )
    if (focusableElements.length > 1) {
      const currentElementIndex = focusableElements.findIndex(
        (focusableElement) => focusableElement === element
      )
      if (currentElementIndex > -1) {
        if (up) {
          if (currentElementIndex !== 0) {
            focusableElements[currentElementIndex - 1].focus()
          }
        } else {
          if (currentElementIndex !== focusableElements.length - 1) {
            focusableElements[currentElementIndex + 1].focus()
          }
        }
      }
    }
  }
}

export interface Option {
  label: string
  subLabel?: string
  value: string
  selector?: Selector
  children?: Option[]
  match?: boolean
  description?: string
}

interface ComboBoxProps {
  disabled?: boolean
  placeholder: string
  options: Option[]
  allowFiltering?: boolean
  allowStatic?: boolean
  allowStaticBoolean?: boolean
  allowEmpty?: boolean
  selected: {
    value?: string
    static: boolean
  }
  isSelectedStaticBoolean?: boolean
  isSelectedEmpty?: boolean
  criteria?: (option: Option) => boolean
  getSelectableCriteria?: (option: Option) => InputType | undefined
  onSelect: (value: string, type: string, staticBool?: boolean) => void
  onDeselect?: () => void
}

const ComboBox: FC<ComboBoxProps> = ({
  disabled,
  placeholder,
  options,
  allowFiltering,
  allowStatic,
  allowStaticBoolean,
  allowEmpty,
  selected,
  isSelectedStaticBoolean,
  isSelectedEmpty,
  criteria,
  getSelectableCriteria,
  onSelect,
  onDeselect
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
          document.documentElement.clientHeight - 10
        ) {
          dropdownRef.current.style.top = `${
            document.documentElement.clientHeight -
            10 -
            dropdownRef.current.offsetHeight
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

  let selectedOption: Option | undefined = undefined
  if (isSelectedEmpty) {
    selectedOption = {
      label: `Don't map any data`,
      subLabel: '',
      value: 'empty'
    }
  } else if (selected.static && isSelectedStaticBoolean) {
    selectedOption = {
      label: `${selected.value || ''}`,
      subLabel: 'static boolean',
      value: selected.value || ''
    }
  } else if (selected.static) {
    selectedOption = {
      label: `"${selected.value || ''}"`,
      subLabel: 'static string',
      value: selected.value || ''
    }
  } else {
    selectedOption = findSelectedOption(options, selected.value)
  }

  return (
    <>
      <div
        className={[
          'text-sm',
          'px-2',
          'py-1',
          'flex',
          'justify-between',
          'items-center',
          'rounded',
          'border-solid',
          'border',
          'border-neutral-200',
          'shadow-inner',
          disabled ? 'cursor-default' : 'cursor-text',
          disabled ? 'bg-neutral-200' : 'bg-white',
          disabled
            ? ''
            : 'focus:outline focus:outline-2 outline-offset-1 outline-sky-500'
        ]
          .join(' ')
          .trim()}
        tabIndex={0}
        onClick={() => {
          if (!disabled) {
            setSearchFieldText('')
            setVisible(true)
          }
        }}
        ref={inputRef}
      >
        <div
          className={[
            'overflow-hidden',
            'whitespace-nowrap',
            'text-ellipsis',
            'pr-2',
            selectedOption ? '' : 'text-neutral-500'
          ]
            .join(' ')
            .trim()}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        {onDeselect && selectedOption ? (
          <Cross
            className='h-4 w-4 shrink-0 cursor-pointer'
            onClick={(event) => {
              event.stopPropagation()
              onDeselect()
            }}
          />
        ) : (
          <Caret className='h-4 w-4 fill-neutral-400 shrink-0' />
        )}
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
                className={[
                  'box-border',
                  'p-2',
                  'block',
                  'w-full',
                  'outline-none',
                  'border-none',
                  'text-sm',
                  'bg-white',
                  'placeholder:text-neutral-500',
                  focusableClass
                ]
                  .join(' ')
                  .trim()}
                placeholder={
                  options.length
                    ? 'Type to filter or enter static data'
                    : 'Type to enter static data'
                }
                type='text'
                value={searchFieldText}
                onChange={(event) => {
                  setSearchFieldText(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    event.stopPropagation()
                    focusNext(event.currentTarget, false)
                  }
                }}
                ref={searchFieldRef}
              />
            ) : null}
            {/*
                We want to show a pre-populated option at the top for a static string if:
                1. Static strings are allowed AND
                  i.  There is something static selected that is not a static boolean OR
                  ii. There is something typed in the search bar
              */}
            {allowStatic &&
            ((selected.static && !isSelectedStaticBoolean) ||
              searchFieldText) ? (
              <OptionItem
                option={
                  searchFieldText
                    ? {
                        label: `"${searchFieldText}"`,
                        subLabel: 'static string',
                        value: searchFieldText
                      }
                    : selectedOption!
                }
                selected={
                  selected.static &&
                  !isSelectedStaticBoolean &&
                  !isSelectedEmpty
                    ? selectedOption?.value
                    : undefined
                }
                onSelect={(value) => {
                  onSelect(value, 'static')
                }}
                close={() => {
                  setVisible(false)
                }}
                searchFieldText={searchFieldText}
              />
            ) : null}
            {allowStaticBoolean ? (
              <>
                <OptionItem
                  option={{
                    label: 'True',
                    subLabel: 'static boolean',
                    value: 'true'
                  }}
                  selected={
                    selected.static &&
                    isSelectedStaticBoolean &&
                    !isSelectedEmpty
                      ? selectedOption?.value
                      : undefined
                  }
                  onSelect={(value) => {
                    onSelect(value, 'static', true)
                  }}
                  close={() => {
                    setVisible(false)
                  }}
                  searchFieldText={searchFieldText}
                />
                <OptionItem
                  option={{
                    label: 'False',
                    subLabel: 'static boolean',
                    value: 'false'
                  }}
                  selected={
                    selected.static &&
                    isSelectedStaticBoolean &&
                    !isSelectedEmpty
                      ? selectedOption?.value
                      : undefined
                  }
                  onSelect={(value) => {
                    onSelect(value, 'static', true)
                  }}
                  close={() => {
                    setVisible(false)
                  }}
                  searchFieldText={searchFieldText}
                />
              </>
            ) : null}
            {allowEmpty ? (
              <OptionItem
                option={{
                  label: `Don't map any data`,
                  subLabel: '',
                  value: 'empty'
                }}
                selected={isSelectedEmpty ? selectedOption?.value : undefined}
                onSelect={(value) => {
                  onSelect(value, 'empty')
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
                  selected={
                    selected.static || isSelectedEmpty
                      ? undefined
                      : selected.value
                  }
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

  const handleSelect = () => {
    if (!disabled) {
      if (getSelectableCriteria) {
        const criteria = getSelectableCriteria(option)
        if (criteria && criteria.transformations) {
          const intersectionTransformations = supportedTransformations.filter(
            (transformation) =>
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
  }

  let optionBackground = 'bg-white'
  if (option.match) {
    optionBackground = 'bg-yellow-50'
  }
  if (option.value === selected) {
    optionBackground = 'bg-black/10'
  }

  return (
    <>
      <div
        className={[
          'p-2',
          'text-sm',
          'flex',
          'items-center',
          'rounded',
          'focus:outline',
          'focus:outline-2',
          'outline-offset-[-2px]',
          'outline-sky-500',
          disabled ? '' : `${focusableClass} hover:bg-black/5 cursor-pointer`,
          optionBackground
        ]
          .join(' ')
          .trim()}
        tabIndex={disabled ? undefined : 0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (!disabled) {
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              event.stopPropagation()
              focusNext(event.currentTarget, true)
            } else if (event.key === 'ArrowDown') {
              event.preventDefault()
              event.stopPropagation()
              focusNext(event.currentTarget, false)
            } else if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault()
              event.stopPropagation()
              handleSelect()
            }
          }
        }}
      >
        {expandButton}
        <div className='flex flex-col'>
          <div
            className={['whitespace-nowrap', disabled ? 'text-neutral-400' : '']
              .join(' ')
              .trim()}
          >
            {option.label}
          </div>
          {option.description ? (
            <div
              className={[
                'whitespace-nowrap',
                'text-xs',
                disabled ? 'text-neutral-400' : 'text-neutral-500'
              ]
                .join(' ')
                .trim()}
            >
              {option.description}
            </div>
          ) : null}
        </div>
        {option.subLabel ? (
          <span
            className={[
              'text-xs',
              'pl-4',
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
        {option.match ? (
          <Tooltip text={`Suggested field from your CRM`} className='h-4'>
            <Star className='h-4 w-4 shrink-0 pl-3 fill-neutral-500' />
          </Tooltip>
        ) : null}
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
  if (
    option.description &&
    option.description.toLowerCase().includes(filter.toLowerCase())
  ) {
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
