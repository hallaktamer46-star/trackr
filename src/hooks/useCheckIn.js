import { useState, useEffect, useRef } from 'react'

const CHECKIN_KEY = 'trackr_checkin_pending'

export function useCheckIn() {
  const [checkInData, setCheckInData] = useState(null)
  const [, setTick] = useState(0)
  const tickRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (Date.now() < data.deadline) setCheckInData(data)
    } catch {}
  }, [])

  useEffect(() => {
    const onStart = (e) => setCheckInData(e.detail)
    const onClear = () => setCheckInData(null)
    window.addEventListener('trackr-checkin-start', onStart)
    window.addEventListener('trackr-checkin-clear', onClear)
    return () => {
      window.removeEventListener('trackr-checkin-start', onStart)
      window.removeEventListener('trackr-checkin-clear', onClear)
    }
  }, [])

  useEffect(() => {
    if (checkInData) {
      tickRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(tickRef.current)
    }
    return () => clearInterval(tickRef.current)
  }, [checkInData])

  return checkInData
}
