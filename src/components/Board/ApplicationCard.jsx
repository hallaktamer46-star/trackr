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
          className="mb-2.5 cursor-grab active:cursor-grabbing"
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
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-300/60 dark:border-emerald-700/50 p-5 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.08)]">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold tracking-tight text-base text-slate-900 dark:text-slate-100">{app.company}</h3>
        <div className="flex items-center gap-1">
          {app.salary_range && <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{app.salary_range}</span>}
          <CardActions app={app} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{app.job_title}</p>
      <div className="w-full py-2 bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg text-center">
        View Offer Details
      </div>
    </div>
  )
}

function RejectedCard({ app, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl opacity-60 hover:opacity-80 transition-opacity">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold tracking-tight text-sm text-slate-500 dark:text-slate-400">{app.company}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{app.job_title}</p>
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
    <div className={`bg-white dark:bg-slate-900 border ${accentBorder} p-4 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none`}>
      {app.status === 'applied' && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-sky-400/10 rotate-45 translate-x-4 -translate-y-4" />
      )}
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold tracking-tight text-sm text-slate-900 dark:text-slate-100">{app.company}</h3>
        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          {app.salary_range && (
            <span className={`text-[10px] font-mono font-semibold mr-1 ${
              app.status === 'applied'   ? 'text-sky-600 dark:text-sky-400' :
              app.status === 'interview' ? 'text-violet-600 dark:text-violet-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>{app.salary_range}</span>
          )}
          <CardActions app={app} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{app.job_title}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {shortDate && (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
              {shortDate}
            </span>
          )}
          {app.url && (
            <a href={app.url} target="_blank" rel="noreferrer"
              onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
              className="text-[10px] text-sky-500 hover:text-sky-400 flex items-center gap-0.5">
              <ExternalLink size={10} /> Link
            </a>
          )}
        </div>
        {app.status === 'interview' && (
          <span className="text-[10px] bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded font-mono">
            Interviewing
          </span>
        )}
        {app.status === 'applied' && (
          <span className="text-[9px] uppercase tracking-tighter text-slate-400 dark:text-slate-500 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded">
            Pending
          </span>
        )}
      </div>
      {reminderDue && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg px-2 py-1">
          <Bell size={11} /> Follow-up due
        </div>
      )}
      {app.notes && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{app.notes}</p>}
    </div>
  )
}

function CardActions({ app, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-0.5">
      <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onEdit(app) }}
        className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors">
        <Edit2 size={12} />
      </button>
      <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onDelete(app.id) }}
        className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
        <Trash2 size={12} />
      </button>
    </div>
  )
}
