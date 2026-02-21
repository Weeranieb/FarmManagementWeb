import { th } from '../locales/th'

const L = th.farms

type StatusBadgeProps = {
  status: string
  className?: string
}

/**
 * Shared badge for active/maintenance (and fallback) status.
 * Active = green, maintenance = yellow, other = gray. Labels in Thai.
 */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const isActive = status === 'active'
  const isMaintenance = status === 'maintenance'
  const label = isActive
    ? L.statusActive
    : isMaintenance
      ? L.statusMaintenance
      : status
  const style = isActive
    ? 'bg-green-100 text-green-800'
    : isMaintenance
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs ${style} ${className}`.trim()}
    >
      {label}
    </span>
  )
}
