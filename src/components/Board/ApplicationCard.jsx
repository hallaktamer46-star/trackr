import { Draggable } from '@hello-pangea/dnd'
import { Calendar, ExternalLink, Bell, Trash2, Edit2 } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { cn } from '../../lib/cn'

const STATUS_CARD_STYLE = {
  wishlist:  'border-slate-200  bg-white',
  applied:   'border-sky-200    bg-sky-50/40',
  interview: 'border-violet-200 bg-violet-50/40',
  offer:     'border-emerald-200 bg-emerald-50/40',
  rejected:  'border-rose-200   bg-rose-50/40',
}

const STATUS_BADGE = {
  wishlist:  'bg-slate-100  text-slate-600',
  applied:   'bg-sky-100    text-sky-700',
  interview: 'bg-violet-100 text-violet-700',
  offer:     'bg-emerald-100 text-emerald-700',
  rejected:  'bg-rose-100   text-rose-700',
}

export default function ApplicationCard({ application, index, onEdit, onDelete }) {
  const reminderDue = application.reminder_date && (
    isToday(parseISO(application.reminder_date)) || isPast(parseISO(application.reminder_date))
  )

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'rounded-xl border p-3.5 mb-2.5 cursor-grab active:cursor-grabbing transition-shadow',
            STATUS_CARD_STYLE[application.status],
            snapshot.isDragging ? 'shadow-lg rotate-1' : 'shadow-sm hover:shadow-md',
          )}
        >
          {/* Company + actions */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{application.company}</p>
              <p className="text-slate-500 text-xs truncate mt-0.5">{application.job_title}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onEdit(application) }}
                className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              >
                <Edit2 size={13} />
              </button>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onDelete(application.id) }}
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {application.date_applied && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={11} />
                {format(parseISO(application.date_applied), 'MMM d')}
              </span>
            )}
            {application.url && (
              <a
                href={application.url}
                target="_blank"
                rel="noreferrer"
                onPointerDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700"
              >
                <ExternalLink size={11} />
                Job post
              </a>
            )}
            {application.salary_range && (
              <span className="text-xs text-emerald-600 font-medium">{application.salary_range}</span>
            )}
          </div>

          {/* Reminder badge */}
          {reminderDue && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              <Bell size={11} />
              Follow-up due
            </div>
          )}

          {/* Notes snippet */}
          {application.notes && (
            <p className="mt-2 text-xs text-slate-400 line-clamp-2">{application.notes}</p>
          )}
        </div>
      )}
    </Draggable>
  )
}
