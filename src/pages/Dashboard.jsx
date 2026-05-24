import { useState } from 'react'
import { Plus } from 'lucide-react'
import KanbanBoard from '../components/Board/KanbanBoard'
import ApplicationModal from '../components/Modals/ApplicationModal'
import FollowUpsBanner from '../components/Dashboard/FollowUpsBanner'
import StatsPanel from '../components/Dashboard/StatsPanel'
import { useApplications } from '../contexts/ApplicationContext'

export default function Dashboard() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [defaultStatus, setDefaultStatus] = useState('wishlist')

  const openAdd = (status = 'wishlist') => {
    setEditingApp(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  const openEdit = (app) => {
    setEditingApp(app)
    setModalOpen(true)
  }

  const handleSave = async (data) => {
    if (data.id) {
      await updateApplication(data.id, data)
    } else {
      // Use the status chosen in the modal form; fall back to the column's default
      await addApplication({ ...data, status: data.status || defaultStatus })
    }
  }

  const isEmpty = applications.length === 0

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Drag cards between columns to update status</p>
        </div>
        <button
          onClick={() => openAdd()}
          disabled={!canAddMore}
          title={!canAddMore ? 'Upgrade to add more applications' : undefined}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Application
        </button>
      </div>

      {!canAddMore && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
          You've reached the 10-application limit on the free plan.{' '}
          <a href="#upgrade" className="font-semibold underline">Upgrade to Trackr Pro</a> for unlimited applications and AI features.
        </div>
      )}

      <FollowUpsBanner onEditCard={openEdit} />
      <StatsPanel />

      {isEmpty ? (
        <EmptyState onAdd={() => openAdd()} />
      ) : (
        <KanbanBoard
          onAddCard={openAdd}
          onEditCard={openEdit}
          onDeleteCard={deleteApplication}
        />
      )}

      <ApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteApplication}
        initial={editingApp ? editingApp : { status: defaultStatus }}
      />
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
        <Plus size={28} className="text-sky-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Your job search starts here.</h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        Add your first application and start tracking your job hunt in one organised place.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Add your first application
      </button>
    </div>
  )
}
