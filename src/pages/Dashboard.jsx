import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, CheckCircle2, X } from 'lucide-react'
import KanbanBoard from '../components/Board/KanbanBoard'
import ApplicationModal from '../components/Modals/ApplicationModal'
import FollowUpsBanner from '../components/Dashboard/FollowUpsBanner'
import { useApplications } from '../contexts/ApplicationContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Dashboard() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [defaultStatus, setDefaultStatus] = useState('wishlist')
  const [searchParams, setSearchParams]   = useSearchParams()
  const [successBanner, setSuccessBanner] = useState(false)

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setSuccessBanner(true)
      setSearchParams({}, { replace: true })
      if (isSupabaseConfigured) supabase.auth.refreshSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = (status = 'wishlist') => {
    setEditingApp(null); setDefaultStatus(status); setModalOpen(true)
  }
  const openEdit = (app) => { setEditingApp(app); setModalOpen(true) }

  const handleSave = async (data) => {
    if (data.id) await updateApplication(data.id, data)
    else await addApplication({ ...data, status: data.status || defaultStatus })
  }

  return (
    <div className="relative">

      {/* Checkout success banner */}
      {successBanner && (
        <div className="mb-5 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span className="flex-1 font-medium">Welcome to Trackr Pro! All AI features are now unlocked.</span>
          <button onClick={() => setSuccessBanner(false)} className="text-emerald-400 hover:text-emerald-600"><X size={15} /></button>
        </div>
      )}

      {/* Limit banner */}
      {!canAddMore && (
        <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-sm text-amber-800 dark:text-amber-300">
          You've reached the 10-application limit.{' '}
          <a href="/ai/cv" className="font-semibold underline">Upgrade to Pro</a> for unlimited applications.
        </div>
      )}

      <FollowUpsBanner onEditCard={openEdit} />

      {applications.length === 0 ? (
        <EmptyState onAdd={() => openAdd()} />
      ) : (
        <KanbanBoard onAddCard={openAdd} onEditCard={openEdit} onDeleteCard={deleteApplication} />
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
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <button onClick={onAdd} className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center mb-5 transition-all hover:scale-105">
        <Plus size={28} className="text-slate-400 dark:text-slate-500" />
      </button>
      <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-2">Pipeline Empty</p>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Your job search starts here.</h2>
      <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mb-8">
        Add your first application and start tracking your hunt in one organised place.
      </p>
      <button
        onClick={onAdd}
        className="h-11 pl-4 pr-5 gap-2 bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center font-medium text-sm transition-all hover:scale-[1.02]"
      >
        <Plus size={15} /> Add your first application
      </button>
    </div>
  )
}
