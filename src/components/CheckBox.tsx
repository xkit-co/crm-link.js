import React, { FC } from 'react'

interface CheckBoxProps {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}

const CheckBox: FC<CheckBoxProps> = ({
  label,
  checked,
  disabled,
  onChange
}) => (
  <div className='pt-2 flex items-center gap-2'>
    <input
      className={[
        'appearance-none',
        'h-4',
        'w-4',
        'shrink-0',
        'border',
        'border-solid',
        'border-neutral-300',
        'rounded-sm',
        'checked:bg-check-box',
        'focus:outline-none',
        'transition',
        disabled ? 'cursor-default' : 'cursor-pointer',
        disabled ? 'bg-neutral-200' : 'bg-white',
        disabled ? 'checked:bg-sky-300' : 'checked:bg-sky-600',
        disabled ? 'checked:border-sky-300' : 'checked:border-sky-600'
      ]
        .join(' ')
        .trim()}
      type='checkbox'
      checked={checked}
      onChange={(event) => {
        if (!disabled) {
          onChange(event.target.checked)
        }
      }}
    />
    <div className='text-xs'>{label}</div>
  </div>
)

export default CheckBox
