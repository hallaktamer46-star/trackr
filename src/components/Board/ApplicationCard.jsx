import { Draggable } from '@hello-pangea/dnd'
import { Bell, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'

export default function ApplicationCard({ application, index, onEdit, onDelete }) {
  const app = application
  const reminderDue = app.reminder_date && (
    isToday(parseISO(app.reminder_date)) || isPast(parseISO(app.reminder_date))
  )
  const shortDate = app.date_applied ? format(parseISO(app.date_applied), 'MMM d') : null

  return (
    <Draggable draggableId={app.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(app)}
          style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.4 : 1 }}
          className="mb-1.5 cursor-grab active:cursor-grabbing"
        >
          {app.status === 'offer'    && <OfferCard    app={app} onEdit={onEdit} onDelete={onDelete} />}
          {app.status === 'rejected' && <RejectedCard app={app} onEdit={onEdit} onDelete={onDelete} />}
          {!['offer','rejected'].includes(app.status) && (
            <DefaultCard app={app} onEdit={onEdit} onDelete={onDelete} shortDate={shortDate} reminderDue={reminderDue} />
          )}
        </div>
      )}
    </Draggable>
  )
}

function OfferCard({ app, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-300/60 dark:border-emerald-700/50 p-3 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.07)]">
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="font-bold tracking-tight text-xs text-slate-900 dark:text-slate-100 truncate flex-1 mr-1">{app.company}</h3>
        <CardActions app={app} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2.5">{app.job_title}</p>
      {app.salary_range && (
        <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mb-2">{app.salary_range}</p>
      )}
      <div className="w-full py-1.5 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-widest rounded text-center">
        Offer Received
      </div>
    </div>
  )
}

function RejectedCard({ app, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg opacity-60 hover:opacity-80 transition-opacity">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 mr-1">
          <h3 className="font-bold tracking-tight text-xs text-slate-500 dark:text-slate-400 truncate">{app.company}</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{app.job_title}</p>
        </div>
        <CardActions app={app} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

function DefaultCard({ app, onEdit, onDelete, shortDate, reminderDue }) {
  const accentBorder =
    app.status === 'applied'
      ? 'border-sky-200/60 dark:border-sky-800/60'
      : app.status === 'interview'
        ? 'border-violet-200/60 dark:border-violet-800/60 ring-1 ring-violet-100 dark:ring-violet-900/30'
        : 'border-slate-200 dark:border-slate-700'

  return (
    <div className={`bg-white dark:bg-slate-900 border ${accentBorder} p-3 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none`}>

      {/* Top row: company + actions */}
      <div className="flex justify-between items-start mb-0.5">
        <h3 className="font-bold tracking-tight text-xs text-slate-900 dark:text-slate-100 truncate flex-1 mr-1">
          {app.company}
        </h3>
        <CardActions app={app} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Job title */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2 leading-tight">
        {app.job_title}
      </p>

      {/* Bottom row: date + salary OR status badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {shortDate && (
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono shrink-0">
              {shortDate}
            </span>
          )}
          {app.salary_range && (
            <span className={`text-[9px] font-mono font-bold truncate ${
              app.status === 'applied'   ? 'text-sky-600 dark:text-sky-400' :
              app.status === 'interview' ? 'text-violet-600 dark:text-violet-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>{app.salary_range}</span>
          )}
        </div>

        {app.status === 'interview' && (
          <span className="text-[9px] bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded font-mono shrink-0">
            Interview
          </span>
        )}
        {app.status === 'applied' && (
          <span className="text-[9px] uppercase tracking-tighter text-slate-400 dark:text-slate-500 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded shrink-0">
            Pending
          </span>
        )}
        {app.url && (
          <a href={app.url} target="_blank" rel="noreferrer"
            onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
            className="text-[9px] text-sky-500 hover:text-sky-400 flex items-center gap-0.5 shrink-0">
            <ExternalLink size={9} />
          </a>
        )}
      </div>

      {/* Reminder banner */}
      {reminderDue && (
        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded px-1.5 py-0.5">
          <Bell size={9} /> Follow-up due
        </div>
      )}
    </div>
  )
}

function CardActions({ app, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-0 shrink-0">
      <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onEdit(app) }}
        className="p-0.5 rounded text-slate-300 dark:text-slate-600 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
        <Edit2 size={11} />
      </button>
      <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onDelete(app.id) }}
        className="p-0.5 rounded text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
        <Trash2 size={11} />
      </button>
    </div>
  )
}
