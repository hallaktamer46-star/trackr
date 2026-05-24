import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ApplicationContext = createContext(null)

export const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected']

export const STATUS_CONFIG = {
  wishlist:  { label: 'Wishlist',  color: 'bg-slate-100  border-slate-300  text-slate-700'  },
  applied:   { label: 'Applied',   color: 'bg-sky-50     border-sky-300    text-sky-700'    },
  interview: { label: 'Interview', color: 'bg-violet-50  border-violet-300 text-violet-700' },
  offer:     { label: 'Offer',     color: 'bg-emerald-50 border-emerald-300 text-emerald-700'},
  rejected:  { label: 'Rejected',  color: 'bg-rose-50    border-rose-300   text-rose-700'   },
}

const STORAGE_KEY = 'trackr_applications'

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToStorage(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
}

function reducer(state, action) {
  let next
  switch (action.type) {
    case 'SET':
      return action.payload

    case 'ADD':
      next = [...state, action.payload]
      if (!isSupabaseConfigured) saveToStorage(next)
      return next

    case 'UPDATE':
      next = state.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a)
      if (!isSupabaseConfigured) saveToStorage(next)
      return next

    case 'DELETE':
      next = state.filter(a => a.id !== action.payload)
      if (!isSupabaseConfigured) saveToStorage(next)
      return next

    case 'MOVE':
      next = state.map(a => a.id === action.payload.id ? { ...a, status: action.payload.status } : a)
      if (!isSupabaseConfigured) saveToStorage(next)
      return next

    default:
      return state
  }
}

export function ApplicationProvider({ children }) {
  const { user } = useAuth()
  const [applications, dispatch] = useReducer(reducer, [])

  useEffect(() => {
    if (!user) return

    if (!isSupabaseConfigured) {
      dispatch({ type: 'SET', payload: loadFromStorage() })
      return
    }

    supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) dispatch({ type: 'SET', payload: data })
      })
  }, [user])

  const addApplication = useCallback(async (data) => {
    const app = {
      id: crypto.randomUUID(),
      user_id: user.id,
      company: data.company,
      job_title: data.job_title,
      date_applied: data.date_applied || null,
      url: data.url || '',
      salary_range: data.salary_range || '',
      notes: data.notes || '',
      status: data.status || 'wishlist',
      reminder_date: data.reminder_date || null,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase.from('applications').insert(app).select().single()
      if (!error) dispatch({ type: 'ADD', payload: inserted })
    } else {
      dispatch({ type: 'ADD', payload: app })
    }
  }, [user])

  const updateApplication = useCallback(async (id, data) => {
    dispatch({ type: 'UPDATE', payload: { id, ...data } })
    if (isSupabaseConfigured) {
      await supabase.from('applications').update(data).eq('id', id)
    }
  }, [])

  const deleteApplication = useCallback(async (id) => {
    dispatch({ type: 'DELETE', payload: id })
    if (isSupabaseConfigured) {
      await supabase.from('applications').delete().eq('id', id)
    }
  }, [])

  const moveApplication = useCallback(async (id, newStatus) => {
    dispatch({ type: 'MOVE', payload: { id, status: newStatus } })
    if (isSupabaseConfigured) {
      await supabase.from('applications').update({ status: newStatus }).eq('id', id)
    }
  }, [])

  const isPaidUser = user?.user_metadata?.is_paid || !isSupabaseConfigured
  const canAddMore = !isSupabaseConfigured || isPaidUser || applications.length < 10

  return (
    <ApplicationContext.Provider value={{
      applications,
      addApplication,
      updateApplication,
      deleteApplication,
      moveApplication,
      isPaidUser,
      canAddMore,
    }}>
      {children}
    </ApplicationContext.Provider>
  )
}

export const useApplications = () => useContext(ApplicationContext)
