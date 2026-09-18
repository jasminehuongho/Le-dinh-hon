import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const DEFAULT_TOTAL_BUDGET = 200000000

export function useSettings() {
  const [totalBudget, setTotalBudget] = useState(DEFAULT_TOTAL_BUDGET)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle()
    if (err) setError(err.message)
    else {
      if (data) setTotalBudget(Number(data.total_budget))
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  const updateTotalBudget = useCallback(async (value) => {
    const { error: err } = await supabase.from('settings').upsert({ id: 1, total_budget: value })
    if (err) throw new Error(err.message)
  }, [])

  return { totalBudget, loading, error, updateTotalBudget }
}
