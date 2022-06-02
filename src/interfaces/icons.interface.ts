export interface IconProps {
  className: string
  onClick?: (event: { stopPropagation: () => void }) => void
}
