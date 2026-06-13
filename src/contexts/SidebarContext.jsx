import { createContext, useContext, useState, useEffect } from 'react'

const SidebarCtx = createContext(null)

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trackr_sidebar') ?? 'true') } catch { return true }
  })
  useEffect(() => {
    try { localStorage.setItem('trackr_sidebar', JSON.stringify(open)) } catch {}
  }, [open])
  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen(o => !o) }}>
      {children}
    </SidebarCtx.Provider>
  )
}

export const useSidebar = () => useContext(SidebarCtx)
