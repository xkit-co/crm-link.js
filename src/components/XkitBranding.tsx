import React, { FC } from 'react'
import XkitLogo from './icons/XkitLogo'

const XkitBranding: FC<Record<string, never>> = () => (
  <a
    className={[
      'w-max',
      'mx-auto',
      'flex',
      'justify-center',
      'items-center',
      'no-underline',
      'grayscale',
      'text-neutral-800',
      'opacity-70',
      'hover:opacity-100',
      'hover:grayscale-0'
    ]
      .join(' ')
      .trim()}
    target='_blank'
    href={`https://xkit.co?utm_source=app&utm_campaign=crm_link`}
    rel='noopener noreferrer'
  >
    <div className='text-sm mr-1.5'>powered by</div>
    <div className='w-12 h-5 relative'>
      <XkitLogo className='absolute w-12 top-0 left-0' />
    </div>
  </a>
)

export default XkitBranding
