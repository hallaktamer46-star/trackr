import { createContext, useContext, useState, useEffect } from 'react'

const SidebarCtx = createContext(null)

export const FLYOUT_W = 216  // 200px panel + 16px gap

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trackr_sidebar') ?? 'true') } catch { return true }
  })
  const [openFlyout, setOpenFlyout] = useState(null)

  useEffect(() => {
    try { localStorage.setItem('trackr_sidebar', JSON.stringify(open)) } catch {}
  }, [open])

  return (
    <SidebarCtx.Provider value={{
      open, toggle: () => setOpen(o => !o),
      openFlyout, setOpenFlyout,
      flyoutWidth: openFlyout ? FLYOUT_W : 0,
    }}>
      {children}
    </SidebarCtx.Provider>
  )
}

export const useSidebar = () => useContext(SidebarCtx)
