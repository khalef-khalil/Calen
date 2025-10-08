import { TaskStatus } from '@/types/task'

export function getTaskStatusBadge(status: TaskStatus): { label: string; classes: string; icon: string } {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        classes: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓'
      }
    case 'skipped':
      return {
        label: 'Skipped',
        classes: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '⊘'
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        classes: 'bg-red-100 text-red-800 border-red-200',
        icon: '✕'
      }
    case 'pending':
      return {
        label: 'Pending',
        classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⋯'
      }
    case 'scheduled':
    default:
      return {
        label: 'Scheduled',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '◷'
      }
  }
}

export function getTaskOpacity(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'opacity-75'
    case 'skipped':
    case 'cancelled':
      return 'opacity-60'
    default:
      return 'opacity-100'
  }
}

export function shouldStrikethrough(status: TaskStatus): boolean {
  return status === 'cancelled' || status === 'skipped'
}

