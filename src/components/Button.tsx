import React, { FC } from 'react'

interface ButtonProps {
  text: string | React.ReactNode
  type: string
  onClick: () => void
}

const Button: FC<ButtonProps> = ({ text, type, onClick }) => {
  let colors: string[] = []
  switch (type) {
    case 'secondary':
      colors = [
        'bg-slate-50',
        'hover:bg-slate-100',
        'active:bg-slate-200',
        'text-black'
      ]
      break
    case 'disabled':
      colors = ['bg-neutral-400', 'text-white']
      break
    case 'primary':
    default:
      colors = [
        'bg-sky-500',
        'hover:bg-sky-600',
        'active:bg-sky-700',
        'text-white'
      ]
      break
  }

  return (
    <div
      className={[
        'text-center',
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
