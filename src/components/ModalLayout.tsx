import React, { FC } from 'react'

interface ModalLayoutProps {
  title: string | React.ReactNode
  children: React.ReactNode
}

const ModalLayout: FC<ModalLayoutProps> = ({ title, children }) => (
  <>
    <div className='text-lg py-2.5 px-6 overflow-hidden whitespace-nowrap text-ellipsis'>
      {title}
    </div>
    <div className='pt-4 h-[calc(100%-88px)] box-border overflow-y-auto'>
      {children}
    </div>
  </>
)

export default ModalLayout
