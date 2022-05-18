import React, { FC } from 'react'
import Cross from './icons/Cross'

interface ModalLayoutProps {
  closeModal: () => void
  title: string
  children: React.ReactNode
}

const ModalLayout: FC<ModalLayoutProps> = ({ closeModal, title, children }) => (
  <>
    <div className='flex justify-end box-border pt-2.5 pr-2.5 pb-3 w-full'>
      <Cross className='w-6 h-6 block cursor-pointer' onClick={closeModal} />
    </div>
    <div className='text-2xl pb-2.5 text-center overflow-hidden whitespace-nowrap text-ellipsis'>
      {title}
    </div>
    <div className='p-6 h-[calc(100%-82px)] box-border overflow-y-auto'>
      {children}
    </div>
  </>
)

export default ModalLayout
