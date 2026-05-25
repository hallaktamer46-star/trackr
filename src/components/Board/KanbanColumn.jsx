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
  const color = STATUS_COLOR[status]
  const archived = status === 'rejected'

  return (
    <div className={`flex flex-col w-72 shrink-0 transition-all ${archived ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>

      {/* Column header */}
      <div
        className="flex items-center justify-between pb-2.5 mb-3 border-b-2"
        style={{ borderColor: `${color}4D` }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase font-mono"
          style={{ color }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">
            {String(applications.length).padStart(2, '0')}
          </span>
          <button
            onClick={() => onAddCard(status)}
            className="p-0.5 rounded text-slate-400 hover:text-sky-500 transition-colors"
            title={`Add to ${label}`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-32 rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-sky-50/60 ring-1 ring-sky-200' : 'bg-slate-50/40'
            }`}
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
              <div className="flex items-center justify-center py-8">
                <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Empty</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
