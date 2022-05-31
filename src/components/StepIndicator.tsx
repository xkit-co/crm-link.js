import React, { FC } from 'react'

interface StepIndicatorProps {
  currentStep: number
  maxSteps: number
}

const StepIndicator: FC<StepIndicatorProps> = ({ currentStep, maxSteps }) => (
  <div
    className='absolute top-0 left-0 h-1 bg-sky-600'
    style={{ width: `${(currentStep * 100) / maxSteps}%` }}
  ></div>
)

export default StepIndicator
