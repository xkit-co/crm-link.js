import React, { FC } from 'react'

interface PillProps {
  className?: string
  color: string
  text: string
}

const Pill: FC<PillProps> = ({ className, color, text }) => {
  let colors: string[] = []
  switch (color) {
    case 'orange':
      colors = ['text-orange-800', 'bg-orange-100']
      break
    case 'green':
    default:
      colors = ['text-emerald-800', 'bg-emerald-100']
      break
  }

  return (
    <div
      className={[
        className ?? '',
        'px-1.5',
        'uppercase',
        'text-xs',
        'rounded-sm'
      ]
        .concat(colors)
        .join(' ')
        .trim()}
    >
      {text}
    </div>
  )
}

export default Pill
