import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import ApplicationCard from './ApplicationCard'

const STATUS_COLOR = {
  wishlist:  '#94a3b8',
  applied:   '#38bdf8',
  interview: '#a78bfa',
  offer:     '#34d399',
  rejected:  '#fb7185',
}

export default function KanbanColumn({ status, label, applications, onAddCard, onEditCard, onDeleteCard }) {
  const color    = STATUS_COLOR[status]
  const archived = status === 'rejected'

  return (
    <div className={`flex flex-col min-w-0 transition-all ${archived ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>

      <div className="flex items-center justify-between pb-2 mb-2 border-b-2" style={{ borderColor: `${color}4D` }}>
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase font-mono truncate" style={{ color }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
            {String(applications.length).padStart(2, '0')}
          </span>
          <button
            onClick={() => onAddCard(status)}
            className="p-0.5 rounded text-slate-400 dark:text-slate-500 hover:text-sky-500 transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-24 rounded-lg p-1.5 transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-sky-50/60 dark:bg-sky-900/20 ring-1 ring-sky-200 dark:ring-sky-800'
                : 'bg-slate-100/60 dark:bg-slate-800/30'
            }`}
          >
            {applications.map((app, index) => (
              <ApplicationCard key={app.id} application={app} index={index} onEdit={onEditCard} onDelete={onDeleteCard} />
            ))}
            {provided.placeholder}
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center py-6">
                <p className="text-[9px] font-mono text-slate-300 dark:text-slate-600 uppercase tracking-widest">Empty</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
