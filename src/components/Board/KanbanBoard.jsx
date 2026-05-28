import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import { STATUSES, STATUS_CONFIG, useApplications } from '../../contexts/ApplicationContext'

export default function KanbanBoard({ onAddCard, onEditCard, onDeleteCard }) {
  const { applications, moveApplication } = useApplications()

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    if (destination.droppableId !== source.droppableId) {
      moveApplication(draggableId, destination.droppableId)
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-5 gap-2" style={{ minHeight: 'calc(100vh - 11rem)' }}>
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            label={STATUS_CONFIG[status].label}
            applications={applications.filter(a => a.status === status)}
            onAddCard={onAddCard}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
