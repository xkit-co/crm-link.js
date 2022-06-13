import React, { FC } from 'react'

interface ButtonProps {
  text: string
  type: string
  onClick: () => void
}

const Button: FC<ButtonProps> = ({ text, type, onClick }) => {
  let colors: string[] = []
  switch (type) {
    case 'disabled':
      colors = ['bg-neutral-400']
      break
    case 'primary':
    default:
      colors = ['bg-sky-500', 'hover:bg-sky-600', 'active:bg-sky-700']
      break
  }

  return (
    <div
      className={[
        'text-center',
        'text-white',
        'rounded',
        'shadow-md',
        'py-2',
        'overflow-hidden',
        'whitespace-nowrap',
        'text-ellipsis',
        type === 'disabled' ? '' : 'cursor-pointer'
      ]
        .concat(colors)
        .join(' ')
        .trim()}
      onClick={onClick}
    >
      {text}
    </div>
  )
}

export default Button
