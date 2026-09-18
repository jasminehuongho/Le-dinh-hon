import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else {
      setExpenses(data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExpenses()
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('expenses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenses()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchExpenses])

  const addExpense = useCallback(async (payload) => {
    const { error: err } = await supabase.from('expenses').insert(payload)
    if (err) throw new Error(err.message)
  }, [])

  const updateExpense = useCallback(async (id, payload) => {
    const { error: err } = await supabase.from('expenses').update(payload).eq('id', id)
    if (err) throw new Error(err.message)
  }, [])

  const deleteExpense = useCallback(async (id) => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', id)
    if (err) throw new Error(err.message)
  }, [])

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses }
}
