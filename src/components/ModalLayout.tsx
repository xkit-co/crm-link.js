import React, { FC } from 'react'
import XkitBranding from './XkitBranding'

interface ModalLayoutProps {
  title: string | React.ReactNode
  children: React.ReactNode
  removeBranding: boolean
  showBorder?: boolean
}

const ModalLayout: FC<ModalLayoutProps> = ({
  title,
  children,
  removeBranding,
  showBorder
}) => (
  <>
    <div className='text-lg py-2.5 px-6 overflow-hidden whitespace-nowrap text-ellipsis'>
      {title}
    </div>
    <div
      className={[
        'mt-4',
        removeBranding
          ? 'max-h-[calc(100%-104px)]'
          : 'max-h-[calc(100%-144px)]',
        'box-border',
        'overflow-y-auto',
        showBorder
          ? 'border-t border-b border-r-0 border-l-0 border-solid border-neutral-200'
          : ''
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </div>
    {removeBranding ? null : (
      <div className='w-full absolute bottom-0 left-0 py-2.5'>
        <XkitBranding />
      </div>
    )}
  </>
)

export default ModalLayout
