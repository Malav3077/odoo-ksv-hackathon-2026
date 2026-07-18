const STYLES = {
  quotation: 'bg-yellow-100 text-yellow-800',
  quotation_sent: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-green-100 text-green-800',
  picked_up: 'bg-blue-100 text-blue-800',
  late_pickup: 'bg-red-100 text-red-800',
  returned: 'bg-green-100 text-green-800',
  late_return: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

const LABELS = {
  quotation: 'Quotation',
  quotation_sent: 'Sent',
  reserved: 'Reserved',
  picked_up: 'Picked up',
  late_pickup: 'Late pickup',
  returned: 'Returned',
  late_return: 'Late return',
  cancelled: 'Cancelled',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-gray-100 text-gray-600'
  const label = LABELS[status] || status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}
    >
      {label}
    </span>
  )
}
