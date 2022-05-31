import React, { FC, useLayoutEffect, useRef, useState } from 'react'
import Caret from './icons/Caret'

interface AccordionProps {
  label: string
  isFirstItem: boolean
  children?: React.ReactNode
}

const Accordion: FC<AccordionProps> = ({ label, isFirstItem, children }) => {
  const [expanded, setExpanded] = useState<boolean>(false)
  const [expandedHeight, setExpandedHeight] = useState<number>(0)
  const accordionContent = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (accordionContent.current) {
      setExpandedHeight(accordionContent.current.scrollHeight)
    }
  }, [])

  return (
    <>
      <div
        className={[
          'py-3',
          'px-6',
          'flex',
          'justify-between',
          'items-center',
          'border-solid',
          'border-b-0',
          'border-r-0',
          'border-l-0',
          'border-neutral-200',
          'cursor-pointer',
          'hover:bg-neutral-100',
          'active:bg-neutral-200',
          isFirstItem ? 'border-t' : 'border-t-0'
        ]
          .join(' ')
          .trim()}
        tabIndex={0}
        onClick={() => {
          if (expanded) {
            if (accordionContent.current) {
              const element = accordionContent.current
              if (element.scrollHeight !== expandedHeight) {
                setExpandedHeight(element.scrollHeight)
              }
              element.style.height = `${element.scrollHeight}px` // We do this because the height will not show a transition if it is `auto`. See comment below.
              setTimeout(() => {
                element.style.height = '0px' // This is in a setTimeout so that the transition for the above change can complete
              }, 150)
            }
            setExpanded(false)
          } else {
            if (accordionContent.current) {
              const element = accordionContent.current
              element.style.height = `${expandedHeight}px`
              setTimeout(() => {
                element.style.height = `auto` // We need to do this so that the height can dynamically change later on
              }, 150)
            }
            setExpanded(true)
          }
        }}
      >
        <div className='overflow-hidden whitespace-nowrap text-ellipsis pr-2'>
          {label}
        </div>
        <Caret
          className={['h-4', 'w-4', 'shrink-0', expanded ? 'rotate-180' : '']
            .join(' ')
            .trim()}
        />
      </div>
      <div
        className={[
          expanded ? '' : 'h-0',
          'transition-[height]',
          'overflow-hidden',
          'border-b',
          'border-t-0',
          'border-r-0',
          'border-l-0',
          'border-solid',
          'border-neutral-200'
        ]
          .join(' ')
          .trim()}
        ref={accordionContent}
      >
        {children}
      </div>
    </>
  )
}

export default Accordion
