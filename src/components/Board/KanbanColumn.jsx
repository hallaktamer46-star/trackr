import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import ApplicationCard from './ApplicationCard'
import { cn } from '../../lib/cn'

const COLUMN_HEADER = {
  wishlist:  { dot: 'bg-slate-400',   count: 'bg-slate-100 text-slate-600' },
  applied:   { dot: 'bg-sky-400',     count: 'bg-sky-100 text-sky-700'    },
  interview: { dot: 'bg-violet-400',  count: 'bg-violet-100 text-violet-700' },
  offer:     { dot: 'bg-emerald-400', count: 'bg-emerald-100 text-emerald-700' },
  rejected:  { dot: 'bg-rose-400',    count: 'bg-rose-100 text-rose-700'  },
}

export default function KanbanColumn({ status, label, applications, onAddCard, onEditCard, onDeleteCard }) {
  const style = COLUMN_HEADER[status]

  return (
    <div className="flex flex-col min-w-[260px] max-w-[260px] w-[260px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', style.dot)} />
          <span className="font-semibold text-slate-700 text-sm">{label}</span>
          <span className={cn('text-xs font-semibold rounded-full px-1.5 py-0.5', style.count)}>
            {applications.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(status)}
          className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          title={`Add to ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-[120px] rounded-xl p-2 transition-colors',
              snapshot.isDraggingOver ? 'bg-sky-50 border-2 border-dashed border-sky-300' : 'bg-slate-100/60'
            )}
          >
            {applications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                application={app}
                index={index}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}

            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-xs text-slate-400">Drop cards here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
