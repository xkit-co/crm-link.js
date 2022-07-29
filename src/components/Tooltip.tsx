import React, { FC, useEffect, useRef, useState } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

const Tooltip: FC<TooltipProps> = ({ text, children }) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    if (isVisible && targetRef.current && tooltipRef.current) {
      const targetBoundingRect = targetRef.current.getBoundingClientRect()
      const tooltipBoundingRect = tooltipRef.current.getBoundingClientRect()
      const middleOfTarget =
        targetBoundingRect.left + Math.floor(targetBoundingRect.width / 2)

      tooltipRef.current.style.bottom = `${
        document.documentElement.clientHeight - targetBoundingRect.top + 8
      }px`
      tooltipRef.current.style.left = `${
        middleOfTarget - Math.floor(tooltipBoundingRect.width / 2)
      }px`
    }
  }, [isVisible])

  return (
    <div
      ref={targetRef}
      className='block group'
      onMouseEnter={() => {
        setIsVisible(true)
      }}
      onMouseLeave={() => {
        setIsVisible(false)
      }}
    >
      <div
        ref={tooltipRef}
        className={[
          'block',
          'fixed',
          'py-1',
          'px-2',
          'text-sm',
          'bg-neutral-700',
          'text-white',
          'rounded',
          'w-max',
          'max-w-[250px]',
          'box-border',
          'pointer-events-none',
          'transition-all',
          isVisible ? 'visible' : 'invisible',
          isVisible ? 'opacity-100' : 'opacity-0'
        ]
          .join(' ')
          .trim()}
      >
        {text}
      </div>
      {children}
    </div>
  )
}

export default Tooltip
